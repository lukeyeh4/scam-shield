import type { Mood } from '../types'
import cheering from '../../shield_buddy/cheering.png'
import curious from '../../shield_buddy/curious.png'
import happy from '../../shield_buddy/happy.png'
import neutral from '../../shield_buddy/neutral.png'
import thinking from '../../shield_buddy/thinking.png'
import worried from '../../shield_buddy/worried.png'

const IMAGES: Record<Mood, string> = { cheering, curious, happy, neutral, thinking, worried }

// `corner` pins Buddy to the bottom-right of the screen, above the choices.
export function Buddy({ mood, text, corner = false }: { mood: Mood; text: string; corner?: boolean }) {
  return (
    <div className={corner ? 'buddy buddy-corner' : 'buddy'}>
      <p className="buddy-bubble" aria-live="polite">
        {text}
      </p>
      <img className="buddy-image" src={IMAGES[mood]} alt={`Shield Buddy looking ${mood}`} />
    </div>
  )
}
