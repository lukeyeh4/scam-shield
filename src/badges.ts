import { useSyncExternalStore } from 'react'
import { scenarios } from './scenarios'

export type BadgeId = 'clue-finder' | 'good-call' | 'super-spotter' | 'scam-shield'

// `text` says what the player did; `how` says how to earn a badge they don't have yet
export const BADGES: { id: BadgeId; name: string; text: string; how: string; color: string }[] = [
  { id: 'clue-finder', name: 'Clue Finder', text: 'You found all the clues in a scam!', how: 'Find all the clues in a scam', color: '#e0a100' },
  { id: 'good-call', name: 'Good Call', text: 'You told an adult about a scam!', how: 'Tell an adult about a scam', color: '#2e9e5b' },
  { id: 'super-spotter', name: 'Super Spotter', text: 'You found all the clues in every scam!', how: 'Find all the clues in every scam', color: '#7c5cff' },
  { id: 'scam-shield', name: 'Scam Shield', text: 'You finished the game!', how: 'Finish the game', color: '#2f6fed' },
]

// What the player has done, kept on this device so badges stay after a reload
type Progress = {
  earned: BadgeId[]
  // Scenarios where every clue was found, and where the player told an adult
  spotted: string[]
  told: string[]
}

const KEY = 'scam-shield-badges'
const EMPTY: Progress = { earned: [], spotted: [], told: [] }

function load(): Progress {
  try {
    const saved = localStorage.getItem(KEY)
    return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY
  } catch {
    return EMPTY
  }
}

let progress = load()
// Badges just earned, waiting to be shown as a notification
let toasts: BadgeId[] = []
const listeners = new Set<() => void>()

function update(next: Progress, newToasts = toasts) {
  progress = next
  toasts = newToasts
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage blocked: badges just last until the page is closed
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Records what happened, then awards any badges it unlocks (plus `badge`, if given)
function record(change: Partial<Progress>, badge?: BadgeId) {
  const next = { ...progress, ...change }
  const unlocked = new Set<BadgeId>(next.earned)
  if (badge) unlocked.add(badge)
  if (next.spotted.length > 0) unlocked.add('clue-finder')
  if (next.told.length > 0) unlocked.add('good-call')
  if (scenarios.every((s) => next.spotted.includes(s.id))) unlocked.add('super-spotter')
  const added = [...unlocked].filter((id) => !next.earned.includes(id))
  update({ ...next, earned: [...next.earned, ...added] }, [...toasts, ...added])
}

const addOnce = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])

export const recordAllCluesFound = (scenarioId: string) => record({ spotted: addOnce(progress.spotted, scenarioId) })
export const recordToldAdult = (scenarioId: string) => record({ told: addOnce(progress.told, scenarioId) })
export const recordFinished = () => record({}, 'scam-shield')

// The notification shows the oldest waiting badge; call this once it has been shown
export const dismissToast = () => update(progress, toasts.slice(1))

// DEV CONSOLE: start over with no badges
export const resetBadges = () => update(EMPTY, [])

export const useEarnedBadges = () => useSyncExternalStore(subscribe, () => progress.earned)
export const useNextToast = () => useSyncExternalStore(subscribe, () => toasts[0])
