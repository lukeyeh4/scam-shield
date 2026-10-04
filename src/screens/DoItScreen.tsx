import { useCallback, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { Mockup } from '../mockups/Mockup'
import type { Scenario } from '../types'
import './results.css'

type DoItScreenProps = {
  scenario: Scenario
  doIt: NonNullable<Scenario['doIt']>
  onBack: () => void
  onContinue: () => void
}

// After "Do it", for scenarios that have it: where the scam takes you (e.g. a fake
// website), before showing what happened.
export function DoItScreen({ scenario, doIt, onBack, onContinue }: DoItScreenProps) {
  const [ready, setReady] = useState(false)
  const showButton = useCallback(() => setReady(true), [])

  return (
    <div className="scenario screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      <main className="scenario-main">
        <Mockup screen={doIt} />
        <div className="scenario-buddy">
          <Buddy mood="thinking" messages={doIt.buddy} delayMs={1400} onDone={showButton} />
        </div>
      </main>

      <footer className={ready ? 'scenario-footer' : 'scenario-footer scenario-footer-hidden'} inert={!ready}>
        <button className="primary-button" type="button" onClick={onContinue}>
          See what happens
        </button>
      </footer>
    </div>
  )
}
