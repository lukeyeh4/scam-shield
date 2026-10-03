import { useCallback, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { CHOICES } from '../labels'
import { arrivalDelay } from '../mockups/arrival'
import { Mockup } from '../mockups/Mockup'
import type { Scenario } from '../types'

// Said after every scenario's intro. Stays neutral: no hints before the choice.
const CHOOSE_PROMPT = 'Read it carefully. Then pick what you would do.'

// Wireframe: the scam screen with Shield Buddy beside it. Once Buddy has finished
// talking, the three choices slide up from the bottom.
export function ScenarioScreen({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  const [showChoices, setShowChoices] = useState(false)
  const revealChoices = useCallback(() => setShowChoices(true), [])

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
            <button key={c.id} className="choice" type="button">
              {c.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
