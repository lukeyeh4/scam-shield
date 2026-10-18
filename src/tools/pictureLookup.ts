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

// What each warning sign is called, and why it matters, in one short line. Strong
// signs make it "This looks like a scam"; the others "Be careful".
const SIGN_WORDS: Record<Sign, { label: string; reason: string; strong: boolean }> = {
  'asks for a password or login code': { label: 'Asks for a password or code', reason: 'Real companies and friends never ask for these.', strong: true },
  'asks for money, gift cards or card details': { label: 'Asks for money or gift cards', reason: 'Once you send it, the money is gone.', strong: true },
  'asks for personal details': { label: 'Asks about you', reason: 'Keep where you live and your school private.', strong: true },
  'asks for photos or videos of you': { label: 'Asks for photos of you', reason: 'Never send photos of yourself.', strong: true },
  'free prize or free game money': { label: 'Free prizes', reason: 'Free stuff from strangers is a common trick.', strong: true },
  // Only "Be careful" on its own: real people share sad stories too. With a push to
  // pay (money, rushing, a trick link) the other signs make it red.
  'sad story to get you to buy or give money': { label: 'A sad story to make you pay', reason: 'Sad stories are used to make you buy fast.', strong: false },
  'pretends to be a company, game or famous person': { label: 'Pretending to be someone', reason: 'It might not really be them.', strong: true },
  'pretends to be family or a friend': { label: 'Maybe not who they say', reason: "Something's different, like a new number.", strong: true },
  'rushes you': { label: 'Rushing you', reason: "Hurrying stops you from thinking.", strong: false },
  'threatens you': { label: 'Trying to scare you', reason: "It's not your fault.", strong: true },
  'asks you to move to another app or keep a secret': { label: 'Asks for a secret', reason: "Safe people don't ask you to keep secrets.", strong: true },
  'wants you to download something': { label: 'Wants a download', reason: 'It could put a bad app on your device.', strong: true },
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
  clues: [{ label: "Couldn't check it", reason: 'Show it to a grown-up instead.' }],
}
const COULD_NOT_READ: CheckResult = {
  risk: 'medium',
  clues: [{ label: 'Hard to read', reason: 'Try a clearer screenshot, or show a grown-up.' }],
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

  // Each link, checked like the link checker does (on the device, then the
  // server), as one short clue with a box around the address
  let notForKids = false
  const links = facts.links.flatMap(({ address, box }) => {
    const link = checkLink(address)
    return link ? [{ link, box }] : []
  })
  const checked = await Promise.all(
    links.slice(0, MAX_LINKS).map(async ({ link, box }) => ({ link: withFacts(link, await lookUp(link.url)), box })),
  )
  for (const { link, box } of checked) {
    if (!link.clues.length) continue
    const scam = link.risk === 'high' && !link.notForKids
    clues.push({
      label: scam ? 'A trick link' : link.notForKids ? 'A link not for kids' : 'A link to be careful with',
      reason: `${link.clues[0].label}: ${link.site}`,
      boxes: [box],
    })
    strong ||= scam
    notForKids ||= Boolean(link.notForKids)
  }

  const risk = strong || notForKids ? 'high' : clues.length ? 'medium' : 'none'
  return { risk, clues, notForKids: notForKids && !strong, urgent: facts.threatOrPhotos }
}
