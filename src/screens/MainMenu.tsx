import { Buddy } from '../buddy/Buddy'

const STEPS = [
  { label: 'Stop', hint: 'Slow down' },
  { label: 'Check', hint: 'Look for clues' },
  { label: 'Tell', hint: 'Tell a grown-up' },
]

export function MainMenu({ onStart }: { onStart: () => void }) {
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

      <button className="menu-start" type="button" onClick={onStart}>
        Start
      </button>
    </main>
  )
}
