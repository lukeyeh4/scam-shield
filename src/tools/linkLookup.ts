import { isSetUp } from '../setup'
import type { Clue } from './examples'
import { brandNamed } from './brands'
import { checkLink, type LinkCheck, onFreeHost } from './linkCheck'

// The link checker's second layer: asks our small server (`worker/`) what it can
// find out about a link (Google's list of dangerous websites, how new the website
// is, where a short link really goes and, when none of that finds anything, what
// Claude sees on the page), then adds those facts to the device's clues in kid
// words. If there's no server, or it's slow or down, or a grown-up hasn't finished
// setup (setup.ts: nothing is sent before that), the device's clues are shown on
// their own.

// The server's address: set VITE_LINK_SERVER in .env.production (and in
// .env.development.local for `npm run dev`, e.g. http://localhost:8787)
const SERVER: string | undefined = import.meta.env.VITE_LINK_SERVER

export const canLookUp = Boolean(SERVER)

// What the server answers (worker/src/index.ts)
export type LinkFacts = {
  // Where the link really goes, after following short links
  finalUrl: string
  // The short link service shows its own warning page instead of going on (bit.ly does)
  shortenerWarns: boolean
  // Links on Google's list of dangerous websites, and why they're on it
  listed: { url: string; threat: string }[]
  // When the website was made (ISO date), if the registry says
  created: string | null
  // Whether the website's name exists at all (null if the lookup failed)
  exists: boolean | null
  // What Claude saw on the page (worker/src/page.ts); null if it wasn't read
  page: PageFacts | null
}

export type PageFacts = {
  // A brand the page copies, although it isn't that brand's website
  copiesBrand: string | null
  asksFor: ('password' | 'card' | 'login code' | 'phone number' | 'home address' | 'money or gift cards')[]
  freePrize: boolean
  // Prices far too low to be real (a fake shop)
  unbelievableDeal: boolean
  // Wants you to download or install something, or turn off antivirus
  download: boolean
  // Gives away paid sports, shows, movies or games for free (unlicensed streams)
  freeStreams: boolean
  // Pop-up ads, fake buttons, ads that redirect (or a known pop-up ad network)
  trickyAds: boolean
  rushesYou: boolean
  gambling: boolean
  adult: boolean
}

// What each thing a page asks for is called, for kids
const ASKS: Record<PageFacts['asksFor'][number], string> = {
  password: 'your password',
  card: 'card details',
  'login code': 'a login code',
  'phone number': 'your phone number',
  'home address': 'your home address',
  'money or gift cards': 'money or gift cards',
}

// Asks the server about a link; null if it can't answer in time
export async function lookUpLink(url: string): Promise<LinkFacts | null> {
  if (!SERVER || !isSetUp()) return null
  try {
    const res = await fetch(`${SERVER}/link`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
      // Reading the page with AI can take a few seconds
      signal: AbortSignal.timeout(12000),
    })
    return res.ok ? ((await res.json()) as LinkFacts) : null
  } catch {
    return null
  }
}

const DAY = 24 * 60 * 60 * 1000

// How long ago, in kid words: "today", "3 days ago", "2 months ago"
function ago(days: number) {
  if (days < 1) return 'today'
  if (days < 2) return 'yesterday'
  if (days < 60) return `${Math.floor(days)} days ago`
  return `${Math.floor(days / 30)} months ago`
}

