import { SpeakerIcon } from '../icons'
import { canReadAloud, setReadAloud, useReadAloud } from '../readAloud'

// Turns read-aloud on and off. Stays in the top corner on every screen; on phones
// it's just the speaker icon, so it doesn't cover the screen's title.
export function ReadAloudToggle() {
  const on = useReadAloud()
  if (!canReadAloud) return null
  return (
    <button className="read-aloud" type="button" aria-pressed={on} aria-label="Read aloud" onClick={() => setReadAloud(!on)}>
      <SpeakerIcon className="read-aloud-icon" />
      <span className="read-aloud-label" aria-hidden="true">
        Read aloud: {on ? 'On' : 'Off'}
      </span>
    </button>
  )
}
