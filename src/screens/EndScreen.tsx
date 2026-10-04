import { Buddy } from '../buddy/Buddy'
import { BADGES, useEarnedBadges } from '../badges'
import { scenarios } from '../scenarios'
import { BadgeList } from './Badges'
import './results.css'

const STEPS = [
  { label: 'Stop', words: "If it's in a hurry, I'm not." },
  { label: 'Check', words: 'Does anything look weird?' },
  { label: 'Tell', words: 'When in doubt, tell someone out loud.' },
]

type EndScreenProps = {
  onPlayAgain: () => void
  onMenu: () => void
}

// After the last scenario: Stop, Check, Tell one more time, the badges earned,
// and what you can do next time for each scam.
export function EndScreen({ onPlayAgain, onMenu }: EndScreenProps) {
  const earned = useEarnedBadges()
  return (
    <main className="menu end screen-enter">
      <h1 className="menu-title">You did it!</h1>

      <Buddy
        mood="cheering"
        messages={[
          'You finished every scam! Great work.',
          'If something feels wrong, stop, check, and tell a grown-up.',
        ]}
      />

      <ol className="menu-steps">
        {STEPS.map((s) => (
          <li key={s.label}>
            <span className="menu-step-label">{s.label}</span>
            <span className="menu-step-hint">{s.words}</span>
          </li>
        ))}
      </ol>

      <h2 className="menu-heading">
        Your badges: {earned.length} of {BADGES.length}
      </h2>
      <BadgeList />

      <h2 className="menu-heading">What you can do</h2>
      <ol className="menu-list end-list">
        {scenarios.map((s, i) => (
          <li key={s.id} className="end-item">
            <span className="menu-scenario-number">{i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              {s.recap.summary && <p className="end-solution">{s.recap.summary.solution}</p>}
            </div>
          </li>
        ))}
      </ol>

      <div className="end-buttons">
        <button className="primary-button" type="button" onClick={onPlayAgain}>
          Play again
        </button>
        <button className="secondary-button" type="button" onClick={onMenu}>
          Menu
        </button>
      </div>
    </main>
  )
}
