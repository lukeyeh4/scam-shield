import { Buddy } from '../buddy/Buddy'
import { scenarios } from '../scenarios'

const STEPS = [
  { emoji: '🛑', label: 'Stop' },
  { emoji: '🔍', label: 'Check' },
  { emoji: '🗣️', label: 'Tell' },
]

export function MainMenu({ onPlay }: { onPlay: (index: number) => void }) {
  return (
    <main className="menu">
      <h1 className="menu-title">Scam Shield</h1>

      <ul className="menu-steps">
        {STEPS.map((s) => (
          <li key={s.label}>
            <span className="menu-step-emoji">{s.emoji}</span>
            {s.label}
          </li>
        ))}
      </ul>

      <Buddy mood="happy" text="Hi! I'm Shield Buddy. Let's learn to spot scams together!" />

      <button className="menu-start" type="button" onClick={() => onPlay(0)}>
        ▶ Start
      </button>

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
