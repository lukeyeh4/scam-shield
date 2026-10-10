import type { ReactNode } from 'react'
import { ChevronIcon, ScanIcon } from '../icons'

// The big card for Check a picture, the main tool, on the home and Check screens
export function ScanCard({ onClick }: { onClick: () => void }) {
  return (
    <button className="feature-card" type="button" onClick={onClick}>
      <span className="feature-card-icon">
        <ScanIcon />
      </span>
      <span className="feature-card-text">
        <span className="feature-card-title">Check a picture</span>
        <span className="feature-card-hint">Show me a screenshot or photo, and we'll look for scam clues together.</span>
        <span className="soon-pill">Coming soon</span>
      </span>
      <ChevronIcon className="feature-card-arrow" />
    </button>
  )
}

type MenuTileProps = {
  icon: ReactNode
  label: string
  hint: string
  onClick?: () => void
  // Not built yet: greyed out with "Coming soon"
  soon?: boolean
}

export function MenuTile({ icon, label, hint, onClick, soon = false }: MenuTileProps) {
  return (
    <button className="menu-tile" type="button" onClick={onClick} disabled={soon}>
      <span className="menu-tile-icon">{icon}</span>
      <span className="menu-tile-text">
        <span className="menu-tile-label">{label}</span>
        <span className="menu-tile-hint">{soon ? 'Coming soon' : hint}</span>
      </span>
      {!soon && <ChevronIcon className="menu-tile-arrow" />}
    </button>
  )
}
