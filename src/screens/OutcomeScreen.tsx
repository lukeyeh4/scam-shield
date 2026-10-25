import { useCallback, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { ChevronIcon } from '../icons'
import { CHOICES, RESULTS, WHAT_IF } from '../labels'
import type { Choice, Scenario } from '../types'
import './results.css'

type OutcomeScreenProps = {
  scenario: Scenario
  choice: Choice
  onBack: () => void
  onContinue: () => void
}

// Screen 3: what happened after the player's choice, explained by Shield Buddy,
// then what the other two choices would have led to: just the choice and its
// result, and tapping one opens what would have happened (like a result's clues),
// so there's never much to read at once.
export function OutcomeScreen({ scenario, choice, onBack, onContinue }: OutcomeScreenProps) {
  const [revealed, setRevealed] = useState(false)
  const reveal = useCallback(() => setRevealed(true), [])
  // The "What if you had…" card that's open, if any
  const [open, setOpen] = useState<Choice>()

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
          <div className="outcome-others-head">
            <h2 className="outcome-others-title">What if you had…</h2>
            <span className="outcome-others-hint">Tap one to see</span>
          </div>
          <div className="outcome-cards">
            {others.map((c) => {
              const other = scenario.outcomes[c.id]
              const isOpen = open === c.id
              return (
                <div key={c.id} className={isOpen ? 'outcome-card is-open' : 'outcome-card'}>
                  <button
                    className="outcome-card-button"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? undefined : c.id)}
                  >
                    <strong>…{scenario.whatIf?.[c.id] ?? WHAT_IF[c.id]}</strong>
                    <span className={`result-tag result-${other.result}`}>{RESULTS[other.result].label}</span>
                    <ChevronIcon className="outcome-card-arrow" />
                  </button>
                  {isOpen && <p>{other.text}</p>}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className={revealed ? 'scenario-footer' : 'scenario-footer scenario-footer-hidden'} inert={!revealed}>
        <button className="primary-button" type="button" onClick={onContinue}>
          Next: Spot the clues
        </button>
      </footer>
    </div>
  )
}
