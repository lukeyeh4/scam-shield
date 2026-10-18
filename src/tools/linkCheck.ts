import { parse } from 'tldts'
import { type Brand, BRANDS, EVERYDAY_WORDS, NEAR_BRAND_WORDS, officialBrand } from './brands'
import type { CheckResult, Clue } from './examples'
import { decodePunycode, mixesAlphabets, skeleton } from './lookalikes'

// Checks a link on the device, from the address alone: nothing is opened or sent
// anywhere, and it's instant. Every clue is a fact about the address (pretending
// to be a brand, lookalike letters, a short link that hides where it goes, ...),
// explained in kid words. Safety lists (Google Safe Browsing), the website's age
// and following short links need a server (`worker/`, added by linkLookup.ts);
// see "Link checker" in PROJECT.md.
//
// An address is taken apart with the Public Suffix List (the `tldts` package):
// in https://login.roblox.com.free-prizes.net/claim?x=1 the website is
// free-prizes.net (its name "free-prizes", its ending "net"), "login.roblox.com"
// is only a subdomain, and "/claim?x=1" is the path. Anything before an @ isn't
// part of the address at all.

// Link shorteners: the real address is hidden behind them (the server follows them)
export const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly',
  'shorturl.at', 'tiny.cc', 'rb.gy', 't.ly', 's.id', 'v.gd', 'bl.ink', 'lnkd.in',
])

// Endings that scam websites use a lot, because they're cheap or free
const RISKY_ENDINGS = new Set([
  'xyz', 'top', 'click', 'gq', 'tk', 'ml', 'cf', 'ga', 'zip', 'mov', 'rest', 'icu', 'buzz', 'monster', 'cam', 'sbs', 'cfd', 'lol',
])

// Free website makers and hosts, where anyone can get an address like
// my-page.vercel.app in minutes. Each my-page is a different person's website, so
// the platform's own age and name say nothing about it. Scam pages use these a lot.
// (Most are in the Public Suffix List too; this list is what makes them a clue.)
const FREE_HOSTS = new Set([
  'vercel.app', 'pages.dev', 'workers.dev', 'r2.dev', 'netlify.app', 'framer.ai', 'framer.website', 'framer.app',
  'github.io', 'gitbook.io', 'replit.app', 'repl.co', 'glitch.me', 'web.app', 'firebaseapp.com', 'herokuapp.com',
  'onrender.com', 'fly.dev', 'surge.sh', 'edgeone.dev', 'webflow.io', 'wixsite.com', 'weebly.com', 'square.site',
  'godaddysites.com', 'blogspot.com', 'wordpress.com', 'carrd.co', 'mystrikingly.com', 'jimdosite.com', 'site123.me',
  'myshopify.com', 'azurewebsites.net', 'ngrok-free.app', 'ngrok.io', 'backblazeb2.com', 'appspot.com',
])

// Betting websites kids meet: crypto casinos, Robux and skin gambling, and the
// casinos and sports betting they see ads for. Many block the server from reading
// their page, so they're known here. Not a scam, but not for kids: only "Be careful".
const GAMBLING_SITES = new Set([
  'rainbet.com', 'stake.com', 'stake.us', 'roobet.com', 'rollbit.com', 'gamdom.com', 'duelbits.com', 'shuffle.com',
  'bc.game', 'bloxflip.com', 'rbxflip.com', 'csgoroll.com', 'csgoempire.com', 'hellcase.com', 'key-drop.com', 'clash.gg',
  'chumbacasino.com', 'luckylandslots.com', 'pulsz.com', 'mcluck.com', 'wowvegas.com', 'draftkings.com', 'fanduel.com',
  'pokerstars.com', 'kalshi.com', 'polymarket.com',
])

