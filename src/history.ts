import { useSyncExternalStore } from 'react'
import { storedSwitch } from './storedSwitch'
import type { CheckResult } from './tools/examples'

// A history of the child's checks, for the grown-ups' settings: when, which
// checker, what the result was and the clues' names (and a link's website). Never
// the pictures or messages themselves. Kept only on this device, the newest 50, and
// only while the grown-up leaves "Keep a history of checks" on.

export type Checker = 'picture' | 'message' | 'link'
export type Outcome = 'urgent' | 'scam' | 'notForKids' | 'careful' | 'couldNotCheck' | 'clean'
export type HistoryEntry = { at: string; checker: Checker; outcome: Outcome; clues: string[]; site?: string }

const KEY = 'scam-shield-history'
const MOST = 50

const keep = storedSwitch('scam-shield-keep-history', true)
export const setKeepHistory = keep.set
export const useKeepHistory = keep.use

// What a result was, in one word for the history
export function outcomeOf(result: CheckResult): Outcome {
  if (result.urgent) return 'urgent'
  if (result.notForKids) return 'notForKids'
  if (result.risk === 'high') return 'scam'
  if (result.clues.some((c) => c.label === "Couldn't check it" || c.label === 'Hard to read')) return 'couldNotCheck'
  return result.risk === 'medium' ? 'careful' : 'clean'
}

let entries: HistoryEntry[] = read()
const listeners = new Set<() => void>()

function read(): HistoryEntry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function save(next: HistoryEntry[]) {
  entries = next
  try {
    if (next.length) localStorage.setItem(KEY, JSON.stringify(next))
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the history lasts until the page is reloaded
  }
  listeners.forEach((listener) => listener())
}

// Adds a check to the history (if the grown-up keeps one). The same result is
// only added once, however often its screen shows.
const added = new WeakSet<CheckResult>()
export function recordCheck(checker: Checker, result: CheckResult, site?: string, now = new Date()) {
  if (!keep.get() || added.has(result)) return
  added.add(result)
  const entry: HistoryEntry = {
    at: now.toISOString(),
    checker,
    outcome: outcomeOf(result),
    clues: result.clues.map((c) => c.label),
    ...(site ? { site } : {}),
  }
  save([entry, ...entries].slice(0, MOST))
}

export const clearHistory = () => save([])

export function useHistory() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, () => entries)
}
