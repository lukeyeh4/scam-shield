import { storedSwitch } from '../storedSwitch'
import type { CheckResult, Clue } from './examples'

// Whether a link's result says what kind of grown-up website it is (betting,
// pirated shows and sports) or only that it isn't for kids. Off until a grown-up
// turns it on (GrownUpsScreen): saying what's there can make a kid curious to
// look. Scam clues always explain the trick, since spotting it is the lesson.

const sayKind = storedSwitch('scam-shield-say-website-kind', false)
export const setSayWebsiteKind = sayKind.set
export const useSayWebsiteKind = sayKind.use

// Clues that say what kind of website it is (linkCheck.ts, linkLookup.ts). Any
// of them makes the result red, with the heading "This website isn't for kids"
// unless it's a scam as well (Result.tsx)
const KIND_LABELS = new Set(['A betting website', 'Free shows or sports without paying', 'Not for kids'])
export const isWebsiteKind = (clue: Clue) => KIND_LABELS.has(clue.label)

export const NOT_FOR_KIDS: Clue = {
  label: 'Not for kids',
  reason: 'This website is made for grown-ups, not for kids.',
}

// The same result, with every kind-of-website clue turned into one "Not for kids"
// (in the first one's place, keeping its highlight)
export function withoutWebsiteKind(result: CheckResult): CheckResult {
  const first = result.clues.findIndex(isWebsiteKind)
  if (first < 0) return result
  const clues = result.clues.flatMap((c, i) =>
    !isWebsiteKind(c) ? [c] : i === first ? [{ ...NOT_FOR_KIDS, highlight: c.highlight }] : [],
  )
  return { ...result, clues }
}
