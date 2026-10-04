import { useEffect, useState, type MouseEvent } from 'react'
import { Buddy } from '../buddy/Buddy'
import type { Mark } from '../mockups/marks'
import { Mockup } from '../mockups/Mockup'
import type { Mood, Scenario } from '../types'
import './results.css'
import './spot.css'

// What Shield Buddy says as clues are found, in turn
const FOUND = ['You found one!', 'Good eyes!', 'Nice spotting!', 'Yes, that one too!']
const ALL_FOUND = "You found them all! Now let's see what each clue means."

// How long a clue stays brightly lit after it's found. Then it fades to a lighter
// highlight, and a notification banner slides away (like on a real phone) to
// show what was under it.
const FRESH_MS = 1500

type SpotScreenProps = {
  scenario: Scenario
  onBack: () => void
  onContinue: () => void
}

// Before the recap: the scam comes back, and the player taps the red flags
// themselves. Tapping anywhere in a clue's text counts. Uses the recap's clues
// that are on the scam screen (not the "Do it" screen).
export function SpotScreen({ scenario, onBack, onContinue }: SpotScreenProps) {
  const { recap } = scenario
  const clues = [recap.stop, ...recap.check].filter((c) => c.screen !== 'doIt')
  // Clue numbers in the order they were found
  const [found, setFound] = useState<number[]>([])
  const [fresh, setFresh] = useState<number | null>(null)
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
    if (clue < 0 || found.includes(clue)) {
      const field = tapped.closest<HTMLElement>('[data-field]')?.dataset.field
      clue = clues.findIndex((c, i) => c.target === field && !found.includes(i))
    }
    if (clue >= 0) {
      setFound([...found, clue])
      setFresh(clue)
    }
  }

  let mood: Mood = 'curious'
  let messages = ["Let's look again. Can you spot the clues?", `Tap anything that looks wrong. There are ${clues.length} to find.`]
  if (allFound) {
    mood = 'cheering'
    messages = [ALL_FOUND]
  } else if (found.length > 0) {
    mood = 'happy'
    messages = [FOUND[(found.length - 1) % FOUND.length]]
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
          <Buddy key={found.length} mood={mood} messages={messages} />
        </div>
      </main>

      <footer className="scenario-footer spot-footer">
        <p className="spot-count" aria-live="polite">
          Clues found: <strong>{found.length}</strong> of {clues.length}
        </p>
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
