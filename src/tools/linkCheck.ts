import type { CheckResult, Clue } from './examples'

// Checks a link on the device, from the address alone: nothing is opened or sent
// anywhere. Every clue is a fact about the address (pretending to be a brand,
// lookalike letters, a short link that hides where it goes, ...), explained in kid
// words. Safety lists (Google Safe Browsing), the website's age and following short
// links need a server; see "Link checker" in PROJECT.md.

// Real websites kids use, with their real addresses and the names scammers copy
const BRANDS: { name: string; domains: string[]; words: string[] }[] = [
  { name: 'Roblox', domains: ['roblox.com', 'rbxcdn.com', 'robloxlabs.com'], words: ['roblox', 'robux'] },
  { name: 'YouTube', domains: ['youtube.com', 'youtu.be'], words: ['youtube'] },
  { name: 'Google', domains: ['google.com', 'gmail.com', 'goo.gl', 'google.co.uk', 'google.ca', 'google.com.au'], words: ['google', 'gmail'] },
  { name: 'Apple', domains: ['apple.com', 'icloud.com'], words: ['apple', 'icloud', 'appleid'] },
  { name: 'Microsoft', domains: ['microsoft.com', 'microsoftonline.com', 'live.com', 'xbox.com', 'minecraft.net'], words: ['microsoft', 'xbox', 'minecraft'] },
  { name: 'Fortnite', domains: ['fortnite.com', 'epicgames.com'], words: ['fortnite', 'epicgames', 'vbucks'] },
  { name: 'Discord', domains: ['discord.com', 'discord.gg', 'discordapp.com', 'discordapp.net'], words: ['discord'] },
  { name: 'TikTok', domains: ['tiktok.com'], words: ['tiktok'] },
  { name: 'Instagram', domains: ['instagram.com'], words: ['instagram'] },
  { name: 'Snapchat', domains: ['snapchat.com'], words: ['snapchat'] },
  { name: 'Netflix', domains: ['netflix.com'], words: ['netflix'] },
  { name: 'Amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.com.au'], words: ['amazon'] },
  { name: 'PayPal', domains: ['paypal.com', 'paypal.me'], words: ['paypal'] },
  { name: 'Steam', domains: ['steampowered.com', 'steamcommunity.com'], words: ['steampowered', 'steamcommunity'] },
  { name: 'PlayStation', domains: ['playstation.com'], words: ['playstation'] },
  { name: 'Nintendo', domains: ['nintendo.com'], words: ['nintendo'] },
  { name: 'WhatsApp', domains: ['whatsapp.com'], words: ['whatsapp'] },
  { name: 'Facebook', domains: ['facebook.com'], words: ['facebook'] },
  { name: 'Spotify', domains: ['spotify.com'], words: ['spotify'] },
]

// Link shorteners: the real address is hidden behind them
const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly',
  'shorturl.at', 'tiny.cc', 'rb.gy', 't.ly', 's.id', 'v.gd', 'bl.ink', 'lnkd.in',
])

// Endings that scam websites use a lot, because they're cheap or free
const RISKY_ENDINGS = new Set([
  'xyz', 'top', 'click', 'gq', 'tk', 'ml', 'cf', 'ga', 'zip', 'mov', 'rest', 'icu', 'buzz', 'monster', 'cam', 'sbs', 'cfd', 'lol',
])

// Endings made of two parts, so example.co.uk is one website, not "co.uk"
const TWO_PART_ENDINGS = new Set(['co.uk', 'org.uk', 'ac.uk', 'com.au', 'net.au', 'co.nz', 'co.jp', 'com.br', 'co.in', 'co.za'])

// Words scam links use to tempt kids (only looked for after the website's name)
const BAIT_WORDS = ['free', 'giveaway', 'claim', 'prize', 'winner', 'gift', 'reward', 'robux', 'vbucks', 'verify', 'unlock']

// Characters that look like letters: rob1ox, g00gle, paypa1
const LOOKALIKES: [RegExp, string][] = [
  [/0/g, 'o'], [/1/g, 'l'], [/i/g, 'l'], [/3/g, 'e'], [/4/g, 'a'], [/5/g, 's'], [/7/g, 't'], [/rn/g, 'm'], [/vv/g, 'w'],
]
const plain = (word: string) => LOOKALIKES.reduce((w, [from, to]) => w.replace(from, to), word.toLowerCase())

// One letter added, missing or swapped: robloxx, robox, rbolox
function oneSlip(a: string, b: string) {
  if (a === b) return false
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    const diff = [...a].flatMap((c, i) => (c === b[i] ? [] : [i]))
    return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]
  }
  const [long, short] = a.length > b.length ? [a, b] : [b, a]
  for (let i = 0; i < long.length; i++) {
    if (long.slice(0, i) + long.slice(i + 1) === short) return true
  }
  return false
}

