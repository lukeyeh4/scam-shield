import { useEffect, useState, type MouseEvent } from 'react'
import { recordAllCluesFound } from '../badges'
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
const MISSED = ['Not that one. Keep looking!', 'Hmm, try somewhere else.', 'Stuck? Tap the hint button.']
const OTHER_CLUE = "Good eye! That's a clue too. Can you find the ones on the list?"
const AGAIN = 'You found that one already! Look for the others.'
// A second hint for the same clue: its exact words glow
const HINT_AGAIN = "Look closely at the part that's glowing."

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
// fake screen. Tapping anywhere in a clue's text counts, and so does any other
// place the clue lists in `spotAlso`. The hint button nudges towards the next
// clue: first Buddy's `spotHint` and a soft glow where to look, then its exact words.
export function SpotScreen({ scenario, onBack, onContinue }: SpotScreenProps) {
  const { recap } = scenario
  const allClues = [recap.stop, ...recap.check].filter((c) => c.screen !== 'doIt')
  const clues = allClues.filter((c) => c.spot)
  // Clue numbers in the order they were found
  const [found, setFound] = useState<number[]>([])
  const [fresh, setFresh] = useState<number | null>(null)
  // Everything Buddy has said, so the player can scroll back up; its mood follows the latest
  const [said, setSaid] = useState<{ mood: Mood; text: string }[]>([
    { mood: 'curious', text: "Let's look again. Can you find these clues?" },
    { mood: 'curious', text: 'Tap each one on the screen. If you need help, tap the hint button.' },
  ])
  // The clue being hinted at, and whether it's the first hint (where to look) or
  // the second (its exact words)
  const [hint, setHint] = useState<{ clue: number; exact: boolean } | null>(null)
  const [misses, setMisses] = useState(0)
  const say = (mood: Mood, text: string) => setSaid([...said, { mood, text }])
  const allFound = found.length === clues.length

  useEffect(() => {
    if (fresh === null) return
    const timer = setTimeout(() => setFresh(null), FRESH_MS)
    return () => clearTimeout(timer)
  }, [fresh])

  // Every place on the screen that counts, and which clue it finds
  const places = clues.flatMap((c, clue) => [
    { target: c.target, highlight: c.highlight, clue },
    ...(c.spotAlso ?? []).map((also) => ({ ...also, clue })),
  ])
  // Clues that aren't on the list but share text with one that is (e.g. "Limited time!"
  // next to "claim your free Robux"), so a tap on them isn't taken for the listed one
  const others = allClues.filter((c) => !c.spot && c.highlight && places.some((p) => p.target === c.target))
  // Once a clue is found, all its places light up
  const marks: Mark[] = [
    ...places.map((p): Mark => ({
      target: p.target,
      highlight: p.highlight,
      state: !found.includes(p.clue) ? 'hidden' : p.clue === fresh ? 'active' : 'seen',
    })),
    ...others.map((c): Mark => ({ target: c.target, highlight: c.highlight, state: 'hidden' })),
  ]
  if (hint) {
    const place = places.findIndex((p) => p.clue === hint.clue)
    // The second hint lights up the clue's own words; the first, softly, the part of the screen it's in
    if (hint.exact) marks[place] = { ...marks[place], state: 'hint' }
    else marks.push({ target: places[place].target, state: 'hint' })
  }

  const askForHint = () => {
    const next = clues.findIndex((_, i) => !found.includes(i))
    if (hint?.clue === next) {
      setHint({ clue: next, exact: true })
      say('thinking', HINT_AGAIN)
    } else {
      setHint({ clue: next, exact: false })
      say('thinking', clues[next].spotHint ?? HINT_AGAIN)
    }
  }

  const onTap = (e: MouseEvent) => {
    const tapped = e.target as HTMLElement
    // The exact clue text, if that was tapped and is still to be found...
    const mark = tapped.closest<HTMLElement>('[data-mark]')
    const markIndex = mark ? Number(mark.dataset.mark) : -1
    const onOther = markIndex >= places.length
    let clue = markIndex >= 0 && !onOther ? places[markIndex].clue : -1
    // ...or else any clue still to be found in the same part of the screen
    // (tapping around the text counts too, e.g. a message bubble's padding)
    const inside = tapped.querySelectorAll<HTMLElement>('[data-field]')
    const field = (tapped.closest<HTMLElement>('[data-field]') ?? (inside.length === 1 ? inside[0] : null))?.dataset.field
    if (!onOther && (clue < 0 || found.includes(clue))) {
      // (the clue being hinted at first, if it's in that part)
      const inField = places.filter((p) => p.target === field && !found.includes(p.clue))
      clue = (inField.find((p) => p.clue === hint?.clue) ?? inField[0])?.clue ?? -1
    }
    if (allFound) return
    if (clue >= 0) {
      setFound([...found, clue])
      setFresh(clue)
      if (hint?.clue === clue) setHint(null)
      if (found.length + 1 === clues.length) {
        say('cheering', ALL_FOUND)
        recordAllCluesFound(scenario.id)
      } else say('happy', FOUND[found.length % FOUND.length])
    } else if (onOther) {
      say('happy', OTHER_CLUE)
    } else if (places.some((p) => p.target === field && found.includes(p.clue))) {
      say('happy', AGAIN)
    } else if (allClues.some((c) => c.target === field && !c.spot)) {
      say('happy', OTHER_CLUE)
    } else {
      say('thinking', MISSED[misses % MISSED.length])
      setMisses(misses + 1)
    }
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
          <Buddy mood={said[said.length - 1].mood} messages={said.map((m) => m.text)} />
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
          <button className="hint-button" type="button" onClick={askForHint}>
            <LightBulbIcon />
            Hint
          </button>
        )}
      </footer>
    </div>
  )
}

function LightBulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 20.5h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
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
