import type { Risk } from '../tools/examples'
import type { Mood } from '../types'
import type { StepId } from './script'

// The chat so far, kept while the app is open, so leaving the chat to check
// something and coming back carries on the same conversation instead of starting
// again. It's only kept in memory: nothing is saved, and it's gone when the page is
// closed or reloaded (kids may type private things).

export type Entry = { from: 'buddy'; text: string; mood: Mood } | { from: 'kid'; text: string }

// `backTurns`: how many times Buddy has talked about a check, so it can say it differently each time
export type Chat = { step: StepId; entries: Entry[]; typedLink?: string; backTurns: number }

let saved: Chat | null = null
// What a check found: its risk, a website that isn't for kids (red, not a scam),
// or someone threatening the child or asking for photos (urgent)
export type CheckOutcome = Risk | 'notForKids' | 'urgent'

// What the last check found, if there was one since the chat was left
let lastCheck: CheckOutcome | null = null

export const savedChat = () => saved
export const saveChat = (chat: Chat) => {
  saved = chat
}

// Called when a check's result shows, so Buddy can talk about it back in the chat
export const noteCheck = (outcome: CheckOutcome) => {
  lastCheck = outcome
}
export const checkSinceChat = () => lastCheck
export const forgetCheck = () => {
  lastCheck = null
}

// "Ask Buddy about this" on a check's result: the names of the clues it found, so
// the chat can say what was found and ask what the kid wants to know (once)
let askingAbout: string[] | null = null
export const askAbout = (clues: string[]) => {
  askingAbout = clues
}
export const takeAskAbout = () => {
  const clues = askingAbout
  askingAbout = null
  return clues
}
