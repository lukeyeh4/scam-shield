import { checkLink, SHORTENERS, siteOf } from '../../src/tools/linkCheck'
import type { LinkFacts } from '../../src/tools/linkLookup'
import { answerKid, readEntries } from './ask'
import { judgePage, readPage } from './page'
import { charactersUsed, makeSpeech, MAX_SPEECH, MONTHLY_LIMIT, readSpeech, savedSpeech } from './speak'

// The link checker's server (a Cloudflare Worker): looks a link up in places the
// device can't reach, and keeps the keys secret. Only when none of that finds
// anything does it read the page itself and ask Claude about it (page.ts). It
// never keeps the links it's sent. It only answers with facts; the app turns them
// into kid words (src/tools/linkLookup.ts).
// It also answers questions kids ask Shield Buddy in the chat (ask.ts), and gives
// Buddy its voice (speak.ts).
//
// POST /link { url } → LinkFacts
// POST /ask { entries } → BuddyAnswer
// POST /speak { text } → MP3 audio
// GET /usage → this month's speech characters, and the limit

type Env = {
  // Google Safe Browsing API key: `wrangler secret put SAFE_BROWSING_KEY` (or .dev.vars)
  SAFE_BROWSING_KEY: string
  // Claude API key, for reading pages and Buddy's answers: `wrangler secret put ANTHROPIC_API_KEY`
  ANTHROPIC_API_KEY?: string
  // Websites allowed to ask, separated by commas (any localhost is always allowed)
  ALLOWED_ORIGINS: string
  // Checks per minute for each person (wrangler.toml), since each AI check costs money
  LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> }
  // Google Cloud Text-to-Speech key, for Buddy's voice: `wrangler secret put GOOGLE_TTS_KEY`
  GOOGLE_TTS_KEY?: string
  // Buddy's saved audio and this month's character count (wrangler.toml, speak.ts)
  SPEECH?: Parameters<typeof savedSpeech>[1]
}

const DAY = 24 * 60 * 60 * 1000

const MAX_HOPS = 5
// Some services (e.g. rdap.org) turn away requests that don't say who's asking
const headers = { 'user-agent': 'ScamShield-LinkChecker/1.0 (+https://lukeyeh4.github.io/scam-shield/)' }
const timeout = (ms: number) => AbortSignal.timeout(ms)
const hostOf = (url: string) => new URL(url).hostname.replace(/\.$/, '')
const isIp = (host: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')

// Follows short links (bit.ly, ...) to the real address, without loading the page.
// Only short links: following any link could tell a scammer it was clicked.
async function followShortLinks(url: string) {
  const hops = [url]
  let current = url
  let warns = false
  while (hops.length <= MAX_HOPS && SHORTENERS.has(siteOf(hostOf(current)))) {
    try {
      const res = await fetch(current, { redirect: 'manual', headers, signal: timeout(3000) })
      const next = res.headers.get('location')
      if (res.ok) {
        // A page instead of a redirect: the service's own warning about this link?
        warns = /<title>[^<]*warning/i.test((await res.text()).slice(0, 2000))
        break
      }
      await res.body?.cancel()
      if (res.status < 300 || res.status >= 400 || !next) break
      current = new URL(next, current).href
      if (!/^https?:$/.test(new URL(current).protocol)) break
      // tinyurl sends links it has blocked to its own "nospam" page
      if (/^https?:\/\/(www\.)?tinyurl\.com\/app\/nospam\//i.test(current)) {
        warns = true
        break
      }
      hops.push(current)
    } catch {
      break
    }
  }
  return { hops, warns }
}

// Google Safe Browsing: is any of these links on the list of dangerous websites?
async function safeBrowsing(urls: string[], key: string): Promise<LinkFacts['listed']> {
  const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    signal: timeout(4000),
    body: JSON.stringify({
      client: { clientId: 'scam-shield', clientVersion: '1.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: urls.map((url) => ({ url })),
      },
    }),
  })
  if (!res.ok) throw new Error(`Safe Browsing: ${res.status}`)
  const data = (await res.json()) as { matches?: { threatType: string; threat: { url: string } }[] }
  return (data.matches ?? []).map((m) => ({ url: m.threat.url, threat: m.threatType }))
}

// IANA's list of which registry keeps the records for each ending (.com, .xyz, ...),
// fetched once and kept while the Worker runs
let registries: Promise<Map<string, string>> | null = null
function registryFor(ending: string) {
  registries ??= fetch('https://data.iana.org/rdap/dns.json', { headers, signal: timeout(4000) })
    .then((res) => res.json() as Promise<{ services: [string[], string[]][] }>)
    .then((data) => new Map(data.services.flatMap(([endings, [base]]) => endings.map((e) => [e, base] as const))))
    .catch((error) => {
      registries = null
      throw error
    })
  return registries.then((map) => map.get(ending))
}

