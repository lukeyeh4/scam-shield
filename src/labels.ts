import type { Choice, Result } from './types'

export const CHOICES: { id: Choice; label: string }[] = [
  { id: 'do', label: 'Do it' },
  { id: 'check', label: 'Check with Scam Shield' },
  { id: 'tell', label: 'Tell an adult' },
]

// Finishes "What if you had…" when a scenario doesn't give its own words
export const WHAT_IF: Record<Choice, string> = {
  do: 'done it',
  check: 'checked it with Scam Shield',
  tell: 'told an adult',
}

export const RESULTS: Record<Result, { label: string }> = {
  red: { label: 'Uh oh' },
  green: { label: 'Scam stopped!' },
}
