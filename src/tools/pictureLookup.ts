import { hasPersonalDetails, soundsUpset } from '../chat/askRules'
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

// What each warning sign is called, and why it matters in one short line, and what
// Shield Buddy says if the kid asks why (scripted, ending with a grown-up). Strong
// signs make it "This looks like a scam"; the others "Be careful".
const SIGN_WORDS: Record<Sign, { label: string; reason: string; strong: boolean; why: string[] }> = {
  'asks for a password or login code': {
    label: 'Asks for a password or code',
    reason: 'Real companies and friends never ask for these.',
    strong: true,
    why: [
      'A password is like the key to your house.',
      'Real companies and friends never ask for it.',
      'Next time, say no and show a grown-up.',
    ],
  },
  'asks for money, gift cards or card details': {
    label: 'Asks for money or gift cards',
    reason: 'Once you send it, the money is gone.',
    strong: true,
    why: [
      'Gift card codes are just like cash.',
      "Once you send one, you can't get it back.",
      'Next time, never send codes or money. Ask a grown-up first.',
    ],
  },
  'asks for personal details': {
    label: 'Asks about you',
    reason: 'Keep where you live and your school private.',
    strong: true,
    why: [
      'Your address and school tell a stranger where to find you.',
      'Next time, keep them private and tell a grown-up who asked.',
    ],
  },
  'asks for photos or videos of you': {
    label: 'Asks for photos of you',
    reason: 'Never send photos of yourself.',
    strong: true,
    why: [
      'Someone asking for photos of you is not OK.',
      "You haven't done anything wrong.",
      'Show a grown-up you trust right away.',
    ],
  },
  'free prize or free game money': {
    label: 'Free prizes',
    reason: 'Free stuff from strangers is a common trick.',
    strong: true,
    why: [
      "Nobody gives free Robux or prizes to people they don't know.",
      "It's bait, like a worm on a fishing hook.",
      'Next time, ask a grown-up before you tap.',
    ],
  },
  'sad story to get you to buy or give money': {
    label: 'A sad story to make you pay',
    reason: 'Sad stories are used to make you buy fast.',
    strong: false,
    why: [
      "Sad stories make us want to help. That shows you're kind!",
      'But scammers use them to make people buy fast.',
      'Next time, ask a grown-up before buying anything.',
    ],
  },
  // Only "Be careful": we can't prove a photo is made with AI, only that what
  // arrives may look very different (even from a real shop like Amazon)
  'product that may not look like the photo': {
    label: "Might not look like that",
    reason: 'What arrives may look very different.',
    strong: false,
    why: [
      'Some product photos are made with AI to look amazing.',
      'What comes in the post can look nothing like it.',
      'Next time, ask a grown-up before buying.',
    ],
  },
  'pretends to be a company, game or famous person': {
    label: 'Pretending to be someone',
    reason: 'It might not really be them.',
    strong: true,
    why: [
      'Anyone can use a famous name or logo.',
      "That doesn't make it real.",
      'Next time, check the real app or website with a grown-up.',
    ],
  },
  'pretends to be family or a friend': {
    label: 'Maybe not who they say',
    reason: "Something's different, like a new number.",
    strong: true,
    why: [
      "Scammers say things like 'Hi Mum, new number' to sound like family.",
      'Next time, ask a grown-up to call the person on their old number.',
    ],
  },
  'rushes you': {
    label: 'Rushing you',
    reason: 'Hurrying stops you from thinking.',
    strong: false,
    why: [
      "When you hurry, you don't have time to think.",
      'Real offers can wait.',
      'Next time, take a breath and ask a grown-up.',
    ],
  },
  'threatens you': {
    label: 'Trying to scare you',
    reason: "It's not your fault.",
    strong: true,
    why: [
      'People who scare you want you to act before you think.',
      "It's not your fault.",
      'Show a grown-up right away.',
    ],
  },
  'asks you to move to another app or keep a secret': {
    label: 'Asks for a secret',
    reason: "Safe people don't ask you to keep secrets.",
    strong: true,
    why: [
      'Asking you to keep a secret, or to talk in another app, is a big warning sign.',
      "Safe people don't mind grown-ups knowing.",
      'Next time, tell a grown-up straight away.',
    ],
  },
  'wants you to download something': {
    label: 'Wants a download',
    reason: 'It could put a bad app on your device.',
    strong: true,
    why: [
      'Downloads from strangers can hide bad apps.',
      'They can spy on you or break your device.',
      'Next time, ask a grown-up before downloading anything.',
    ],
  },
}

// The most links in a picture to look up (each one is a server check)
const MAX_LINKS = 3


// Where a kid can say the picture came from, before checking it (optional)
export const PLACES = ["Someone I don't know", 'A friend', 'A game', 'An ad or video', 'Something else'] as const
export type Place = (typeof PLACES)[number]

