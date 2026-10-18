// What every check returns, whichever tool made it: how risky it looks, and the
// clues, each with a short name, a reason in kid words, and the exact words to
// highlight (text) or the boxes to draw (pictures). Links (linkCheck.ts),
// pictures (pictureLookup.ts) and messages (messageLookup.ts) are really checked.
export type Risk = 'high' | 'medium' | 'none'

// A box on a picture, from 0 to 1000 across and down
export type Box = { left: number; top: number; right: number; bottom: number }

// `why`: what Shield Buddy says when a kid taps "Why?" on the clue: a few short,
// scripted lines that end with a grown-up (Result.tsx; without it, Buddy says the
// reason)
export type Clue = { label: string; reason: string; highlight?: string; boxes?: Box[]; why?: string[] }

// `good`: facts in its favour (e.g. "This is the real Roblox website"), shown only
// when there are no clues. Never "safe": a check can miss things.
// `notForKids`: high because the website isn't for kids (betting, adult, pirated
// streams: tools/websiteKind.ts), not because it's a scam, so it gets its own heading
// `urgent`: someone is threatening the child or asking for photos of them: a calm
// "Show a grown-up right now" instead of the usual heading (Result.tsx)
// `hidePicture`: the picture may not be OK to look at again, so the result blurs it
export type CheckResult = { risk: Risk; clues: Clue[]; good?: string[]; notForKids?: boolean; urgent?: boolean; hidePicture?: boolean }

// The clues in the order their words come in `text` (top to bottom), so the
// numbers marked in the text count up as you read; clues without words go last
export function inTextOrder(result: CheckResult, text: string): CheckResult {
  const at = (c: Clue) => {
    const i = c.highlight ? text.indexOf(c.highlight) : -1
    return i < 0 ? Infinity : i
  }
  return { ...result, clues: [...result.clues].sort((a, b) => at(a) - at(b)) }
}

// The clues in the order their first boxes come down a picture, so the numbers
// count down it as you read; clues without boxes go last
export function inPictureOrder(result: CheckResult): CheckResult {
  const at = (c: Clue) => (c.boxes?.length ? Math.min(...c.boxes.map((b) => b.top)) : Infinity)
  return { ...result, clues: [...result.clues].sort((a, b) => at(a) - at(b)) }
}
