import type { ReactNode } from 'react'
import { ChevronIcon } from '../icons'

// The warm colours for icon tiles: close together, so nothing clashes
export type Tone = 'orange' | 'peach' | 'gold' | 'amber'

type OptionCardProps = {
  title: string
  // Read out after the title but not shown, e.g. "done" when the tile shows a tick
  status?: string
  icon?: ReactNode
  tone?: Tone
  onClick: () => void
}

// A big, warm card to tap: a coloured icon tile, a title and an arrow. The home
// screen, the Learn screen and the chat with Shield Buddy all use it, so they match.
export function OptionCard({ title, status, icon, tone = 'orange', onClick }: OptionCardProps) {
  return (
    <button className={icon ? 'option-card' : 'option-card option-card-plain'} type="button" onClick={onClick}>
      {icon && <span className={`option-tile tone-${tone}`}>{icon}</span>}
      <span className="option-title">
        {title}
        {status && <span className="sr-only">, {status}</span>}
      </span>
      <ChevronIcon className="option-arrow" />
    </button>
  )
}
