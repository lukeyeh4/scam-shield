import type { ReactNode } from 'react'
import { ChevronIcon } from '../icons'

// The warm colours for icon tiles: close together, so nothing clashes
export type Tone = 'orange' | 'peach' | 'gold' | 'amber'

type OptionCardProps = {
  title: string
  // A short line under the title (the home screen has one; the chat doesn't)
  hint?: string
  icon?: ReactNode
  tone?: Tone
  onClick: () => void
}

// A big, warm card to tap: a coloured icon tile, a title (and a short line), and an
// arrow. The home screen and the chat with Shield Buddy both use it, so they match.
export function OptionCard({ title, hint, icon, tone = 'orange', onClick }: OptionCardProps) {
  return (
    <button className={icon ? 'option-card' : 'option-card option-card-plain'} type="button" onClick={onClick}>
      {icon && <span className={`option-tile tone-${tone}`}>{icon}</span>}
      <span className="option-text">
        <span className="option-title">{title}</span>
        {hint && <span className="option-hint">{hint}</span>}
      </span>
      <ChevronIcon className="option-arrow" />
    </button>
  )
}
