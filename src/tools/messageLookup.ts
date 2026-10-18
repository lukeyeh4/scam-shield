import { isSetUp } from '../setup'
import type { CheckResult } from './examples'
import { checkLink } from './linkCheck'
import { lookUpLink } from './linkLookup'
import type { MessageFacts, Sign } from './pictureSigns'
import { COULD_NOT_CHECK, DECLINED, linkClues, resultFrom, signClue } from './pictureLookup'

// Check a message: blanks out personal details, sends the message to our server
// (worker/src/message.ts), where Claude names the warning signs and quotes the
// words that show them, then turns that into the result kids see: the same kid
// words as pictures, the quoted words highlighted, and the links run through the
// link checker. Only after a grown-up has finished setup; nothing is kept.

const SERVER: string | undefined = import.meta.env.VITE_LINK_SERVER

// The longest message checked (the server cuts it to this too)
export const MAX_MESSAGE = 2000

// Brackets and punctuation around a word, so "(rbx.xyz)," is still a link
const AROUND = /^[(<[{"'“‘«]+|[)>\]}"'”’».,;:!?]+$/g

// The links in a message, exactly as written (checkLink finds web addresses, not
// emails or numbers)
export function linksIn(text: string) {
  return [...new Set(text.split(/\s+/).map((word) => word.replace(AROUND, '')))].filter(
    (word) => /[a-z]/i.test(word) && word.includes('.') && checkLink(word) !== null,
  )
}

// Personal details a kid might paste along with a message, which aren't needed to
// spot a scam: they're replaced before anything is sent. Links are kept (they're
// checked). Names can't be told apart from other words, so they stay.
const BLANKS: [RegExp, string][] = [
  [/[^\s@]+@[^\s@]+\.[a-z]{2,}/gi, '[email]'],
  [/(\+?\d[\s().-]*){7,}/g, '[phone]'],
  [/\b(code|pin|passcode)\b(\D{0,15})\d{4,}/gi, '$1$2[code]'],
  [/\b\d{6,8}\b/g, '[code]'],
  [/\b\d+\s+([a-z]+\s+){1,3}(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|way|close|crescent|place|pl|boulevard|blvd)\b/gi, '[address]'],
]

// The message with personal details blanked out, links untouched
export function blankOut(text: string) {
  const links = linksIn(text)
  // Links are set aside while blanking (a link can have numbers in it)
  let blanked = links.reduce((t, link, i) => t.split(link).join(`\uE000${i}\uE000`), text)
  for (const [rule, blank] of BLANKS) {
    // (keeping what comes after a phone number, like ". ", which the rule takes with it)
    blanked = blanked.replace(rule, (match, ...groups) => {
      const replaced = blank.replace(/\$(\d)/g, (_, n) => groups[Number(n) - 1] ?? '')
      return blank === '[phone]' ? replaced + (/[\s().-]*$/.exec(match)?.[0] ?? '') : replaced
    })
  }
  return blanked.replace(/\uE000(\d+)\uE000/g, (_, i) => links[Number(i)])
}

// Sends the (already blanked out) message to be checked; null if the server can't
// answer (no server, no setup, too slow, the AI couldn't answer, or over today's limit)
export async function lookUpMessage(text: string, context?: string): Promise<MessageFacts | null> {
  if (!SERVER || !isSetUp()) return null
  try {
    const res = await fetch(`${SERVER}/message`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, context }),
      signal: AbortSignal.timeout(25000),
    })
    return res.ok ? ((await res.json()) as MessageFacts) : null
  } catch {
    return null
  }
}

// The words Claude quoted, as they are in the message (any capitals), or nothing
// if they aren't in it: then the clue isn't highlighted
function inMessage(text: string, words: string) {
  const at = text.toLowerCase().indexOf(words.trim().toLowerCase())
  return at < 0 ? undefined : text.slice(at, at + words.trim().length)
}

// Turns what the server read into the result: one clue per warning sign (its
// words highlighted where they first appear), then the links, from what Claude
// read and what the device finds (in case one was missed). `lookUp` is the link
// checker's server check (a stand-in in tests).
export async function messageResult(facts: MessageFacts | null, text: string, lookUp = lookUpLink): Promise<CheckResult> {
  if (!facts) return COULD_NOT_CHECK
  if (facts.declined) return DECLINED

  const first = new Map<Sign, string | undefined>()
  for (const { sign, words } of facts.signs) if (!first.has(sign)) first.set(sign, inMessage(text, words))
  const signs = [...first].map(([sign, highlight]) => ({ sign, clue: signClue(sign, { highlight }) }))

  // Each link once, as written in the message where it can be found
  const addresses = new Map<string, string>()
  for (const link of [...facts.links, ...linksIn(text)]) {
    const shown = inMessage(text, link) ?? link
    if (!addresses.has(shown.toLowerCase())) addresses.set(shown.toLowerCase(), shown)
  }
  const links = await linkClues([...addresses.values()].map((address) => ({ address })), lookUp)
  return resultFrom(signs, links, facts.threatOrPhotos)
}