// What's sent with the picture about where it came from. What the kid typed is
// only sent if it has no personal details (like the chat: askRules.ts); if it
// sounds upsetting, the result says "Show a grown-up right now".
export function contextFor(place: Place | null, typed: string) {
  const note = typed.trim()
  const personal = hasPersonalDetails(note)
  const parts = [place && place !== 'Something else' ? `From: ${place}` : '', personal ? '' : note].filter(Boolean)
  return { context: parts.join('. ') || undefined, personal, upset: soundsUpset(note) }
}

// Sends the pictures (up to 3, of the same thing) to be checked together; null if
// the server can't answer (no server, no setup, too slow, the AI couldn't answer,
// or over today's limit)
export async function lookUpPicture(pictures: PreparedPicture[], context?: string): Promise<PictureFacts | null> {
  if (!SERVER || !isSetUp()) return null
  try {
    const res = await fetch(`${SERVER}/picture`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ images: await Promise.all(pictures.map((p) => base64(p.blob))), context }),
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
export const COULD_NOT_CHECK: CheckResult = {
  risk: 'medium',
  clues: [{ label: "Couldn't check it", reason: 'Show it to a grown-up instead.' }],
}
const COULD_NOT_READ: CheckResult = {
  risk: 'medium',
  clues: [{ label: 'Hard to read', reason: 'Try a clearer screenshot, or show a grown-up.' }],
}

// Claude wouldn't look at the picture: it may show something that isn't OK for
// kids, so a grown-up should see it now (and the picture is blurred)
export const DECLINED: CheckResult = {
  risk: 'high',
  urgent: true,
  hidePicture: true,
  clues: [
    {
      label: 'Something not OK for kids',
      reason: "Some pictures aren't OK for kids to see.",
      why: ["Some pictures aren't OK for kids to see.", "You haven't done anything wrong.", 'Show a grown-up you trust right away.'],
    },
  ],
}

// Turns what the server saw into the result: one clue per warning sign (with a box
// for every place it appears), then what the link checker says about any links in
// the picture. `lookUp` is the link checker's server check (a stand-in in tests).
// The clues for the links in a picture or message: each checked like the link
// checker does (on the device, then the server), as one short clue marked with a
// box (pictures) or by its address in the text (messages)
export async function linkClues(links: { address: string; box?: Box }[], lookUp = lookUpLink) {
  const clues: Clue[] = []
  let strong = false
  let notForKids = false
  const found = links.flatMap(({ address, box }) => {
    const link = checkLink(address)
    return link ? [{ link, address, box }] : []
  })
  const checked = await Promise.all(
    found.slice(0, MAX_LINKS).map(async ({ link, address, box }) => ({ link: withFacts(link, await lookUp(link.url)), address, box })),
  )
  for (const { link, address, box } of checked) {
    if (!link.clues.length) continue
    const scam = link.risk === 'high' && !link.notForKids
    clues.push({
      label: scam ? 'A trick link' : link.notForKids ? 'A link not for kids' : 'A link to be careful with',
      reason: `${link.clues[0].label}: ${link.site}`,
      why: scam
        ? ['Links can look real but take you somewhere else.', `This one goes to ${link.site}. ${link.clues[0].reason}`, "Don't tap it. Show a grown-up."]
        : link.notForKids
          ? [`That link goes to ${link.site}, a website made for grown-ups.`, "Don't open it. Show a grown-up."]
          : ['Something about that link looks odd.', link.clues[0].reason, 'Ask a grown-up before you tap it.'],
      ...(box ? { boxes: [box] } : { highlight: address }),
    })
    strong ||= scam
    notForKids ||= Boolean(link.notForKids)
  }
  return { clues, strong, notForKids }
}

// The clue for a warning sign, in kid words, marked by `mark` (boxes or words)
export function signClue(sign: Sign, mark: Pick<Clue, 'boxes' | 'highlight'>): Clue {
  const { label, reason, why } = SIGN_WORDS[sign]
  return { label, reason, why, ...mark }
}

// The result from the signs and the links' clues: red for strong signs or links (or
// a website not for kids), yellow for others, and urgent for threats
export function resultFrom(signs: { sign: Sign; clue: Clue }[], links: Awaited<ReturnType<typeof linkClues>>, urgent: boolean): CheckResult {
  const strong = signs.some(({ sign }) => SIGN_WORDS[sign].strong) || links.strong
  const clues = [...signs.map(({ clue }) => clue), ...links.clues]
  const risk = strong || links.notForKids ? 'high' : clues.length ? 'medium' : 'none'
  return { risk, clues, notForKids: links.notForKids && !strong, urgent }
}

export async function pictureResult(facts: PictureFacts | null, lookUp = lookUpLink): Promise<CheckResult> {
  if (!facts) return COULD_NOT_CHECK
  if (facts.declined) return DECLINED
  if (!facts.readable) return COULD_NOT_READ

  // One clue per sign, in the order they first appear, with a box for each place
  const bySign = new Map<Sign, Box[]>()
  for (const { sign, box } of facts.signs) bySign.set(sign, [...(bySign.get(sign) ?? []), box])
  const signs = [...bySign].map(([sign, boxes]) => ({ sign, clue: signClue(sign, { boxes }) }))
  return resultFrom(signs, await linkClues(facts.links, lookUp), facts.threatOrPhotos)
}