// Adult websites, and endings only for them. The server asks a family filter
// about every other website (worker/src/index.ts), so this list only has to
// cover the best-known ones, and works before a grown-up finishes setup.
const ADULT_SITES = new Set([
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com', 'youporn.com', 'tube8.com', 'spankbang.com',
  'eporner.com', 'beeg.com', 'motherless.com', 'brazzers.com', 'onlyfans.com', 'fansly.com', 'chaturbate.com',
  'stripchat.com', 'livejasmin.com', 'bongacams.com', 'cam4.com', 'rule34.xxx', 'nhentai.net', 'e-hentai.org',
  'youjizz.com', 'tnaflix.com', 'drtuber.com', 'hclips.com', 'txxx.com', 'nuvid.com', '4tube.com', 'fuq.com',
  'thumbzilla.com', 'lobstertube.com', 'erome.com', 'thothub.to', 'f95zone.to', 'hanime.tv', 'gelbooru.com',
  'donmai.us', 'sankakucomplex.com', 'camsoda.com', 'myfreecams.com', 'manyvids.com', 'clips4sale.com',
  'naughtyamerica.com', 'realitykings.com', 'bangbros.com', 'imagefap.com', 'literotica.com', 'fapello.com',
])
const ADULT_ENDINGS = new Set(['xxx', 'porn', 'sex', 'adult'])
// Words in a website's name that only adult websites use (porntrex.com,
// hentaihaven.xxx, freesexvideos.org), once real words, names and places that
// contain them are taken out (essex, unisex, expertsexchange, ...). Not on
// government, school or health websites (sexualhealth.nhs.uk, sexed.org).
const ADULT_WORDS = ['porn', 'xxx', 'sex', 'hentai', 'nsfw', 'nude', 'milf', 'xvideo', 'xnxx', 'xhamster', 'camgirl', 'erotic', 'fetish', 'bdsm', 'onlyfan', 'rule34']
const INNOCENT = /essex|sussex|wessex|middlesex|unisex|sextant|sexton|sextet|expertsexchange|sexed|sexualhealth|sexeducation|xxxtentacion|milford|milfoil/g
const SERIOUS_SITE = /\.(gov|edu|mil)(\.[a-z]{2})?$|\.(gov|ac|nhs)\.uk$|^nhs\.uk$|\.k12\.[a-z]{2}\.us$/
// (lookalike numbers too, like p0rn: see `plain` below)
const hasAdultWord = (labels: string, site: string) => {
  const plainLabels = plain(skeleton(labels).replace(INNOCENT, ''))
  return !SERIOUS_SITE.test(site) && ADULT_WORDS.some((w) => plainLabels.includes(plain(w)))
}

// Words scam links use to tempt kids, after the website's name (like /free-robux)
const BAIT_WORDS = ['free', 'giveaway', 'claim', 'prize', 'winner', 'gift', 'reward', 'robux', 'vbucks', 'verify', 'unlock']
// The same, inside the website's name itself (like rbxgiveaway.com). Not "free" or
// "gift", which plenty of real websites have in their names.
const NAME_BAIT_WORDS = ['giveaway', 'claim', 'prize', 'winner', 'reward', 'verify', 'unlock']
// Words that make a brand's name in someone else's address a strong clue: logging
// in, prizes, "official" (fan websites rarely use these; copies do)
const IMPERSONATION_WORDS = [
  ...BAIT_WORDS, 'login', 'signin', 'sign-in', 'account', 'secure', 'security', 'support', 'password', 'auth', 'recover',
  'wallet', 'official', 'billing', 'update', 'nitro',
]

// Characters that look like letters: rob1ox, g00gle, paypa1
const LOOKALIKES: [RegExp, string][] = [
  [/0/g, 'o'], [/1/g, 'l'], [/i/g, 'l'], [/3/g, 'e'], [/4/g, 'a'], [/5/g, 's'], [/7/g, 't'], [/rn/g, 'm'], [/vv/g, 'w'],
]
const plain = (word: string) => LOOKALIKES.reduce((w, [from, to]) => w.replace(from, to), word)

// One letter added, missing, changed or swapped: robloxx, robox, ronlox, rbolox
function oneSlip(a: string, b: string) {
  if (a === b) return false
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    const diff = [...a].flatMap((c, i) => (c === b[i] ? [] : [i]))
    if (diff.length === 1) return true
    return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]
  }
  const [long, short] = a.length > b.length ? [a, b] : [b, a]
  for (let i = 0; i < long.length; i++) {
    if (long.slice(0, i) + long.slice(i + 1) === short) return true
  }
  return false
}

