import { useCallback, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { CHOICES, RESULTS } from '../labels'
import type { Choice, Scenario } from '../types'
import './results.css'

type OutcomeScreenProps = {
  scenario: Scenario
  choice: Choice
  onBack: () => void
  onContinue: () => void
}

// Screen 3: what happened after the player's choice, explained by Shield Buddy,
// then what the other two choices would have led to.
export function OutcomeScreen({ scenario, choice, onBack, onContinue }: OutcomeScreenProps) {
  const [revealed, setRevealed] = useState(false)
  const reveal = useCallback(() => setRevealed(true), [])

  const chosen = CHOICES.find((c) => c.id === choice)!
  const outcome = scenario.outcomes[choice]
  const reaction = scenario.buddy.reactions[choice]
  const others = CHOICES.filter((c) => c.id !== choice)

  return (
    <div className="scenario screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      <main className="outcome-main">
        <div className="outcome-heading">
          <p className="outcome-chosen">
            You chose: <strong>{chosen.label}</strong>
          </p>
          <span className={`result-tag result-${outcome.result}`}>{RESULTS[outcome.result].label}</span>
        </div>

        <Buddy mood={reaction.mood} messages={[reaction.text, outcome.text]} onDone={reveal} />

        <section className={revealed ? 'outcome-others' : 'outcome-others is-hidden'} inert={!revealed}>
          <h2 className="outcome-others-title">What if you had…</h2>
          <div className="outcome-cards">
            {others.map((c) => {
              const other = scenario.outcomes[c.id]
              return (
                <div key={c.id} className="outcome-card">
                  <div className="outcome-card-top">
                    <strong>{c.label}</strong>
                    <span className={`result-tag result-${other.result}`}>{RESULTS[other.result].label}</span>
                  </div>
                  <p>{other.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className={revealed ? 'scenario-footer' : 'scenario-footer scenario-footer-hidden'} inert={!revealed}>
        <button className="primary-button" type="button" onClick={onContinue}>
          Next: Stop, Check, Tell
        </button>
      </footer>
    </div>
  )
}
