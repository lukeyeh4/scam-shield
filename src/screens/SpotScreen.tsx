import { useEffect, useState, type MouseEvent } from 'react'
import { Buddy } from '../buddy/Buddy'
import type { Mark } from '../mockups/marks'
import { Mockup } from '../mockups/Mockup'
import type { Mood, Scenario } from '../types'
import './results.css'
import './spot.css'

// What Shield Buddy says, in turn, as clues are found and when a tap misses.
// Misses stay kind: no "wrong", just a nudge to keep looking.
const FOUND = ['You found one!', 'Good eyes!', 'Nice spotting!']
const ALL_FOUND = "You found them all! Now let's see what each clue means."
const MISSED = ['Not that one. Keep looking!', 'Hmm, try somewhere else.', 'Look at the list for help.']
const OTHER_CLUE = "Good eye! That's a clue too. Can you find the ones on the list?"
const AGAIN = 'You found that one already! Look for the others.'

// How long a clue stays brightly lit after it's found, before it fades to a
// lighter highlight
const FRESH_MS = 1500

type SpotScreenProps = {
  scenario: Scenario
  onBack: () => void
  onContinue: () => void
}

// Before the recap: the scam comes back with a short checklist of clues
// (the recap items with a `spot` name), and the player taps each one on the
// fake screen. Tapping anywhere in a clue's text counts.
export function SpotScreen({ scenario, onBack, onContinue }: SpotScreenProps) {
  const { recap } = scenario
  const allClues = [recap.stop, ...recap.check].filter((c) => c.screen !== 'doIt')
  const clues = allClues.filter((c) => c.spot)
  // Clue numbers in the order they were found
  const [found, setFound] = useState<number[]>([])
  const [fresh, setFresh] = useState<number | null>(null)
  // What happened on the last tap, so Buddy can react
  const [lastTap, setLastTap] = useState<{ kind: 'found' | 'again' | 'missed' | 'other'; count: number }>()
  const allFound = found.length === clues.length

  useEffect(() => {
    if (fresh === null) return
    const timer = setTimeout(() => setFresh(null), FRESH_MS)
    return () => clearTimeout(timer)
  }, [fresh])

  const marks: Mark[] = clues.map((c, i) => ({
    target: c.target,
    highlight: c.highlight,
    state: !found.includes(i) ? 'hidden' : i === fresh ? 'active' : 'seen',
  }))

  const onTap = (e: MouseEvent) => {
    const tapped = e.target as HTMLElement
    // The exact clue text, if that was tapped and is still to be found...
    const mark = tapped.closest<HTMLElement>('[data-mark]')
    let clue = mark ? Number(mark.dataset.mark) : -1
    // ...or else any clue still to be found in the same part of the screen
    const field = tapped.closest<HTMLElement>('[data-field]')?.dataset.field
    if (clue < 0 || found.includes(clue)) {
      clue = clues.findIndex((c, i) => c.target === field && !found.includes(i))
    }
    const count = (lastTap?.count ?? 0) + 1
    if (clue >= 0) {
      setFound([...found, clue])
      setFresh(clue)
      setLastTap({ kind: 'found', count })
    } else if (clues.some((c, i) => c.target === field && found.includes(i))) {
      setLastTap({ kind: 'again', count })
    } else if (allClues.some((c) => c.target === field && !c.spot)) {
      setLastTap({ kind: 'other', count })
    } else {
      setLastTap({ kind: 'missed', count })
    }
  }

  let mood: Mood = 'curious'
  let messages = ["Let's look again. Can you find these clues?", 'Tap each one on the screen.']
  if (allFound) {
    mood = 'cheering'
    messages = [ALL_FOUND]
  } else if (lastTap?.kind === 'found') {
    mood = 'happy'
    messages = [FOUND[(found.length - 1) % FOUND.length]]
  } else if (lastTap?.kind === 'again') {
    mood = 'happy'
    messages = [AGAIN]
  } else if (lastTap?.kind === 'other') {
    mood = 'happy'
    messages = [OTHER_CLUE]
  } else if (lastTap?.kind === 'missed') {
    mood = 'thinking'
    messages = [MISSED[lastTap.count % MISSED.length]]
  }

  return (
    <div className="scenario spot screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      <main className="scenario-main">
        {/* The fake screen isn't really interactive, so taps are only listened for here */}
        <div className="spot-screen" onClick={onTap}>
          <Mockup screen={scenario} marks={marks} animate={false} />
        </div>
        <div className="scenario-buddy">
          {/* A new key on every tap, so Buddy reacts (and moves) each time */}
          <Buddy key={lastTap?.count ?? 0} mood={mood} messages={messages} />
        </div>
      </main>

      <footer className="scenario-footer spot-footer">
        <ul className="spot-list" aria-label="Clues to find">
          {clues.map((c, i) => {
            const isFound = found.includes(i)
            return (
              <li key={i} className={isFound ? 'spot-item is-found' : 'spot-item'}>
                <CheckCircle checked={isFound} />
                {c.spot}
                {isFound && <span className="sr-only">(found)</span>}
              </li>
            )
          })}
        </ul>
        {allFound ? (
          <button className="primary-button" type="button" onClick={onContinue}>
            Next: Stop, Check, Tell
          </button>
        ) : (
          <button className="secondary-button" type="button" onClick={onContinue}>
            Show me the clues
          </button>
        )}
      </footer>
    </div>
  )
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <svg className="spot-check" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill={checked ? '#ffe066' : 'none'} stroke={checked ? '#f5b700' : '#b8bec9'} strokeWidth="2" />
      {checked && (
        <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#7a5600" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