// How one part of a website's name (already in plain a to z) uses a brand word:
// 'exact' (roblox), 'lookalike' (rob1ox, ronlox, robloxx: a fan website wouldn't
// misspell it; only for longer names, so short real words like "apply" aren't
// caught), or 'inside' a longer name (freerobux, but also planetminecraft)
type Use = 'exact' | 'lookalike' | 'inside'
function uses(part: string, word: string): Use | null {
  if (part === word) return 'exact'
  if (word.length < 5) return null
  if (plain(part) === plain(word)) return 'lookalike'
  if (word.length >= 6 && !NEAR_BRAND_WORDS.has(part) && oneSlip(plain(part), plain(word))) return 'lookalike'
  if (!EVERYDAY_WORDS.has(word) && part.includes(word)) return 'inside'
  return null
}

type Address = {
  // The address as shown: subdomain(s), the website's name and its ending, each in
  // the letters it shows (xn-- turned back into them)
  host: string
  subdomain: string
  name: string
  ending: string
  // The website: name + ending (my-page.vercel.app for a free website maker)
  site: string
  isIp: boolean
}

// Takes the address apart with the Public Suffix List. Null if it has no real
// ending (hello.there, my.homework), so it isn't a web address.
function addressOf(hostname: string): Address | null {
  const host = hostname.replace(/\.$/, '').toLowerCase()
  const parts = parse(host, { allowPrivateDomains: true })
  if (parts.isIp) return { host, subdomain: '', name: host, ending: '', site: host, isIp: true }
  if (!parts.domain || !parts.publicSuffix || !parts.domainWithoutSuffix || !(parts.isIcann || parts.isPrivate)) return null
  let subdomain = parts.subdomain ?? ''
  let name = parts.domainWithoutSuffix
  let ending = parts.publicSuffix
  // A free website maker the Public Suffix List doesn't know: its users' pages are
  // still separate websites
  if (FREE_HOSTS.has(parts.domain) && subdomain) {
    ending = parts.domain
    name = subdomain.split('.').pop()!
    subdomain = subdomain.split('.').slice(0, -1).join('.')
  }
  const shown = (labels: string) => labels.split('.').map(decodePunycode).join('.')
  return {
    host: shown(host),
    subdomain: shown(subdomain),
    name: shown(name),
    ending: shown(ending),
    site: `${name}.${ending}`,
    isIp: false,
  }
}

// The website itself, by the Public Suffix List: www.bbc.co.uk → bbc.co.uk,
// my-page.vercel.app → my-page.vercel.app
export function siteOf(host: string) {
  return addressOf(host)?.site ?? host
}

// Made with a free website maker (see FREE_HOSTS)
export const onFreeHost = (site: string) => FREE_HOSTS.has(site.split('.').slice(1).join('.'))

// Finds `part` in the link as typed (any capitals), so it can be highlighted exactly
function inText(text: string, part: string) {
  const at = text.toLowerCase().indexOf(part.toLowerCase())
  return at >= 0 ? text.slice(at, at + part.length) : undefined
}

// How strongly the address copies a brand, and why
type Copy = {
  brand: Brand
  strong: boolean
  // A real brand address used as the start (roblox.com.evil.net)
  startsWith?: string
  fakeLetters: boolean
  // The part of the name that copies the brand word, and how
  piece?: string
  word?: string
  use?: Use
  // The brand's name is the whole website name (roblox.net)
  whole?: boolean
  // A logging-in or prize word next to it (roblox-login.com)
  bait?: string
}

