import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import type { Mark } from '../mockups/marks'
import { Mockup } from '../mockups/Mockup'
import type { RecapItem, Scenario } from '../types'
import './results.css'

type Phase = 'stop' | 'check' | 'tell'
type Step = { phase: Phase; text: string; item?: RecapItem }

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
}

// Screen 4: Stop, Check, Tell. The scam comes back, and each step highlights
// a red flag on it while Shield Buddy explains.
export function RecapScreen({ scenario, isLast, onBack, onNext }: RecapScreenProps) {
  const { recap } = scenario
  const steps: Step[] = [
    { phase: 'stop', text: recap.stop.text, item: recap.stop },
    ...recap.check.map((item): Step => ({ phase: 'check', text: item.text, item })),
    { phase: 'tell', text: recap.tell },
  ]
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const phaseIndex = PHASES.findIndex((p) => p.id === step.phase)

  // Clues already shown stay lightly marked; the current one is highlighted
  const marks: Mark[] = steps.slice(0, index + 1).flatMap((s, i) =>
    s.item ? [{ target: s.item.target, highlight: s.item.highlight, state: i === index ? 'active' : 'seen' }] : [],
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
                {p.id === 'check' && step.phase === 'check' ? `Clue ${checkNumber} of ${recap.check.length}` : p.hint}
              </span>
            </li>
          ))}
        </ol>

        <div className="scenario-main">
          <Mockup screen={scenario} marks={marks} animate={false} />
          <div className="scenario-buddy">
            <Buddy key={index} mood={step.phase === 'tell' ? 'happy' : 'neutral'} messages={[step.text]} />
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
