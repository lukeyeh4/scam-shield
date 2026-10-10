import { scenarios } from '../scenarios'

// What every check returns, whichever tool made it: how risky it looks, and the
// clues, each with a short name, a reason in kid words, and (for text) the exact
// words to highlight. Links are really checked (linkCheck.ts); pictures and
// messages still show the made-up examples below.
export type Risk = 'high' | 'medium' | 'none'

export type Clue = { label: string; reason: string; highlight?: string }

export type CheckResult = { risk: Risk; clues: Clue[] }

// Check a picture: the "new number" scam from the game, with its "Spot the clues" red flags
export const examplePicture = scenarios.find((s) => s.id === 'new-number')
const pictureClues = examplePicture
  ? [examplePicture.recap.stop, ...examplePicture.recap.check].filter((c) => c.spot && c.screen !== 'doIt')
  : []
export const pictureResult: CheckResult = {
  risk: 'high',
  clues: pictureClues.map((c) => ({ label: c.spot!, reason: c.text, highlight: c.highlight })),
}
// Which parts of the picture to mark (they match `pictureResult.clues`, in order)
export const pictureMarks = pictureClues.map((c) => ({ target: c.target, highlight: c.highlight }))

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
