import { isSetUp } from '../setup'
import type { Box, CheckResult, Clue } from './examples'
import { checkLink } from './linkCheck'
import { lookUpLink, withFacts } from './linkLookup'
import type { PreparedPicture } from './picturePicker'
import type { PictureFacts, Sign } from './pictureSigns'

// Check a picture: sends the picture to our server (worker/src/picture.ts), where
// Claude says what warning signs it can see, then turns that into the result kids
// see, in fixed kid words (the AI never writes what kids read). Web addresses in
// the picture go through the link checker too. Only after a grown-up has finished
// setup (setup.ts); nothing is kept.

const SERVER: string | undefined = import.meta.env.VITE_LINK_SERVER

// What each warning sign is called, and why it matters. Strong signs make it "This
// looks like a scam"; the others "Be careful".
const SIGN_WORDS: Record<Sign, { label: string; reason: string; strong: boolean }> = {
  'asks for a password or login code': {
    label: 'Asks for a password or code',
    reason: 'Real companies and real friends never ask for your password or a code that was sent to you.',
    strong: true,
  },
  'asks for money, gift cards or card details': {
    label: 'Asks for money or gift cards',
    reason: "Scammers ask for gift cards and card numbers, because once they're sent, the money is gone.",
    strong: true,
  },
  'asks for personal details': {
    label: 'Asks about you',
    reason: 'It wants to know things like where you live, your school or your phone number. Keep those private.',
    strong: true,
  },
  'asks for photos or videos of you': {
    label: 'Asks for photos of you',
    reason: "Never send photos or videos of yourself to someone who asks like this. It's not your fault. Show a grown-up.",
    strong: true,
  },
  'free prize or free game money': {
    label: 'Free prizes',
    reason: 'Free Robux, prizes or money from someone you don’t know is one of the most common tricks.',
    strong: true,
  },
  'pretends to be a company, game or famous person': {
    label: 'Pretending to be someone',
    reason: "It acts like it's from a company, a game or a famous person, but it might not be them at all.",
    strong: true,
  },
  'pretends to be family or a friend': {
    label: 'Maybe not who they say',
    reason: "It says it's family or a friend, but something is different, like a new number or an odd request.",
    strong: true,
  },
  'rushes you': {
    label: 'Rushing you',
    reason: "It wants you to hurry, so you don't stop and think.",
    strong: false,
  },
  'threatens you': {
    label: 'Trying to scare you',
    reason: "It uses scary words to make you do something. It's not your fault. Show a grown-up.",
    strong: true,
  },
  'asks you to move to another app or keep a secret': {
    label: 'Keep a secret, or talk somewhere else',
    reason: "It wants you to keep a secret or to talk in another app. People who are safe don't ask that.",
    strong: true,
  },
  'wants you to download something': {
    label: 'Wants you to download something',
    reason: 'Downloads from messages like this can put bad apps on your device.',
    strong: true,
  },
}

// The most links in a picture to look up (each one is a server check)
const MAX_LINKS = 3


// Sends the picture to be checked; null if the server can't answer (no server, no
// setup, too slow, or the AI couldn't answer)
export async function lookUpPicture(picture: PreparedPicture): Promise<PictureFacts | null> {
  if (!SERVER || !isSetUp()) return null
  try {
    const res = await fetch(`${SERVER}/picture`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image: await base64(picture.blob) }),
      // Looking at a picture takes a few seconds
      signal: AbortSignal.timeout(30000),
    })
    return res.ok ? ((await res.json()) as PictureFacts) : null
  } catch {
    return null
  }
}

// A picture's bytes as base64, for sending
async function base64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let text = ''
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(text)
}

// When the picture couldn't be checked or read: never "No clues found"
const COULD_NOT_CHECK: CheckResult = {
  risk: 'medium',
  clues: [
    {
      label: "Couldn't check it",
      reason: "Scam Shield couldn't check this picture right now. Show it to a grown-up instead.",
    },
  ],
}
const COULD_NOT_READ: CheckResult = {
  risk: 'medium',
  clues: [
    {
      label: 'Hard to read',
      reason: "Scam Shield couldn't read this picture well. Try a clearer screenshot, or show it to a grown-up.",
    },
  ],
}

// Turns what the server saw into the result: one clue per warning sign (with a box
// for every place it appears), then what the link checker says about any links in
// the picture. `lookUp` is the link checker's server check (a stand-in in tests).
export async function pictureResult(facts: PictureFacts | null, lookUp = lookUpLink): Promise<CheckResult> {
  if (!facts) return COULD_NOT_CHECK
  if (!facts.readable) return COULD_NOT_READ

  // One clue per sign, in the order they first appear
  const bySign = new Map<Sign, Box[]>()
  for (const { sign, box } of facts.signs) bySign.set(sign, [...(bySign.get(sign) ?? []), box])
  const clues: Clue[] = [...bySign].map(([sign, boxes]) => {
    const { label, reason } = SIGN_WORDS[sign]
    return { label, reason, boxes }
  })
  let strong = [...bySign.keys()].some((sign) => SIGN_WORDS[sign].strong)

  // Each link, checked like the link checker does (on the device, then the server)
  let notForKids = false
  const links = facts.links.flatMap((link) => checkLink(link) ?? []).slice(0, MAX_LINKS)
  const checked = await Promise.all(links.map(async (link) => withFacts(link, await lookUp(link.url))))
  for (const link of checked) {
    if (!link.clues.length) continue
    // Its most important clue, saying which link it's about
    const [first] = link.clues
    clues.push({ label: first.label, reason: `The link ${link.site}: ${first.reason}` })
    if (link.risk === 'high' && !link.notForKids) strong = true
    notForKids ||= Boolean(link.notForKids)
  }

  const risk = strong || notForKids ? 'high' : clues.length ? 'medium' : 'none'
  return { risk, clues, notForKids: notForKids && !strong, urgent: facts.threatOrPhotos }
}
