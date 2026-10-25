import { isSetUp, SET_UP_BY_DEFAULT } from '../setup'
import { storedSwitch } from '../storedSwitch'
import { hasPersonalDetails, soundsUpset } from './askRules'

// Shield Buddy's answers to questions the player types (or says): the chat so far
// goes to our server (worker/src/ask.ts), where Claude writes a short answer about
// scams and staying safe online. Nothing is kept there or here. Only once a
// grown-up has finished setup and turned questions on (both remembered on the
// device; see setup.ts for the challenge build); otherwise, or with no server,
// Buddy's scripted replies are used (script.ts).

const SERVER: string | undefined = import.meta.env.VITE_LINK_SERVER
const KEY = 'scam-shield-questions'

export type AskEntry = { from: 'kid' | 'buddy'; text: string }
export type BuddyAnswer = {
  // What kind of question it was. 'safety' questions get the AI's own words, and
  // 'upset' ones may get one or two of its lines between scripted ones
  // (upsetAnswered in script.ts); the others get Buddy's scripted lines
  // (TOPIC_STEPS), and `lines` is empty
  topic: 'safety' | 'offTopic' | 'personal' | 'upset'
  lines: string[]
  mood: 'happy' | 'curious' | 'thinking' | 'worried'
  // A checker to offer after the answer
  offer: 'picture' | 'link' | 'message' | 'none'
}

// The most of the chat sent with each question, and the longest message (the
// server turns away more: worker/src/ask.ts)
const MAX_ENTRIES = 12
const MAX_TEXT = 500

// Off until a grown-up turns it on, except in the challenge build (setup.ts)
const questions = storedSwitch(KEY, SET_UP_BY_DEFAULT)
export const setQuestionsAllowed = questions.set
export const useQuestionsAllowed = questions.use

// Whether Buddy can answer questions: a server to ask, setup finished, and the
// questions switch on
export const canAsk = (setUp: boolean, questionsAllowed: boolean) => Boolean(SERVER) && setUp && questionsAllowed

// Asks the server for Buddy's answer to the last thing the player said; null if
// it can't answer in time
export async function askBuddy(entries: AskEntry[]): Promise<BuddyAnswer | null> {
  if (!SERVER || !isSetUp()) return null
  // Personal details and upsetting things the kid typed earlier are never sent
  const recent = entries
    .filter((e) => e.from === 'buddy' || !(hasPersonalDetails(e.text) || soundsUpset(e.text)))
    .slice(-MAX_ENTRIES)
    .map((e) => ({ from: e.from, text: e.text.slice(0, MAX_TEXT) }))
  try {
    const res = await fetch(`${SERVER}/ask`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entries: recent }),
      signal: AbortSignal.timeout(20000),
    })
    return res.ok ? ((await res.json()) as BuddyAnswer) : null
  } catch {
    return null
  }
}
