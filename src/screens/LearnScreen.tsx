import { BADGES, useDoneScenarios, useEarnedBadges } from '../badges'
import { TickIcon } from '../icons'
import { scenarios } from '../scenarios'
import { ToolScreen } from '../tools/ToolScreen'
import { BadgeList } from './Badges'
import { OptionCard } from './OptionCard'
import './results.css'

type LearnScreenProps = {
  // Plays a scenario, counting from 1
  onPlay: (scenario: number) => void
  onBack: () => void
}

// Learn about scams: how many scams the player has finished, one button to carry
// on, every scam to pick from (a tick on the ones done), and the badges
export function LearnScreen({ onPlay, onBack }: LearnScreenProps) {
  const done = useDoneScenarios()
  const earned = useEarnedBadges()
  const finished = scenarios.filter((s) => done.includes(s.id)).length
  const next = scenarios.findIndex((s) => !done.includes(s.id))
  const button = finished === 0 ? 'Start' : next === -1 ? 'Play again' : 'Keep going'

  return (
    <ToolScreen title="Learn about scams" onBack={onBack} note={null}>
      <div className="learn">
        <section className="learn-progress">
          <h2 className="learn-progress-text">
            {finished} of {scenarios.length} scams done
          </h2>
          <span className="tool-progress-bar" aria-hidden="true">
            {scenarios.map((s) => (
              <span key={s.id} className={done.includes(s.id) ? 'is-on' : undefined} />
            ))}
          </span>
          <button className="primary-button" type="button" onClick={() => onPlay(next === -1 ? 1 : next + 1)}>
            {button}
          </button>
        </section>

        <h2 className="menu-heading">The scams</h2>
        <nav className="learn-list" aria-label="The scams">
          {scenarios.map((s, i) => {
            const isDone = done.includes(s.id)
            return (
              <OptionCard
                key={s.id}
                icon={isDone ? <TickIcon /> : <span className="learn-number">{i + 1}</span>}
                tone={isDone ? 'gold' : 'peach'}
                title={s.title}
                status={isDone ? 'done' : undefined}
                onClick={() => onPlay(i + 1)}
              />
            )
          })}
        </nav>

        <h2 className="menu-heading">
          Your badges: {earned.length} of {BADGES.length}
        </h2>
        <BadgeList />
      </div>
    </ToolScreen>
  )
}
