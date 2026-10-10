import type { Mood } from '../types'

// Everything Shield Buddy says in the chat, and the answers the player can tap.
// All scripted (no AI yet), so the content rules in CLAUDE.md apply: simple words,
// not scary, no shame, and Buddy always sends kids to a real grown-up.
// Keep it short: a line or two from Buddy, and as few answers as possible.

export type StepId =
  | 'start'
  | 'again'
  | 'picture'
  | 'link'
  | 'message'
  | 'question1'
  | 'question2'
  | 'question3'
  | 'question4'
  | 'answer'
  | 'done'

export type ChatIcon = 'picture' | 'link' | 'message' | 'question'

export type ChatOption = {
  label: string
  icon?: ChatIcon
  // The chat step this answer leads to
  next?: StepId
  // Or leave the chat: open a tool, or go back to the menu
  leave?: 'picture' | 'link' | 'message' | 'home'
  // A "yes" in the questions: counts as a scam clue
  clue?: boolean
}

export type ChatStep = {
  mood: Mood
  buddy: string[]
  options: ChatOption[]
  // Starts the scam-clue count again (the first of the questions)
  resetClues?: boolean
  // Said instead of `buddy` if the player found any clues. "{clues}" becomes
  // e.g. "2 scam clues".
  ifClues?: { mood: Mood; buddy: string[] }
}

// The things to check, offered at the start and after each check
const CHECKS: ChatOption[] = [
  { label: 'A picture', icon: 'picture', next: 'picture' },
  { label: 'A link', icon: 'link', next: 'link' },
  { label: 'A message', icon: 'message', next: 'message' },
  { label: "I'm not sure", icon: 'question', next: 'question1' },
]

const yesNo = (next: StepId): ChatOption[] => [
  { label: 'Yes', next, clue: true },
  { label: 'No', next },
]

export const STEPS: Record<StepId, ChatStep> = {
  start: {
    mood: 'happy',
    buddy: ["Hi! I'm Shield Buddy.", 'What do you want to check?'],
    options: CHECKS,
  },
  again: {
    mood: 'happy',
    buddy: ['What else do you want to check?'],
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

  // "Is this real?" questions: a yes to any of them is a scam clue
  question1: {
    mood: 'curious',
    resetClues: true,
    buddy: ["Let's find out. I have 4 quick questions.", 'Is someone rushing you?'],
    options: yesNo('question2'),
  },
  question2: {
    mood: 'curious',
    buddy: ['Do they want a code, a password, or money?'],
    options: yesNo('question3'),
  },
  question3: {
    mood: 'curious',
    buddy: ['Does it promise you something free?'],
    options: yesNo('question4'),
  },
  question4: {
    mood: 'curious',
    buddy: ["Is it from someone you don't know?"],
    options: yesNo('answer'),
  },
  answer: {
    mood: 'neutral',
    buddy: ["I didn't spot any scam clues. Still not sure? Show a grown-up."],
    ifClues: {
      mood: 'worried',
      buddy: ['You found {clues}. It could be a scam.', "Don't answer it or tap on it. Show a grown-up."],
    },
    options: [
      { label: 'Check something else', next: 'again' },
      { label: "I'm done", next: 'done' },
    ],
  },

  done: {
    mood: 'cheering',
    buddy: ['Great job checking! Remember: stop, check, and tell a grown-up.'],
    options: [{ label: 'Back to the menu', leave: 'home' }],
  },
}
