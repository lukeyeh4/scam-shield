// What every check returns, whichever tool made it: how risky it looks, and the
// clues, each with a short name, a reason in kid words, and the exact words to
// highlight (text) or the boxes to draw (pictures). Links (linkCheck.ts) and
// pictures (pictureLookup.ts) are really checked; messages still show the made-up
// example below.
export type Risk = 'high' | 'medium' | 'none'

// A box on a picture, from 0 to 1000 across and down
export type Box = { left: number; top: number; right: number; bottom: number }

export type Clue = { label: string; reason: string; highlight?: string; boxes?: Box[] }

// `good`: facts in its favour (e.g. "This is the real Roblox website"), shown only
// when there are no clues. Never "safe": a check can miss things.
// `notForKids`: high because the website isn't for kids (betting, adult, pirated
// streams: tools/websiteKind.ts), not because it's a scam, so it gets its own heading
// `urgent`: someone is threatening the child or asking for photos of them: a calm
// "Show a grown-up right now" instead of the usual heading (Result.tsx)
export type CheckResult = { risk: Risk; clues: Clue[]; good?: string[]; notForKids?: boolean; urgent?: boolean }

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

// Check a message
export const exampleMessage = 'omg is this you in this video?? 😂 bit.ly/3xVid'
export const messageResult: CheckResult = {
  risk: 'medium',
  clues: [
    {
      label: 'Trying to make you curious',
      reason: 'Scammers try to make you so curious that you tap without thinking.',
      highlight: 'is this you in this video??',
    },
    {
      label: 'A short link',
      reason: "Short links hide where they really go, so you can't tell if the website is real.",
      highlight: 'bit.ly/3xVid',
    },
  ],
}