// A part of the website's name that copies a brand: exactly, with lookalike
// characters, or with one letter slipped (only for longer names, so short real
// words like "apply" aren't caught)
function copies(token: string, word: string) {
  const t = plain(token)
  const w = plain(word)
  return t === w || (w.length >= 6 && (oneSlip(t, w) || t.includes(w)))
}

// The website itself: the last two parts of the address (three for co.uk and the like)
function siteOf(host: string) {
  const parts = host.split('.')
  const n = TWO_PART_ENDINGS.has(parts.slice(-2).join('.')) ? 3 : 2
  return parts.slice(-n).join('.')
}

// Finds `part` in the link as typed (any capitals), so it can be highlighted exactly
function inText(text: string, part: string) {
  const at = text.toLowerCase().indexOf(part.toLowerCase())
  return at >= 0 ? text.slice(at, at + part.length) : undefined
}

export type LinkCheck = CheckResult & {
  // The website the link really goes to (e.g. roblox-giveaway-official.net)
  site: string
}

// Returns null if `text` doesn't look like a link at all
export function checkLink(text: string): LinkCheck | null {
  const typed = text.trim()
  if (!typed || /\s/.test(typed)) return null
  // Other kinds of address, like mailto: or javascript: (but not a port, like site.com:8080)
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(typed) && !/^https?:\/\//i.test(typed)) return null
  let url: URL
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  // The address part as typed: after "https://" and anything before an @, up to the first / ? or #
  const typedHost = typed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?#]/)[0].split('@').pop()!
  const host = url.hostname.replace(/\.$/, '')
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')
  if (!isIp && !host.includes('.')) return null

  const strong: Clue[] = []
  const others: Clue[] = []
  const site = isIp ? host : siteOf(host)
  const official = BRANDS.find((b) => b.domains.includes(site))

  // An @ hides the real address: everything before it is ignored
  if (url.username || url.password) {
    const before = typed.slice(0, typed.indexOf('@') + 1).replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    strong.push({
      label: 'The address is hiding something',
      reason: `Everything before the @ is ignored. This link really goes to ${site}.`,
      highlight: inText(typed, before),
    })
  }

  // Letters from other alphabets that look like ours (the browser turns them into xn--)
  if (host.split('.').some((label) => label.startsWith('xn--'))) {
    strong.push({
      label: 'Some letters are fakes',
      reason: 'Some letters in this address only look like normal letters. Scammers use them to copy real websites.',
      highlight: inText(typed, typedHost),
    })
  }

  if (isIp) {
    strong.push({
      label: 'No website name',
      reason: 'Real websites have a name, like roblox.com. This link is only numbers.',
      highlight: inText(typed, typedHost),
    })
  }

  // Pretending to be a brand: its name in the address, but not its real website
  if (!official && !isIp) {
    const tokens = host.split(/[.-]/)
    const copied = BRANDS.find((b) => b.words.some((w) => tokens.some((t) => copies(t, w))))
    if (copied) {
      strong.push({
        label: `Pretending to be ${copied.name}`,
        reason: `The real ${copied.name} website is ${copied.domains[0]}. This one is ${site}.`,
        highlight: inText(typed, typedHost),
      })
    }
  }

  if (SHORTENERS.has(site)) {
    others.push({
      label: 'A short link',
      reason: "Short links hide where they really go, so you can't tell if the website is real.",
      highlight: inText(typed, typedHost),
    })
  }

  // Lots of parts before the website, like login.secure.account.example.com
  if (!isIp && host.split('.').length - site.split('.').length >= 3) {
    others.push({
      label: 'A very long address',
      reason: `The real website is only the end: ${site}. Long addresses can hide that.`,
      highlight: inText(typed, typedHost),
    })
  }

  if (!official) {
    const ending = site.split('.').pop()!
    if (RISKY_ENDINGS.has(ending)) {
      others.push({
        label: 'An unusual ending',
        reason: `Lots of scam websites end in .${ending}, because those addresses are cheap.`,
        highlight: inText(typed, `.${ending}`),
      })
    }

    // Bait words after the website's name, like /claim or /free-robux
    const rest = typed.slice(typed.toLowerCase().indexOf(typedHost.toLowerCase()) + typedHost.length)
    const bait = BAIT_WORDS.find((w) => rest.toLowerCase().includes(w))
    if (bait) {
      others.push({
        label: 'Words that tempt you',
        reason: `Words like '${bait}' are used to make you excited, so you tap without thinking.`,
        highlight: inText(rest, bait),
      })
    }
  }

  if (url.protocol === 'http:') {
    others.push({
      label: 'Not a safe connection',
      reason: "This link starts with http, not https, so what you type isn't kept private.",
      highlight: inText(typed, 'http:'),
    })
  }

  const clues = [...strong, ...others]
  return { risk: strong.length ? 'high' : others.length ? 'medium' : 'none', clues, site }
}
