import type { Mood } from '../types'

// Everything Shield Buddy says in the chat, and the answers the player can tap.
// All scripted (no AI yet), so the content rules in CLAUDE.md apply: simple words,
// not scary, no shame, and Buddy always sends kids to a real grown-up.

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
  | 'tell'
  | 'done'

export type ChatIcon = 'picture' | 'link' | 'message' | 'question' | 'grownUp'

export type ChatOption = {
  label: string
  icon?: ChatIcon
  // The chat step this answer leads to
  next?: StepId
  // Or leave the chat: open a tool, Tell a grown-up, or go back to the menu
  leave?: 'picture' | 'link' | 'message' | 'tell' | 'home'
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
  { label: 'Tell a grown-up', icon: 'grownUp', next: 'tell' },
]

const yesNo = (next: StepId): ChatOption[] => [
  { label: 'Yes', next, clue: true },
  { label: 'No', next },
]

export const STEPS: Record<StepId, ChatStep> = {
  start: {
    mood: 'happy',
    buddy: [
      "Hi! I'm Shield Buddy.",
      'Did you get something that feels a bit weird? We can check it together.',
      'What do you want to check?',
    ],
    options: CHECKS,
  },
  again: {
    mood: 'happy',
    buddy: ['What else do you want to check?'],
    options: CHECKS,
  },

  picture: {
    mood: 'curious',
    buddy: ["Send me a screenshot or a photo, and I'll look for scam clues.", 'I will show you where they are.'],
    options: [
      { label: 'Check a picture', icon: 'picture', leave: 'picture' },
      { label: 'Check something else', next: 'again' },
      { label: "I'm done", next: 'done' },
    ],
  },

  link: {
    mood: 'thinking',
    buddy: [
      "Let's check where that link really goes.",
      'Scammers use names that look almost real, like rob1ox.com instead of roblox.com.',
      'And never type your password on a website you got from a link.',
    ],
    options: [
      { label: 'Check a link', icon: 'link', leave: 'link' },
      { label: 'Ask me questions about it', icon: 'question', next: 'question1' },
      { label: 'Tell a grown-up', icon: 'grownUp', next: 'tell' },
      { label: 'Check something else', next: 'again' },
    ],
  },

  message: {
    mood: 'thinking',
    buddy: ["Let's check that message.", 'Paste it in, or I can ask you some questions about it.'],
    options: [
      { label: 'Check a message', icon: 'message', leave: 'message' },
      { label: 'Ask me questions about it', icon: 'question', next: 'question1' },
      { label: 'Tell a grown-up', icon: 'grownUp', next: 'tell' },
    ],
  },

  // "Is this real?" questions: a yes to any of them is a scam clue
  question1: {
    mood: 'curious',
    resetClues: true,
    buddy: [
      "Let's check it together. I have 4 quick questions.",
      'Is someone rushing you? Like "Hurry!" or "Only 5 minutes left!"',
    ],
    options: yesNo('question2'),
  },
  question2: {
    mood: 'curious',
    buddy: ['Do they want a code, a password, or money?'],
    options: yesNo('question3'),
  },
  question3: {
    mood: 'curious',
    buddy: ['Does it promise you something free, like a prize or free Robux?'],
    options: yesNo('question4'),
  },
  question4: {
    mood: 'curious',
    buddy: ["Is it from someone you don't know, or a new number?"],
    options: yesNo('answer'),
  },
  answer: {
    mood: 'neutral',
    buddy: [
      "I didn't spot any scam clues.",
      'But if it still feels weird, show a grown-up before you do anything.',
    ],
    ifClues: {
      mood: 'worried',
      buddy: [
        'You found {clues}. That means it could be a scam.',
        "Don't answer it, tap on it, or send anything.",
        'Show a grown-up. They can help you check.',
      ],
    },
    options: [
      { label: 'Tell a grown-up', icon: 'grownUp', next: 'tell' },
      { label: 'Check something else', next: 'again' },
    ],
  },

  tell: {
    mood: 'cheering',
    buddy: [
      'Telling a grown-up is always a great choice!',
      'Show them what you got. You can say: "I got this, and I\'m not sure if it\'s real."',
      'You could tell a parent, a teacher, or another grown-up you trust.',
    ],
    options: [
      { label: 'Send it to a grown-up', icon: 'grownUp', leave: 'tell' },
      { label: 'Check something else', next: 'again' },
      { label: "I'm done", next: 'done' },
    ],
  },

  done: {
    mood: 'cheering',
    buddy: ['Great job checking!', 'Remember: stop, check, and tell a grown-up.'],
    options: [
      { label: 'Back to the menu', leave: 'home' },
      { label: 'Check something else', next: 'again' },
    ],
  },
}
