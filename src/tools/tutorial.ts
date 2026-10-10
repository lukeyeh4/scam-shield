import type { Mark } from '../mockups/marks'
import type { RecapItem, Scenario } from '../types'
import type { CheckResult } from './examples'
import { checkLink } from './linkCheck'

// The scam's "Spot the clues" items that are on the scam screen itself
const spotClues = (scenario: Scenario): RecapItem[] =>
  [scenario.recap.stop, ...scenario.recap.check].filter((c) => c.spot && c.screen !== 'doIt')

const toClue = (c: RecapItem) => ({ label: c.spot!, reason: c.text, highlight: c.highlight })

// Check a picture of a scam screen: finds its "Spot the clues" items, and the parts
// of the picture to mark for each one (in the same order)
export function pictureCheck(scenario: Scenario): { result: CheckResult; marks: Mark[] } {
  const clues = spotClues(scenario)
  return {
    result: { risk: clues.length ? 'high' : 'none', clues: clues.map(toClue) },
    marks: clues.map((c) => ({ target: c.target, highlight: c.highlight, state: 'seen' })),
  }
}

// What "Check with Scam Shield" finds in a scenario's scam, with the tool it uses.
// Links are really checked; messages and pictures use the scenario's clues, until the
// AI checks them.
export function tutorialCheck(scenario: Scenario): { result: CheckResult; marks?: Mark[] } {
  const { tool, text = '' } = scenario.checkIt
  if (tool === 'picture') return pictureCheck(scenario)
  if (tool === 'link') return { result: checkLink(text) ?? { risk: 'none', clues: [] } }
  const clues = spotClues(scenario).filter((c) => c.highlight && text.includes(c.highlight))
  return { result: { risk: clues.length ? 'high' : 'none', clues: clues.map(toClue) } }
}
