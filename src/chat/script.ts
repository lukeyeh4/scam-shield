import type { Mood } from '../types'

// Everything Shield Buddy says in the chat, and the answers the player can tap.
// All scripted (no AI yet), so the content rules in CLAUDE.md apply: simple words,
// not scary, no shame, and Buddy always sends kids to a real grown-up.
// Keep it short: a line or two from Buddy, and as few answers as possible.

export type StepId = 'start' | 'again' | 'picture' | 'link' | 'message' | 'notSure'

export type ChatIcon = 'picture' | 'link' | 'message' | 'question'

export type ChatOption = {
  label: string
  icon?: ChatIcon
  // The chat step this answer leads to
  next?: StepId
  // Or leave the chat to open a tool
  leave?: 'picture' | 'link' | 'message'
}

export type ChatStep = {
  mood: Mood
  buddy: string[]
  options: ChatOption[]
  // Points at the box for typing or talking to Buddy, below the chat
  pointAtBox?: boolean
}

// The things to check, offered at the start and after "I'm not sure"
const CHECKS: ChatOption[] = [
  { label: 'A picture', icon: 'picture', next: 'picture' },
  { label: 'A link', icon: 'link', next: 'link' },
  { label: 'A message', icon: 'message', next: 'message' },
  { label: "I'm not sure", icon: 'question', next: 'notSure' },
]

export const STEPS: Record<StepId, ChatStep> = {
  start: {
    mood: 'happy',
    buddy: ["Hi! I'm Shield Buddy.", 'What do you want to check?'],
    options: CHECKS,
  },
  again: {
    mood: 'happy',
    buddy: ['What do you want to check?'],
    options: CHECKS,
  },

  // Each kind of thing has its own checker: one line, then one button to open it
  picture: {
    mood: 'curious',
    buddy: ['Send me a screenshot or a photo of it.'],
    options: [{ label: 'Check a picture', icon: 'picture', leave: 'picture' }],
  },
  link: {
    mood: 'curious',
    buddy: ["Let's check where that link really goes."],
    options: [{ label: 'Check a link', icon: 'link', leave: 'link' }],
  },
  message: {
    mood: 'curious',
    buddy: ["Let's look at that message for clues."],
    options: [{ label: 'Check a message', icon: 'message', leave: 'message' }],
  },

  // Not sure what it is: ask a grown-up, or ask Buddy by typing or talking
  notSure: {
    mood: 'happy',
    buddy: ["That's OK! Not sure is a good time to stop.", 'Ask a grown-up, or ask me down here. You can type or talk to me.'],
    options: [{ label: 'Check something', next: 'again' }],
    pointAtBox: true,
  },
}
