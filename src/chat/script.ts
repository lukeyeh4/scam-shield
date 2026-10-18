import type { CheckOutcome } from './session'
import type { Mood } from '../types'
import { checkLink } from '../tools/linkCheck'
import type { BuddyAnswer } from './askBuddy'
import { hasPersonalDetails, soundsUpset } from './askRules'

// Everything Shield Buddy says in the chat, and the answers the player can tap.
// All scripted, so the content rules in CLAUDE.md apply: simple words, not scary,
// no shame, and Buddy always sends kids to a real grown-up. The one exception is
// Buddy's answer to a typed question, which the AI writes (askBuddy.ts); the
// scripted line after it (the `answered` steps) still sends the kid to a grown-up.
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
  | 'answered'
  | 'answeredPicture'
  | 'answeredLink'
  | 'answeredMessage'
  | 'askFailed'
  | 'offTopic'
  | 'personal'
  | 'upset'
  | 'backScam'
  | 'backCareful'
  | 'backNotForKids'
  | 'backUrgent'
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
  // A small × beside the answers, for picking the wrong thing: says "Something
  // else" and goes to this step
  undo?: StepId
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

  // Each kind of thing has its own checker: one line, then one button to open it,
  // and a × to pick something else
  picture: {
    mood: 'curious',
    buddy: ['Send me a screenshot or a photo of it.'],
    options: [{ label: 'Check a picture', icon: 'picture', leave: 'picture' }],
    undo: 'again',
  },
  link: {
    mood: 'curious',
    buddy: ["Let's check where that link really goes."],
    options: [{ label: 'Check a link', icon: 'link', leave: 'link' }],
    undo: 'again',
  },
  message: {
    mood: 'curious',
    buddy: ["Let's look at that message for clues."],
    options: [{ label: 'Check a message', icon: 'message', leave: 'message' }],
    undo: 'again',
  },

  // Not sure what it is: ask a grown-up, or ask Buddy by typing or talking
  notSure: {
    mood: 'happy',
    buddy: ["That's OK! Not sure is a good time to stop.", 'Ask a grown-up, or ask me down here. You can type or talk to me.'],
    options: [{ label: 'Check something', next: 'again' }],
    pointAtBox: true,
  },

  // Buddy's replies to a typed question when it can't ask the AI (no grown-up's
  // OK, or no server), and for a link (see `replyTo`)
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

  // After the AI's answer to a typed question: a scripted line that always points
  // to a grown-up, and the checker the AI suggested, if any (see ANSWERED)
  answered: {
    mood: 'happy',
    buddy: ['A grown-up can help too.'],
    alternatives: [['If you are not sure, ask a grown-up.'], ['You can always show a grown-up.']],
    options: [{ label: 'Check something', next: 'again' }],
  },
  answeredPicture: {
    mood: 'curious',
    buddy: ['You can send me a picture of it. And show a grown-up.'],
    options: [
      { label: 'Check a picture', icon: 'picture', leave: 'picture' },
      { label: 'Something else', next: 'again' },
    ],
  },
  answeredLink: {
    mood: 'curious',
    buddy: ["Let's check that link. And show a grown-up."],
    options: [
      { label: 'Check a link', icon: 'link', leave: 'link' },
      { label: 'Something else', next: 'again' },
    ],
  },
  answeredMessage: {
    mood: 'curious',
    buddy: ["Let's look at that message. And show a grown-up."],
    options: [
      { label: 'Check a message', icon: 'message', leave: 'message' },
      { label: 'Something else', next: 'again' },
    ],
  },
  // The AI couldn't answer (offline, too slow, or it wouldn't)
  askFailed: {
    mood: 'thinking',
    buddy: ["Sorry, I can't answer that right now.", 'Show it to a grown-up. They can help.'],
    options: [{ label: 'Check something', next: 'again' }],
  },

  // Questions the AI doesn't answer itself: always these scripted lines
  // (TOPIC_STEPS, and `replyTo` before anything is sent)
  offTopic: {
    mood: 'happy',
    buddy: ['I can only help with scams and staying safe online.', 'For other questions, ask a grown-up.'],
    options: [{ label: 'Check something', next: 'again' }],
  },
  personal: {
    mood: 'thinking',
    buddy: [
      'Please keep things like your name, address, school and passwords private.',
      "Don't share them here or anywhere online. A grown-up can help you keep them safe.",
    ],
    options: [{ label: 'Check something', next: 'again' }],
  },
  upset: {
    mood: 'neutral',
    buddy: ['Thank you for telling me. You are not in trouble.', 'Please tell a grown-up you trust right now, like a parent or teacher. They can help.'],
    options: [{ label: 'Check something', next: 'again' }],
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
  // Someone is threatening the child or asking for photos: calm, no blame, and a
  // grown-up right now
  backUrgent: {
    mood: 'neutral',
    buddy: [
      "Good thinking to check that. It's not your fault, and you're not in trouble.",
      'Please show a grown-up you trust right now, like a parent or teacher.',
      'Want to check something else?',
    ],
    alternatives: [
      ["Thank you for checking. You haven't done anything wrong.", 'Show it to a grown-up you trust right now.', 'Anything else to check?'],
      ["You did the right thing by checking. It's not your fault.", 'Please tell a grown-up you trust right now.', 'What else should we check?'],
    ],
    options: CHECKS,
  },
  backNotForKids: {
    mood: 'worried',
    buddy: ["Good thinking to check that! That website isn't for kids.", "Don't open it. Show a grown-up.", 'Want to check something else?'],
    alternatives: [
      ["That website is made for grown-ups, not kids.", 'Leave it closed and tell a grown-up.', 'Anything else to check?'],
      ["That one isn't a place for kids.", "Don't open it. Show it to a grown-up.", 'What else should we check?'],
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
export const BACK_AFTER: Record<CheckOutcome, StepId> = {
  high: 'backScam',
  notForKids: 'backNotForKids',
  urgent: 'backUrgent',
  medium: 'backCareful',
  none: 'backClean',
}

// Steps reached by typing instead of tapping an answer
export const TYPED_STEPS: StepId[] = [
  'typed',
  'typedLink',
  'answered',
  'answeredPicture',
  'answeredLink',
  'answeredMessage',
  'askFailed',
  'offTopic',
  'personal',
  'upset',
]

// The step after the AI's answer, by the checker it suggested
export const ANSWERED: Record<BuddyAnswer['offer'], StepId> = {
  none: 'answered',
  picture: 'answeredPicture',
  link: 'answeredLink',
  message: 'answeredMessage',
}

// The step for each kind of question the AI doesn't answer itself (it only says
// which kind it is; askRules.ts and worker/src/ask.ts)
export const TOPIC_STEPS: Record<Exclude<BuddyAnswer['topic'], 'safety'>, StepId> = {
  offTopic: 'offTopic',
  personal: 'personal',
  upset: 'upset',
}

// The link in a typed question, if there is one (without punctuation around it):
// "is roblox-giveaway-official.net real?" → "roblox-giveaway-official.net". Any
// real website ending counts (.site, .gift, ...), as the link checker sees it.
export const findLink = (text: string) =>
  text
    .split(/\s+/)
    .map((word) => word.replace(/^[([{<"'“‘«]+/, '').replace(/[)\]}>"'”’».,!?;:]+$/, ''))
    .find((word) => /^https?:\/\//i.test(word) || (/[a-z]\.[a-z]/i.test(word) && checkLink(word) !== null))

// The scripted reply to a typed question, before any AI: a link gets the link
// checker; personal details or something upsetting get Buddy's own words (and are
// never sent); anything else gets `typed`, or the AI's answer when it's allowed
export function replyTo(text: string): StepId {
  if (soundsUpset(text)) return 'upset'
  if (hasPersonalDetails(text)) return 'personal'
  if (findLink(text)) return 'typedLink'
  return 'typed'
}