// What's different about a misspelled brand name, in kid words: "One letter is
// different: n instead of b". `shown` is the same part as typed (robIox), for
// quoting its letters the way the player sees them.
function spelling(piece: string, word: string, shown = piece): string | undefined {
  for (const [fake, real] of [['rn', 'm'], ['vv', 'w']]) {
    if (piece.includes(fake) && word.includes(real) && !word.includes(fake)) return `It uses "${fake}" instead of "${real}", which look alike`
  }
  if (piece.length === word.length) {
    const diff = [...piece].flatMap((c, i) => (c === word[i] ? [] : [i]))
    if (!diff.length) return undefined
    const [at] = diff
    if (diff.length === 2 && diff[1] === at + 1 && piece[at] === word[at + 1] && piece[at + 1] === word[at]) {
      return `Two letters are swapped: "${shown.slice(at, at + 2)}" instead of "${word.slice(at, at + 2)}"`
    }
    if (/\d/.test(piece[at])) return `It uses the number ${piece[at]} instead of the letter ${word[at]}`
    if (plain(piece[at]) === plain(word[at])) return `It uses "${shown[at]}" instead of "${word[at]}", which look alike`
    return `One letter is different: "${shown[at]}" instead of "${word[at]}"`
  }
  for (let i = 0; i < Math.max(piece.length, word.length); i++) {
    if (piece.slice(0, i) + piece.slice(i + 1) === word) return `It has an extra "${shown[i]}"`
    if (word.slice(0, i) + word.slice(i + 1) === piece) return `It's missing the "${word[i]}"`
  }
  return undefined
}

// Looks for brands in the website's name and in its subdomains. Strong: a
// misspelled or lookalike brand name, the brand's name as the whole website name
// (roblox.net), a real brand address used as a subdomain (roblox.com.evil.net),
// the brand's name with logging-in or prize words (roblox-login.com), or any use
// of a brand nobody makes fan websites for (paypal-help.com). Otherwise, a game's
// name in someone else's address may be a fan website (roblox-tips.com,
// planetminecraft.com, roblox.fandom.com): only a smaller clue.
function copiedBrand(address: Address): Copy | null {
  const { name, subdomain, host } = address
  const plainHost = skeleton(host)
  const found: Copy[] = []
  const look = (label: string, inName: boolean) => {
    const plainLabel = skeleton(label)
    const fakeLetters = plainLabel !== label.toLowerCase() || mixesAlphabets(label)
    // Each part between dashes, and the whole name without them (rob-lox)
    const pieces = [...new Set([...plainLabel.split('-'), plainLabel.replace(/-/g, '')])].filter(Boolean)
    for (const brand of BRANDS) {
      // Logging-in or prize words next to the brand's name (not its own words, like robux)
      const bait = IMPERSONATION_WORDS.find((w) => plainHost.includes(w) && !brand.words.includes(w))
      for (const word of brand.words) {
        for (const piece of pieces) {
          const use = uses(piece, word)
          if (!use) continue
          const whole = inName && piece === plainLabel.replace(/-/g, '') && use === 'exact'
          const strong = use === 'lookalike' || fakeLetters || whole || Boolean(bait) || !brand.fans
          found.push({ brand, strong, fakeLetters, piece, word, use, whole, bait })
        }
      }
    }
  }
  look(name, true)
  for (const label of subdomain.split('.').filter(Boolean)) look(label, false)

  // A real brand address as the start: roblox.com.evil.net, www-roblox-com.evil.net
  const plainSub = skeleton(subdomain).replace(/-/g, '.')
  for (const brand of BRANDS) {
    const real = brand.domains.find((d) => `.${plainSub}.`.includes(`.${d}.`))
    if (real) found.unshift({ brand, strong: true, startsWith: real, fakeLetters: false })
  }
  return found.find((f) => f.strong) ?? found[0] ?? null
}

export type LinkCheck = CheckResult & {
  // The website the link really goes to (e.g. roblox-giveaway-official.net)
  site: string
  // The whole link, tidied up (e.g. https:// added), for the server to look up
  url: string
}

