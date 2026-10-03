import { Buddy } from '../buddy/Buddy'
import { scenarios } from '../scenarios'

const STEPS = [
  { label: 'Stop', hint: 'Slow down' },
  { label: 'Check', hint: 'Look for clues' },
  { label: 'Tell', hint: 'Tell a grown-up' },
]

export function MainMenu({ onPlay }: { onPlay: (index: number) => void }) {
  return (
    <main className="menu">
      <h1 className="menu-title">Scam Shield</h1>

      <Buddy mood="happy" messages={["Hi! I'm Shield Buddy. Let's learn to spot scams together!"]} />

      <ol className="menu-steps">
        {STEPS.map((s) => (
          <li key={s.label}>
            <span className="menu-step-label">{s.label}</span>
            <span className="menu-step-hint">{s.hint}</span>
          </li>
        ))}
      </ol>

      <button className="menu-start" type="button" onClick={() => onPlay(0)}>
        Start
      </button>

      <h2 className="menu-heading">Pick a scam</h2>
      <ol className="menu-list">
        {scenarios.map((s, i) => (
          <li key={s.id}>
            <button className="menu-scenario" type="button" onClick={() => onPlay(i)}>
              <span className="menu-scenario-number">{i + 1}</span>
              {s.title}
            </button>
          </li>
        ))}
      </ol>
    </main>
  )
}
