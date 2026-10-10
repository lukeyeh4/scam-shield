import { canReadAloud, setReadAloud, useReadAloud } from '../readAloud'

// Turns read-aloud on and off. Stays in the top corner on every screen.
export function ReadAloudToggle() {
  const on = useReadAloud()
  if (!canReadAloud) return null
  return (
    <button className="read-aloud" type="button" aria-pressed={on} onClick={() => setReadAloud(!on)}>
      Read aloud: {on ? 'On' : 'Off'}
    </button>
  )
}