// One link, exactly as it was typed or pasted: its address checked and its clues
function checkOne(typed: string): LinkCheck | null {
  // Other kinds of address, like mailto: or javascript: (but not a port, like site.com:8080)
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(typed) && !/^https?:\/\//i.test(typed)) return null
  const hasScheme = /^https?:\/\//i.test(typed)
  // An email address (me@example.com) isn't a link
  if (!hasScheme && /^[^/?#@]+@[^/?#@]+$/.test(typed)) return null
  let url: URL
  try {
    url = new URL(hasScheme ? typed : `https://${typed}`)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  const address = addressOf(url.hostname)
  if (!address) return null
  // The address part as typed: after "https://" and anything before an @, up to the first / ? or #
  const typedHost = typed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?#]/)[0].split('@').pop()!
  const { host, site, ending, isIp } = address
  // Numbers only count as an address when typed as one (1.2.3.4), not "5.30" or "1.2.3"
  if (isIp && !/^(\d{1,3}(\.\d{1,3}){3}|\[[0-9a-f:.]+\])(:\d+)?$/i.test(typedHost)) return null

  const strong: Clue[] = []
  const others: Clue[] = []
  const official = isIp ? undefined : officialBrand(site)

  // An @ hides the real address: everything before it is ignored
  if (url.username || url.password) {
    const before = typed.slice(0, typed.indexOf('@') + 1).replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    strong.push({
      label: 'The address is hiding something',
      reason: `"${before}" is only there to fool you. Everything before the @ is ignored, so this link really goes to ${site}.`,
      highlight: inText(typed, before),
    })
  }

  if (isIp) {
    strong.push({
      label: 'No website name',
      reason: "Real websites have a name, like roblox.com. This link is only numbers, so you can't tell whose website it is.",
      highlight: inText(typed, typedHost),
    })
  }

  // Letters from two alphabets mixed in one name (rоblox with a Cyrillic о)
  const mixed = host.split('.').some(mixesAlphabets)
  const copy = official || isIp ? null : copiedBrand(address)
  if (mixed || copy?.fakeLetters) {
    strong.push({
      label: 'Some letters are fakes',
      reason: 'Some letters here come from another alphabet. They look just like ours, so the address can copy a real one.',
      highlight: inText(typed, typedHost),
    })
  }

  // Pretending to be a brand: its name in the address, but not its real website.
  // The reason says what the trick is, so kids can spot it next time.
  if (copy) {
    const { brand, piece, word } = copy
    const real = brand.domains[0]
    // The copied part as typed (robIox), when it can be found in the link
    const shownPiece = piece && piece.length === (inText(typedHost, piece) ?? '').length ? inText(typedHost, piece)! : piece
    const howSpelled = copy.use === 'lookalike' && piece && word ? spelling(piece, word, shownPiece) : undefined
    const reason = copy.startsWith
      ? `This address starts with ${copy.startsWith}, but websites are read from the end. This one is really ${site}.`
      : !copy.strong
        ? `This isn't ${brand.name}'s own website (that's ${real}). Anyone can put a name in an address. Fan websites do this, but so do scams.`
        : copy.fakeLetters
          ? `It only looks like ${real}, but it's a different website.`
          : howSpelled
            ? `It says "${shownPiece}", not "${word}". ${howSpelled}. The real ${brand.name} website is ${real}.`
            : copy.bait
              ? `It puts ${brand.name}'s name next to the word "${copy.bait}" to trick you. The real ${brand.name} website is only ${real}.`
              : copy.whole
                ? `Only ${brand.name} owns ${real}. ${site} just uses its name, so anyone could own it.`
                : `Anyone can make a website with ${brand.name}'s name in it. The real ${brand.name} website is only ${real}.`
    ;(copy.strong ? strong : others).push({
      label: copy.strong ? `Pretending to be ${brand.name}` : `Uses ${brand.name}'s name`,
      reason,
      highlight: inText(typed, typedHost),
    })
  }

  if (onFreeHost(site)) {
    others.push({
      label: 'Made with a free website maker',
      reason: `This website is made on ${ending}, where anyone can make a website for free in minutes without saying who they are. Scammers use them a lot.`,
      highlight: inText(typed, ending),
    })
  }

  if (GAMBLING_SITES.has(site)) {
    others.push({
      label: 'A betting website',
      reason: `${site} is a website for betting money or items. It isn't meant for kids.`,
      highlight: inText(typed, typedHost),
    })
  }

  // (the website's name and any parts before it, not the ending or the path)
  if (ADULT_SITES.has(site) || ADULT_ENDINGS.has(ending) || (!isIp && !official && hasAdultWord(`${address.subdomain}.${address.name}`, site))) {
    others.push({
      label: 'Not for kids',
      reason: "This website has things that aren't meant for kids. Don't open it. Show a grown-up.",
      highlight: inText(typed, typedHost),
    })
  }

  if (SHORTENERS.has(site)) {
    others.push({
      label: 'A short link',
      reason: `${site} links hide the real address, so you can't see where it goes before you tap.`,
      highlight: inText(typed, typedHost),
    })
  }

  // Lots of parts before the website, like login.secure.account.example.com
  if (!isIp && host.split('.').length - site.split('.').length >= 3) {
    others.push({
      label: 'A very long address',
      reason: `Only the end of an address says which website it is: ${site}. The start, "${address.subdomain}", is added to look real.`,
      highlight: inText(typed, typedHost),
    })
  }

  // After the address: the path, the ?query and the #part
  const rest = typed.slice(typed.toLowerCase().indexOf(typedHost.toLowerCase()) + typedHost.length)

  if (!official && !isIp) {
    const lastEnding = ending.split('.').pop()!
    if (RISKY_ENDINGS.has(lastEnding)) {
      others.push({
        label: 'An unusual ending',
        reason: `This address ends in .${lastEnding}. Those addresses are very cheap, so scammers make lots of them.`,
        highlight: inText(typed, `.${lastEnding}`),
      })
    }

    // A real brand address in the path, to look real: s4w.in/roblox-com-users.
    // Only longer names (roblox.com, not go.com), as whole words (or after "www").
    const plainRest = skeleton(rest)
    const mention = BRANDS.flatMap((b) => b.domains)
      .filter((d) => d.split('.')[0].length >= 5)
      .flatMap((d) => [d, d.replace(/\./g, '-')])
      .find((d) => new RegExp(`(^|[^a-z0-9]|www)${d.replace(/\./g, '\\.')}($|[^a-z0-9])`).test(plainRest))
    if (mention && !copy) {
      others.push({
        label: "A real website's name in the wrong place",
        reason: `"${inText(rest, mention) ?? mention}" comes after the website's name, so it doesn't change where the link goes. This link really goes to ${site}.`,
        highlight: inText(rest, mention),
      })
    }

    // Bait words in the website's name (rbxgiveaway.com), or after it (/claim, /free-robux)
    const nameBait = NAME_BAIT_WORDS.find((w) => skeleton(address.name).includes(w))
    const bait = nameBait ?? BAIT_WORDS.find((w) => plainRest.includes(w))
    if (bait) {
      others.push({
        label: 'Words that tempt you',
        reason: `It has the word "${bait}" in it. Scammers use words like this so you get excited and tap fast.`,
        highlight: nameBait ? inText(typedHost, bait) : inText(rest, bait),
      })
    }
  }

  // (Official brand websites switch to https by themselves, so it's no clue there)
  if (url.protocol === 'http:' && !official) {
    others.push({
      label: 'Not a safe connection',
      reason: 'It starts with http, not https, so what you type on it could be seen by other people.',
      highlight: inText(typed, 'http:'),
    })
  }

  const clues = [...strong, ...others]
  const good = official ? [`This is the real ${official.name} website.`] : []
  return { risk: strong.length ? 'high' : others.length ? 'medium' : 'none', clues, good, site, url: url.href }
}

// Brackets and punctuation around a link in a sentence: (roblox.com), "bit.ly/x".
const AROUND = /^[(<[{"'“‘«]+|[)>\]}"'”’».,;:!?]+$/g

// Checks the link in `text`: a link on its own (with or without https://), or the
// links inside a pasted message, of which the riskiest is shown. Null if there's
// no link at all.
export function checkLink(text: string): LinkCheck | null {
  const candidates = text
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(AROUND, ''))
    .filter((word) => word.includes('.') || /^https?:\/\//i.test(word))
  const order = { high: 0, medium: 1, none: 2 }
  let riskiest: LinkCheck | null = null
  for (const candidate of candidates) {
    const result = checkOne(candidate)
    if (result && (!riskiest || order[result.risk] < order[riskiest.risk])) riskiest = result
  }
  return riskiest
}
