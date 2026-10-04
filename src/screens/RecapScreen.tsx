import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import type { Mark } from '../mockups/marks'
import { Mockup } from '../mockups/Mockup'
import type { ExtraMessage, RecapItem, RecapSummary, Scenario } from '../types'
import { SummaryCard } from './SummaryCard'
import './results.css'

type Phase = 'stop' | 'check' | 'tell'
type Step = {
  phase: Phase
  messages: string[]
  // The red flag to highlight on the scam screen
  item?: RecapItem
  // Replaces the step's hint under the progress bar
  hint?: string
  // Texts added to the phone during this step
  phone?: ExtraMessage[]
  // The last step: a summary card instead of the scam screen
  summary?: RecapSummary
}

const PHASES: { id: Phase; label: string; hint: string }[] = [
  { id: 'stop', label: 'Stop', hint: 'What rushed you' },
  { id: 'check', label: 'Check', hint: 'The clues' },
  { id: 'tell', label: 'Tell', hint: 'Who to tell' },
]

type RecapScreenProps = {
  scenario: Scenario
  isLast: boolean
  onBack: () => void
  onNext: () => void
  // DEV CONSOLE: open on the last step
  startAtSummary?: boolean
}

// Screen 4: Stop, Check, Tell. The scam comes back, and each step highlights
// a red flag on it while Shield Buddy explains.
export function RecapScreen({ scenario, isLast, onBack, onNext, startAtSummary }: RecapScreenProps) {
  const { recap } = scenario
  const steps: Step[] = [
    { phase: 'stop', messages: [recap.stop.text], item: recap.stop },
    ...recap.check.map((item): Step => ({ phase: 'check', messages: [item.text], item })),
    { phase: 'tell', messages: [recap.tell] },
    // What you can do instead (e.g. a family code word) finishes the Tell step
    ...(recap.tip
      ? [
          {
            phase: 'tell',
            messages: recap.tip.buddy,
            hint: recap.tip.label,
            phone: recap.tip.phone,
            item: recap.tip.target ? { target: recap.tip.target, highlight: recap.tip.highlight, text: '' } : undefined,
          } satisfies Step,
        ]
      : []),
    // Finally, a summary card: what you can do, and what to check for
    ...(recap.summary
      ? [{ phase: 'tell', messages: ["Great job! Here's what to remember."], summary: recap.summary } satisfies Step]
      : []),
  ]
  const [index, setIndex] = useState(startAtSummary ? steps.length - 1 : 0)
  const step = steps[index]
  // On the summary all three steps are done
  const phaseIndex = step.summary ? PHASES.length : PHASES.findIndex((p) => p.id === step.phase)

  // Clues about where "Do it" leads (e.g. the scam website) show that screen instead.
  // Steps without a clue keep showing whichever screen came before.
  const lastItem = steps.slice(0, index + 1).findLast((s) => s.item)?.item
  const onDoItScreen = lastItem?.screen === 'doIt' && scenario.doIt !== undefined
  const screen = onDoItScreen ? scenario.doIt! : scenario

  // Earlier clues from the same step (e.g. Check) and screen stay lightly marked;
  // the current one is highlighted. Stop's clue doesn't carry over into Check.
  const marks: Mark[] = steps.slice(0, index + 1).flatMap((s, i) =>
    s.item && s.phase === step.phase && (s.item.screen === 'doIt') === onDoItScreen
      ? [{ target: s.item.target, highlight: s.item.highlight, state: i === index ? 'active' : 'seen' }]
      : [],
  )

  const checkNumber = steps.slice(0, index + 1).filter((s) => s.phase === 'check').length

  return (
    <div className="scenario screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      <main className="recap-main">
        <ol className="stepper">
          {PHASES.map((p, i) => (
            <li
              key={p.id}
              className={`stepper-step ${i < phaseIndex ? 'is-done' : ''} ${i === phaseIndex ? 'is-current' : ''}`}
              aria-current={i === phaseIndex ? 'step' : undefined}
            >
              <span className="stepper-dot">{i + 1}</span>
              <span className="stepper-label">{p.label}</span>
              <span className="stepper-hint">
                {p.id === 'check' && step.phase === 'check'
                  ? `Clue ${checkNumber} of ${recap.check.length}`
                  : p.id === step.phase && step.hint
                    ? step.hint
                    : p.hint}
              </span>
            </li>
          ))}
        </ol>

        <div className={step.summary ? 'scenario-main summary-layout' : 'scenario-main'}>
          {step.summary ? (
            <SummaryCard summary={step.summary} />
          ) : (
            <Mockup
              key={onDoItScreen ? 'do-it' : 'scam'}
              screen={screen}
              marks={marks}
              animate={false}
              extraMessages={step.phone}
            />
          )}
          <div className="scenario-buddy">
            {/* Everything said so far stays, so the player can scroll back up */}
            <Buddy
              mood={step.summary ? 'cheering' : step.phase === 'tell' ? 'happy' : 'neutral'}
              messages={steps.slice(0, index + 1).flatMap((s) => s.messages)}
            />
          </div>
        </div>
      </main>

      <footer className="scenario-footer recap-footer">
        <button className="secondary-button" type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Back
        </button>
        {index < steps.length - 1 ? (
          <button className="primary-button" type="button" onClick={() => setIndex(index + 1)}>
            Next
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={onNext}>
            {isLast ? 'Finish' : 'Next scenario'}
          </button>
        )}
      </footer>
    </div>
  )
}
