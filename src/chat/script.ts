import type { Risk } from '../tools/examples'
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
  | 'notSure'
  | 'typed'
  | 'typedLink'
  | 'backScam'
  | 'backCareful'
  | 'backClean'

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
  // Other ways Buddy can say it, taken in turn so it doesn't repeat itself
  alternatives?: string[][]
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

  // Buddy's replies to a typed question. Placeholders until the AI answers
  // questions (stage 3 in PROJECT.md): something that looks like a link gets the
  // link checker, anything else gets sent to a grown-up.
  typed: {
    mood: 'thinking',
    buddy: ["Thanks for asking! I can't answer questions yet.", 'For now, show it to a grown-up. They can help.'],
    options: [{ label: 'Check something', next: 'again' }],
  },
  typedLink: {
    mood: 'curious',
    buddy: ["That looks like a link. Let's check where it goes."],
    options: [{ label: 'Check a link', icon: 'link', leave: 'link' }],
  },

  // Back in the chat after a check: Buddy carries on from what the check found
  // (see BACK_AFTER), then offers another check. Each time it says it a different
  // way (`alternatives`, in turn), and only praises checking the first time.
  backScam: {
    mood: 'worried',
    buddy: ['Good thinking to check that! It looked like a scam.', "Don't tap it or answer it. Show a grown-up.", 'Want to check something else?'],
    alternatives: [
      ['That one looked like a scam.', 'Leave it alone and tell a grown-up.', 'Anything else to check?'],
      ['Uh oh, that looked like a trick.', "Don't tap it. Show it to a grown-up.", 'What else should we check?'],
    ],
    options: CHECKS,
  },
  backCareful: {
    mood: 'thinking',
    buddy: ['Good thinking to check that! Some things looked odd.', 'Ask a grown-up before you tap it.', 'Want to check something else?'],
    alternatives: [
      ['Hmm, some things about that looked odd.', 'Check with a grown-up before you tap it.', 'Anything else to check?'],
      ['I found a few things to be careful about.', 'Ask a grown-up first.', 'What else should we check?'],
    ],
    options: CHECKS,
  },
  backClean: {
    mood: 'happy',
    buddy: ["Good thinking to check! I didn't find any clues.", 'Still not sure? Show a grown-up.', 'Want to check something else?'],
    alternatives: [
      ["I didn't spot any clues that time.", 'If it still feels weird, ask a grown-up.', 'Anything else to check?'],
      ['No clues that time!', "Not sure? A grown-up can help.", 'What else should we check?'],
    ],
    options: CHECKS,
  },
}

// What Buddy says at a step, the `turn`th time it comes back to it
export function buddySays(id: StepId, turn = 0): string[] {
  const { buddy, alternatives = [] } = STEPS[id]
  const all = [buddy, ...alternatives]
  return all[turn % all.length]
}

// What Buddy says on coming back to the chat after a check, by what it found
export const BACK_AFTER: Record<Risk, StepId> = { high: 'backScam', medium: 'backCareful', none: 'backClean' }

// Steps reached by typing instead of tapping an answer
export const TYPED_STEPS: StepId[] = ['typed', 'typedLink']

const LINKISH = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|gg|ly|co|xyz|info)\b/i

// The link in a typed question, if there is one (without punctuation around it):
// "is roblox-giveaway-official.net real?" → "roblox-giveaway-official.net"
export const findLink = (text: string) =>
  text
    .split(/\s+/)
    .find((word) => LINKISH.test(word))
    ?.replace(/^[([{<"']+/, '')
    .replace(/[)\]}>"'.,!?;:]+$/, '')

// Which reply a typed question gets (see `typed` and `typedLink`)
export const replyTo = (text: string): StepId => (findLink(text) ? 'typedLink' : 'typed')
