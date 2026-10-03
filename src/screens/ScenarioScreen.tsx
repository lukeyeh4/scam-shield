import { useCallback, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { CHOICES } from '../labels'
import { arrivalDelay } from '../mockups/arrival'
import { Mockup } from '../mockups/Mockup'
import type { Choice, Scenario } from '../types'
import { OutcomeScreen } from './OutcomeScreen'
import { RecapScreen } from './RecapScreen'

// Said after every scenario's intro. Stays neutral: no hints before the choice.
const CHOOSE_PROMPT = 'Read it carefully. Then pick what you would do.'

type ScenarioScreenProps = {
  scenario: Scenario
  isLast: boolean
  onBack: () => void
  onNext: () => void
}

// Wireframe: the scam screen with Shield Buddy beside it. Once Buddy has finished
// talking, the three choices slide up from the bottom. Picking one leads to
// "What happened", then "Stop, Check, Tell".
export function ScenarioScreen({ scenario, isLast, onBack, onNext }: ScenarioScreenProps) {
  const [showChoices, setShowChoices] = useState(false)
  const revealChoices = useCallback(() => setShowChoices(true), [])
  const [choice, setChoice] = useState<Choice | null>(null)
  const [showRecap, setShowRecap] = useState(false)

  if (showRecap) return <RecapScreen scenario={scenario} isLast={isLast} onBack={onBack} onNext={onNext} />
  if (choice) {
    return <OutcomeScreen scenario={scenario} choice={choice} onBack={onBack} onContinue={() => setShowRecap(true)} />
  }

  return (
    <div className="scenario">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      <main className="scenario-main">
        <Mockup screen={scenario} />
        <div className="scenario-buddy">
          <Buddy
            key={scenario.id}
            mood="curious"
            messages={[scenario.buddy.intro, CHOOSE_PROMPT]}
            delayMs={arrivalDelay(scenario)}
            onDone={revealChoices}
          />
        </div>
      </main>

      {/* Always takes its space, so nothing jumps when it slides in */}
      <footer className={showChoices ? 'scenario-footer' : 'scenario-footer scenario-footer-hidden'} inert={!showChoices}>
        <h2 className="choices-question">What would you do?</h2>
        <div className="choices">
          {CHOICES.map((c) => (
            <button key={c.id} className="choice" type="button" onClick={() => setChoice(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