// Adds what the server found to the device's check. Strong facts (on Google's
// list, a warning from the short link service, a brand-new website) make it
// "This looks like a scam"; smaller ones "Be careful".
export function withFacts(check: LinkCheck, facts: LinkFacts | null, now = Date.now()): LinkCheck {
  if (!facts) return check
  const strong: Clue[] = []
  const others: Clue[] = []

  if (facts.listed.length) {
    const harmsDevice = facts.listed.some((l) => l.threat !== 'SOCIAL_ENGINEERING')
    strong.push({
      label: 'On a list of dangerous websites',
      reason: harmsDevice
        ? 'Google checks millions of websites, and it lists this one as dangerous: it can put bad apps on your device.'
        : 'Google checks millions of websites, and it lists this one as dangerous: it tricks people into giving away things like passwords.',
    })
  }

  if (facts.shortenerWarns) {
    strong.push({
      label: 'The short link has a warning',
      reason: `${check.site} itself put up a warning page instead of opening this link. It thinks the link isn't safe.`,
    })
  }

  // A short link the server followed: what counts is where it really goes, so
  // that address is checked too. If it leads somewhere with no clues, the short
  // link isn't a clue any more (it becomes a good sign: where it goes). If it
  // leads somewhere with clues, say where, with that address's clues straight
  // after (about a different address, so nothing to mark in the pasted link). A
  // short link that couldn't be followed stays a clue: nobody knows where it goes.
  // Old short links often keep an http:// address that the website itself switches
  // to https, so http isn't a clue about where a short link goes.
  let clues = check.clues
  let deviceRisk = check.risk
  const followed = facts.finalUrl !== check.url ? checkLink(facts.finalUrl) : null
  const destinationClues = followed?.clues.filter((c) => c.label !== 'Not a safe connection') ?? []
  const final = followed && {
    ...followed,
    clues: destinationClues,
    risk: destinationClues.length ? followed.risk : ('none' as const),
  }
  const cleanShortLink = final?.risk === 'none'
  if (final) {
    clues = clues.flatMap((c) =>
      c.label !== 'A short link'
        ? [c]
        : cleanShortLink
          ? []
          : [
              { ...c, reason: `${c.reason} This one really goes to ${final.site}.` },
              // (another short link's clue only once: tinyurl's preview page)
              ...final.clues.filter((f) => f.label !== c.label).map((f) => ({ label: f.label, reason: f.reason })),
            ],
    )
    if (cleanShortLink && deviceRisk === 'medium' && clues.length === 0) deviceRisk = 'none'
  }

  if (facts.created) {
    const days = (now - Date.parse(facts.created)) / DAY
    if (days >= 0 && days < 30) {
      strong.push({
        label: 'A brand-new website',
        reason: `This website was made ${ago(days)}. Scam websites are often brand new, because old ones get reported and shut down.`,
      })
    } else if (days >= 30 && days < 180) {
      others.push({
        label: 'A new website',
        reason: `This website was made ${ago(days)}. Most real websites have been around for years; scam websites are often new.`,
      })
    }
  }

  if (facts.exists === false) {
    others.push({
      label: "This website can't be found",
      reason: "There's no website at this address right now. It may have been shut down, or the link has a mistake. Scam websites often disappear fast.",
    })
  }

  // What's on the page. Asking for secrets is a strong clue when the page also
  // copies a brand or offers prizes or unreal deals; on its own (a normal login
  // page, a real shop's checkout) a smaller one.
  // Asking for money and rushing you only count alongside those tricks, so a
  // charity's donation banner (like Wikipedia's) isn't a clue.
  const page = facts.page
  if (page) {
    const tricks = Boolean(page.copiesBrand || page.freePrize || page.unbelievableDeal)
    const asksFor = tricks ? page.asksFor : page.asksFor.filter((a) => a !== 'money or gift cards')
    // Real logins and checkouts don't live on free website makers
    const secretsOnFreeHost = onFreeHost(final?.site ?? check.site) && asksFor.some((a) => a !== 'phone number' && a !== 'home address')
    if (page.copiesBrand) {
      strong.push({
        label: `Copies ${page.copiesBrand}`,
        reason: (() => {
          const where = final?.site ?? check.site
          const real = brandNamed(page.copiesBrand)?.domains[0]
          return real
            ? `This page uses ${page.copiesBrand}'s name or look, but it's on ${where}, not ${real}.`
            : `This page acts like it's from ${page.copiesBrand}, but it's on ${where}, which isn't theirs.`
        })(),
      })
    }
    if (asksFor.length) {
      const things = asksFor.map((a) => ASKS[a])
      const list = things.length > 1 ? `${things.slice(0, -1).join(', ')} and ${things[things.length - 1]}` : things[0]
      ;(tricks || secretsOnFreeHost ? strong : others).push({
        label: 'Asks for private things',
        reason: `This page asks for ${list}. Never type these on a website someone sent you a link to. Show a grown-up first.`,
      })
    }
    if (page.freePrize) {
      strong.push({
        label: 'Free prizes',
        reason: "This page promises free things or prizes. Real companies don't give prizes to strangers like this; it's one of the most common tricks.",
      })
    }
    if (page.unbelievableDeal) {
      strong.push({
        label: 'A deal too good to be true',
        reason: "The prices on this page are far too low to be real. Fake shops take the money and send nothing.",
      })
    }
    if (page.download) {
      strong.push({
        label: 'Wants you to download something',
        reason: 'This page wants you to download or install something. Free hacks and downloads like this often hide bad apps that harm your device.',
      })
    }
    if (page.rushesYou && tricks) {
      others.push({ label: 'Rushing you', reason: `This page uses timers or "only a few left" to make you hurry, so you don't stop and think.` })
    }
    // Not scams themselves, but their ads lead to them: only "Be careful"
    if (page.freeStreams) {
      others.push({
        label: 'Free shows or sports without paying',
        reason: 'This website gives away sports, shows or games that people normally pay for. Websites like this are full of tricky ads.',
      })
    }
    if (page.trickyAds) {
      others.push({
        label: 'Tricky ads',
        reason: 'This website has pop-up ads or fake buttons. Tapping them can take you to scams or bad downloads.',
      })
    }
    if (page.gambling) {
      others.push({ label: 'A betting website', reason: "This page is about betting money or items. It isn't meant for kids." })
    }
    if (page.adult) {
      others.push({ label: 'Not for kids', reason: "This page has things that aren't meant for kids." })
    }
  }

  // Good signs, for when there are no clues
  const good = [...(check.good ?? [])]
  if (final && cleanShortLink) good.push(`This short link goes to ${final.site}.`, ...(final.good ?? []))
  // (Only a small sign: Google can miss websites, especially new ones)
  if (!facts.listed.length) good.push("Google hasn't marked it as dangerous yet.")
  if (facts.created) {
    const years = Math.floor((now - Date.parse(facts.created)) / DAY / 365)
    if (years >= 1) good.push(`This website has been around for ${years === 1 ? '1 year' : `${years} years`}.`)
  }

  const risks = [deviceRisk, final?.risk, strong.length ? 'high' : others.length ? 'medium' : 'none']
  const risk = risks.includes('high') ? 'high' : risks.includes('medium') ? 'medium' : 'none'
  // Strong clues first, like the device's own
  return { ...check, risk, clues: [...strong, ...clues, ...others], good }
}