// RDAP (the public record of who registered a website, and when), straight from
// the registry: when was it made? Tries twice, since registries can be busy.
async function created(site: string) {
  const base = await registryFor(site.split('.').pop()!)
  // Some endings (e.g. .gg) have no public records
  if (!base) return null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${base.replace(/\/?$/, '/')}domain/${site}`, {
        headers: { ...headers, accept: 'application/rdap+json' },
        signal: timeout(3000),
      })
      // Not registered: nothing to say (DNS will say it doesn't exist)
      if (res.status === 404) return null
      if (!res.ok) continue
      const data = (await res.json()) as { events?: { eventAction: string; eventDate: string }[] }
      return data.events?.find((e) => e.eventAction === 'registration')?.eventDate ?? null
    } catch {
      // Try again
    }
  }
  return null
}

// DNS: does the website's name exist? (Status 3 means no such name)
async function exists(host: string) {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`, {
    headers: { ...headers, accept: 'application/dns-json' },
    signal: timeout(3000),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { Status: number }
  return data.Status !== 3
}

// Any lookup that fails or is slow just leaves its fact out
const settle = <T>(p: Promise<T>, fallback: T) => p.catch(() => fallback)

async function lookUp(url: string, env: Env): Promise<LinkFacts> {
  const { hops, warns } = await followShortLinks(url)
  const finalUrl = hops[hops.length - 1]
  const host = hostOf(finalUrl)
  const [listed, made, found] = await Promise.all([
    settle(safeBrowsing(hops, env.SAFE_BROWSING_KEY), []),
    isIp(host) ? null : settle(created(siteOf(host)), null),
    isIp(host) ? true : settle(exists(host), null),
  ])
  const facts: LinkFacts = { finalUrl, shortenerWarns: warns, listed, created: made, exists: found, page: null }

  // Nothing strong found so far (only small clues, like a free website maker or
  // http), and not a real brand's own website: read the page
  const device = checkLink(finalUrl)
  const nothingFound =
    device !== null &&
    device.risk !== 'high' &&
    !device.good?.length &&
    !listed.length &&
    !warns &&
    found !== false &&
    !(made && Date.now() - Date.parse(made) < 180 * DAY)
  if (nothingFound && env.ANTHROPIC_API_KEY) {
    const page = await settle(readPage(finalUrl, headers), null)
    if (page && (page.text || page.passwordBoxes || page.cardBoxes)) {
      facts.page = await settle(judgePage(page, env.ANTHROPIC_API_KEY), null)
    }
  }
  return facts
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('origin') ?? ''
  const allowed =
    env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).includes(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  return allowed
    ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type', vary: 'origin' }
    : {}
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env)
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' } })

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const path = new URL(request.url).pathname

    // How much of this month's speech allowance is used (open it in a browser)
    if (request.method === 'GET' && path === '/usage') {
      if (!env.SPEECH) return json({ error: 'No speech storage' }, 503)
      const characters = await charactersUsed(env.SPEECH)
      return json({ month: new Date().toISOString().slice(0, 7), characters, limit: MONTHLY_LIMIT, left: Math.max(0, MONTHLY_LIMIT - characters) })
    }

    if (request.method !== 'POST' || !['/link', '/ask', '/speak'].includes(path)) return json({ error: 'Not found' }, 404)
    if (!cors['access-control-allow-origin']) return json({ error: 'Not allowed' }, 403)
    const who = request.headers.get('cf-connecting-ip') ?? 'unknown'
    const limited = async () => env.LIMITER && !(await env.LIMITER.limit({ key: who })).success

    // Buddy's voice: a line spoken before is replayed for free (and doesn't count
    // toward the per-minute limit); a new one is made, within the month's limit
    if (path === '/speak') {
      if (!env.SPEECH || !env.GOOGLE_TTS_KEY) return json({ error: 'No voice' }, 503)
      const text = readSpeech(await request.json().catch(() => null))
      if (!text) return json({ error: `Send { "text": "..." } (at most ${MAX_SPEECH} characters)` }, 400)
      const audio = (await savedSpeech(text, env.SPEECH)) ?? ((await limited()) ? 'busy' : await makeSpeech(text, env.SPEECH, env.GOOGLE_TTS_KEY).catch(() => null))
      if (audio === 'busy') return json({ error: 'Too many checks' }, 429)
      if (audio === 'limit') return json({ error: "This month's speech is used up" }, 429)
      if (!audio) return json({ error: 'No speech' }, 502)
      return new Response(audio, { headers: { ...cors, 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=31536000, immutable' } })
    }

    if (await limited()) return json({ error: 'Too many checks' }, 429)

    if (path === '/ask') {
      if (!env.ANTHROPIC_API_KEY) return json({ error: 'No AI' }, 503)
      const entries = readEntries(await request.json().catch(() => null))
      if (!entries) return json({ error: 'Send { "entries": [..., { "from": "kid", "text": "..." }] }' }, 400)
      const answer = await answerKid(entries, env.ANTHROPIC_API_KEY).catch(() => null)
      return answer ? json(answer) : json({ error: 'No answer' }, 502)
    }

    let url: string
    try {
      const body = (await request.json()) as { url?: unknown }
      if (typeof body.url !== 'string' || body.url.length > 2048) throw new Error()
      const parsed = new URL(body.url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
      url = parsed.href
    } catch {
      return json({ error: 'Send { "url": "https://..." }' }, 400)
    }
    return json(await lookUp(url, env))
  },
}
