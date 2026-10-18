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
    why: ['A password is like the key to your house.', 'With it, someone can get into your account and take your things.', "Never share it. Ask a grown-up if you're not sure."],
  },
  'asks for money, gift cards or card details': {
    label: 'Asks for money or gift cards',
    reason: 'Once you send it, the money is gone.',
    strong: true,
    why: ['Gift card codes are just like cash.', "Once you send one, you can't get it back. That's why scammers ask for them.", 'Ask a grown-up first.'],
  },
  'asks for personal details': {
    label: 'Asks about you',
    reason: 'Keep where you live and your school private.',
    strong: true,
    why: ['Your address and school tell a stranger where to find you.', 'Keep them private, and tell a grown-up if someone asks.'],
  },
  'asks for photos or videos of you': {
    label: 'Asks for photos of you',
    reason: 'Never send photos of yourself.',
    strong: true,
    why: ['Someone asking for photos of you is not OK.', "You haven't done anything wrong.", 'Show a grown-up you trust right away.'],
  },
  'free prize or free game money': {
    label: 'Free prizes',
    reason: 'Free stuff from strangers is a common trick.',
    strong: true,
    why: ["Nobody gives free Robux or prizes to people they don't know.", "It's bait, like a worm on a fishing hook.", "Ask a grown-up if you're not sure."],
  },
  'sad story to get you to buy or give money': {
    label: 'A sad story to make you pay',
    reason: 'Sad stories are used to make you buy fast.',
    strong: false,
    why: ['Sad stories make us want to help. That shows you are kind!', 'But scammers use them to make people buy without thinking.', 'Ask a grown-up before buying anything.'],
  },
  // Only "Be careful": we can't prove a photo is made with AI, only that what
  // arrives may look very different (even from a real shop like Amazon)
  'product that may not look like the photo': {
    label: "Might not look like that",
    reason: 'What arrives may look very different.',
    strong: false,
    why: [
      'Some product photos are made with AI or changed to look amazing.',
      'What comes in the post can look nothing like the picture, even from a real shop.',
      'Ask a grown-up before buying.',
    ],
  },
  'pretends to be a company, game or famous person': {
    label: 'Pretending to be someone',
    reason: 'It might not really be them.',
    strong: true,
    why: ['Anyone can use a famous name or logo.', "That doesn't make it real.", 'A grown-up can help you check.'],
  },
  'pretends to be family or a friend': {
    label: 'Maybe not who they say',
    reason: "Something's different, like a new number.",
    strong: true,
    why: ["Scammers say things like 'Hi Mum, new number' to sound like family.", 'A grown-up can call the real person to check.'],
  },
  'rushes you': {
    label: 'Rushing you',
    reason: 'Hurrying stops you from thinking.',
    strong: false,
    why: ["When you hurry, you don't have time to think.", 'Real offers can wait.', 'Take a breath and ask a grown-up.'],
  },
  'threatens you': {
    label: 'Trying to scare you',
    reason: "It's not your fault.",
    strong: true,
    why: ['People who scare you want you to act before you think.', "It's not your fault.", 'Show a grown-up right away.'],
  },
  'asks you to move to another app or keep a secret': {
    label: 'Asks for a secret',
    reason: "Safe people don't ask you to keep secrets.",
    strong: true,
    why: ['Asking you to keep a secret, or to talk in another app, is a big warning sign.', "Safe people don't mind grown-ups knowing.", 'Tell a grown-up.'],
  },
  'wants you to download something': {
    label: 'Wants a download',
    reason: 'It could put a bad app on your device.',
    strong: true,
    why: ['Downloads from strangers can hide bad apps.', 'They can spy on you or break your device.', 'Ask a grown-up first.'],
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
  clues: [{ label: "Couldn't check it", reason: 'Show it to a grown-up instead.' }],
}
const COULD_NOT_READ: CheckResult = {
  risk: 'medium',
  clues: [{ label: 'Hard to read', reason: 'Try a clearer screenshot, or show a grown-up.' }],
}

// Claude wouldn't look at the picture: it may show something that isn't OK for
// kids, so a grown-up should see it now (and the picture is blurred)
const DECLINED: CheckResult = {
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
export async function pictureResult(facts: PictureFacts | null, lookUp = lookUpLink): Promise<CheckResult> {
  if (!facts) return COULD_NOT_CHECK
  if (facts.declined) return DECLINED
  if (!facts.readable) return COULD_NOT_READ

  // One clue per sign, in the order they first appear
  const bySign = new Map<Sign, Box[]>()
  for (const { sign, box } of facts.signs) bySign.set(sign, [...(bySign.get(sign) ?? []), box])
  const clues: Clue[] = [...bySign].map(([sign, boxes]) => {
    const { label, reason, why } = SIGN_WORDS[sign]
    return { label, reason, why, boxes }
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
      why: scam
        ? ['Links can look real but take you somewhere else.', `This one goes to ${link.site}. ${link.clues[0].reason}`, "Don't tap it. Show a grown-up."]
        : link.notForKids
          ? [`That link goes to ${link.site}, a website made for grown-ups.`, "Don't open it. Show a grown-up."]
          : ['Something about that link looks odd.', link.clues[0].reason, 'Ask a grown-up before you tap it.'],
      boxes: [box],
    })
    strong ||= scam
    notForKids ||= Boolean(link.notForKids)
  }

  const risk = strong || notForKids ? 'high' : clues.length ? 'medium' : 'none'
  return { risk, clues, notForKids: notForKids && !strong, urgent: facts.threatOrPhotos }
}
