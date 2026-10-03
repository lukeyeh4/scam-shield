import type { Choice, Result } from './types'

export const CHOICES: { id: Choice; emoji: string; label: string }[] = [
  { id: 'do', emoji: '👆', label: 'Do it' },
  { id: 'ignore', emoji: '🙈', label: 'Ignore it' },
  { id: 'tell', emoji: '🗣️', label: 'Tell an adult' },
]

export const RESULTS: Record<Result, { emoji: string; label: string }> = {
  red: { emoji: '🔴', label: 'Uh oh' },
  yellow: { emoji: '🟡', label: 'Safe… for now' },
  green: { emoji: '🟢', label: 'Scam stopped!' },
}
