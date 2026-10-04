import { useEffect } from 'react'
import { BADGES, type BadgeId, dismissToast, useEarnedBadges, useNextToast } from '../badges'
import './badges.css'

// How long a "New badge!" notification stays on screen
const TOAST_MS = 3500

// A badge: a coloured shield with a white symbol, or grey until it's earned
export function BadgeIcon({ id, earned, size = 56 }: { id: BadgeId; earned: boolean; size?: number }) {
  const badge = BADGES.find((b) => b.id === id)!
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path
        d="M32 4 54 12v18c0 14-10 24-22 30C20 54 10 44 10 30V12Z"
        fill={earned ? badge.color : '#d5d9e0'}
        stroke="#fff"
        strokeWidth="3"
      />
      <g fill="none" stroke={earned ? '#fff' : '#f4f5f7'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {id === 'clue-finder' && (
          <>
            <circle cx="29" cy="28" r="8" />
            <path d="m35 34 7 7" />
          </>
        )}
        {id === 'good-call' && (
          <path d="M22 20h20a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H32l-7 6v-6h-3a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4Z" />
        )}
        {id === 'super-spotter' && <path d="m32 17 4.4 9 9.6 1.3-7 6.7 1.7 9.5L32 39l-8.7 4.5L25 34l-7-6.7 9.6-1.3Z" />}
        {id === 'scam-shield' && <path d="m22 31 7 7 13-14" />}
      </g>
    </svg>
  )
}

// "New badge!" notifications, one at a time, as badges are earned
export function BadgeToast() {
  const id = useNextToast()

  useEffect(() => {
    if (!id) return
    const timer = setTimeout(dismissToast, TOAST_MS)
    return () => clearTimeout(timer)
  }, [id])

  if (!id) return null
  const badge = BADGES.find((b) => b.id === id)!
  return (
    <div className="badge-toast" role="status" key={id}>
      <BadgeIcon id={id} earned size={52} />
      <div>
        <span className="badge-toast-label">New badge!</span>
        <strong className="badge-toast-name">{badge.name}</strong>
        <span className="badge-toast-text">{badge.text}</span>
      </div>
    </div>
  )
}

// Every badge, earned or not yet (on the end screen)
export function BadgeList() {
  const earned = useEarnedBadges()
  return (
    <ul className="badge-list">
      {BADGES.map((b) => {
        const has = earned.includes(b.id)
        return (
          <li key={b.id} className={has ? 'badge-card' : 'badge-card is-locked'}>
            <BadgeIcon id={b.id} earned={has} />
            <strong>{b.name}</strong>
            <span>{has ? b.text : b.how}</span>
          </li>
        )
      })}
    </ul>
  )
}
