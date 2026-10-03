import { Buddy } from '../buddy/Buddy'
import { CHOICES } from '../labels'
import { Mockup } from '../mockups/Mockup'
import type { Scenario } from '../types'

// Wireframe: the scam screen, the three choices, and Shield Buddy in the corner.
export function ScenarioScreen({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  return (
    <div className="app">
      <header className="app-header">
        <button className="back" type="button" onClick={onBack}>
          ← Menu
        </button>
        {scenario.title}
      </header>

      <main className="app-main">
        <Mockup screen={scenario} />
        <Buddy mood="curious" text={scenario.buddy.intro} corner />
      </main>

      <footer className="choices">
        {CHOICES.map((c) => (
          <button key={c.id} className="choice" type="button">
            <span className="choice-emoji">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </footer>
    </div>
  )
}
