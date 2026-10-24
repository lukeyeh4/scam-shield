import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { setQuestionsAllowed, useQuestionsAllowed } from '../chat/askBuddy'
import { clearHistory, type HistoryEntry, type Outcome, setKeepHistory, useHistory, useKeepHistory } from '../history'
import { LockIcon } from '../icons'
import { checkPin, hasPin, isPin, makeQuestion, noteTry, PIN_LENGTH, removePin, secondsLocked, setPin } from '../parentGate'
import { setSetUp, useSetUp } from '../setup'
import { ToolScreen } from '../tools/ToolScreen'
import { setSayWebsiteKind, useSayWebsiteKind } from '../tools/websiteKind'
import { canTalk, setTalkingAllowed, useTalkingAllowed } from '../voiceInput'

// The grown-ups' area. The parent gate first (parentGate.ts): the grown-up PIN if
// one is set, otherwise a sum to type. Then the settings, in short cards with the
// details behind "More": whether the child can use the checks (nothing is sent
// anywhere until then: setup.ts), Shield Buddy's questions and listening, what
// results say about grown-up websites, the history of checks (history.ts), the
// PIN, and a family code word (advice only: it's never saved). Everything is saved
// on this device.
// Written for adults, so the kids' reading-level rules don't apply here.

export function GrownUpsScreen({ onBack }: { onBack: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <ToolScreen title="For grown-ups" onBack={onBack} note={null}>
      {unlocked ? <Settings onDone={onBack} /> : <Gate onOpen={() => setUnlocked(true)} />}
    </ToolScreen>
  )
}

// How long a wrong PIN's shake lasts (the animation in tools.css)
const SHAKE_MS = 450

// The parent gate: the PIN, or (no PIN yet, or it's forgotten) a sum to type
function Gate({ onOpen }: { onOpen: () => void }) {
  const [usePin, setUsePin] = useState(hasPin)
  // Came from "Forgot the PIN?": the sum then removes the PIN and turns everything
  // off, so it can't be used to get around the PIN
  const [forgot, setForgot] = useState(false)
  const [question, setQuestion] = useState(makeQuestion)
  const [typed, setTyped] = useState('')
  const [wrong, setWrong] = useState(false)
  // Seconds left to wait after too many wrong tries (counting down)
  const [wait, setWait] = useState(secondsLocked)
  useEffect(() => {
    if (!wait) return
    const timer = setTimeout(() => setWait(secondsLocked()), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  const answer = async (right: boolean) => {
    noteTry(right)
    if (right && forgot) {
      removePin()
      setSetUp(false)
      setQuestionsAllowed(false)
      setTalkingAllowed(false)
    }
    if (right) return onOpen()
    setWrong(true)
    setTyped('')
    setQuestion(makeQuestion())
    setWait(secondsLocked())
  }

  const submitSum = (e: FormEvent) => {
    e.preventDefault()
    if (typed.trim()) void answer(Number(typed) === question.answer)
  }

  // A wrong PIN: the dots shake (and the phone buzzes, if it can), like a phone's
  // lock screen, then clear
  const [shaking, setShaking] = useState(false)

  // The PIN is checked as soon as all its digits are in
  const pressDigit = async (digit: string) => {
    if (shaking) return
    const next = (typed + digit).slice(0, PIN_LENGTH)
    setTyped(next)
    setWrong(false)
    if (next.length < PIN_LENGTH) return
    if (await checkPin(next)) return void answer(true)
    setShaking(true)
    navigator.vibrate?.(200)
    setTimeout(() => {
      setShaking(false)
      void answer(false)
    }, SHAKE_MS)
  }

  return (
    <div className="tool-column gate">
      <span className="gate-icon">
        <LockIcon />
      </span>
      <h2 className="tool-heading">Grown-ups only</h2>
      {wait > 0 ? (
        <p className="gate-wrong" role="alert">
          Too many tries. Wait {wait} seconds.
        </p>
      ) : usePin ? (
        <>
          <p className="tool-text">Enter your grown-up PIN.</p>
          <div className={shaking ? 'pin-dots is-shaking' : 'pin-dots'} aria-label={`${typed.length} of ${PIN_LENGTH} digits entered`}>
            {Array.from({ length: PIN_LENGTH }, (_, i) => (
              <span key={i} className={i < typed.length ? 'pin-dot is-filled' : 'pin-dot'} />
            ))}
          </div>
          <div className="pin-pad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button key={d} className="tool-button" type="button" onClick={() => void pressDigit(d)}>
                {d}
              </button>
            ))}
            <button className="tool-button pin-delete" type="button" onClick={() => setTyped(typed.slice(0, -1))} aria-label="Delete">
              ⌫
            </button>
            <button className="tool-button" type="button" onClick={() => void pressDigit('0')}>
              0
            </button>
          </div>
          <button
            className="tool-button"
            type="button"
            onClick={() => {
              setUsePin(false)
              setForgot(true)
              setTyped('')
              setWrong(false)
            }}
          >
            Forgot the PIN?
          </button>
        </>
      ) : (
        <form className="gate-sum" onSubmit={submitSum}>
          {forgot && <p className="tool-text">This removes your PIN and turns off the checks. You can turn them back on afterwards.</p>}
          <label className="gate-question" htmlFor="gate-answer">
            {question.text}
          </label>
          <input
            id="gate-answer"
            className="settings-input gate-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))}
          />
          <button className="tool-button tool-button-main" type="submit" disabled={!typed}>
            Continue
          </button>
        </form>
      )}
      {wrong && wait === 0 && (
        <p className="gate-wrong" role="alert">
          That's not right. Kids: ask a grown-up to help.
        </p>
      )}
    </div>
  )
}

function Settings({ onDone }: { onDone: () => void }) {
  const agreed = useSetUp()
  const questions = useQuestionsAllowed()
  const voice = useTalkingAllowed()
  const sayKind = useSayWebsiteKind()

  return (
    <div className="settings">
      <Section title="Checks">
        <Toggle on={agreed} onChange={setSetUp} label="Turn on picture, message and link checks">
          {agreed
            ? 'Your child can check pictures, messages and links. They are sent to our server and checked by AI. We do not keep them.'
            : 'Nothing is sent anywhere. Links get a basic check on this device only. Picture and message checks are locked.'}
        </Toggle>
        <More summary="What is sent, and where">
          <ul className="settings-list">
            <li>
              <strong>Pictures</strong> are checked by AI. We use Claude, made by Anthropic.
            </li>
            <li>
              <strong>Messages</strong> are checked the same way. Phone numbers, emails, codes and addresses are removed
              first. Names may still be sent.
            </li>
            <li>
              <strong>Links</strong> are checked against Google Safe Browsing and other safety lists. AI may also read the
              website.
            </li>
            <li>
              <strong>Questions and speech</strong> are only sent if you turn them on below.
            </li>
            <li>
              <strong>Read aloud</strong> uses Google to speak Shield Buddy's own lines. It never sends anything your child
              types.
            </li>
          </ul>
          <p>Anthropic deletes everything within 30 days. It does not use it to train AI.</p>
          <p>Each home can check up to 40 pictures and 100 messages a day.</p>
          <p>AI can make mistakes. That is why Scam Shield always tells your child to show a grown-up.</p>
          <p>
            Read the privacy policies of{' '}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
              Anthropic
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Google
            </a>
            .
          </p>
        </More>
      </Section>

      <Section title="Shield Buddy">
        <Toggle on={questions && agreed} disabled={!agreed} onChange={setQuestionsAllowed} label="Answer my child's questions">
          Your child can type questions about scams and staying safe online. AI answers them and always suggests asking a
          grown-up. When this is off, Shield Buddy asks your child to show you instead.
        </Toggle>
        {canTalk ? (
          <Toggle on={voice && agreed} disabled={!agreed} onChange={setTalkingAllowed} label="Let my child ask out loud">
            Your child can speak a question instead of typing it. Your browser turns the words into text. No recordings
            are kept.
          </Toggle>
        ) : (
          <p className="settings-off">Asking out loud works in Chrome and Safari.</p>
        )}
        {!agreed && <p className="settings-off">Turn on the checks above to use these.</p>}
      </Section>

      <Section title="Results">
        <Toggle on={sayKind} onChange={setSayWebsiteKind} label="Name the type of unsafe website">
          Some links go to betting, adult or pirated streaming websites. By default Scam Shield only says the website is
          not for kids. Turn this on to also name the type. It is off so children do not get curious. Scam warnings
          always explain the trick.
        </Toggle>
      </Section>

      <HistorySection />

      <PinSection />

      <Section title="Family code word">
        <p>
          Choose a secret word with your child. If someone claims to be you, your child can ask for the word. Keep it
          private. Do not write it in messages or in this app.
        </p>
      </Section>

      <div className="tool-actions">
        <button className="tool-button tool-button-main" type="button" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  )
}

// How each result reads in the history, and its colour
const OUTCOMES: Record<Outcome, { text: string; tone: 'high' | 'medium' | 'none' }> = {
  urgent: { text: 'Needs a grown-up now', tone: 'high' },
  scam: { text: 'Looked like a scam', tone: 'high' },
  notForKids: { text: 'Website not for kids', tone: 'high' },
  careful: { text: 'Be careful', tone: 'medium' },
  couldNotCheck: { text: "Couldn't be checked", tone: 'medium' },
  clean: { text: 'No clues found', tone: 'none' },
}
const CHECKERS = { picture: 'Picture', message: 'Message', link: 'Link' }

// "Today, 3:42 pm", "Yesterday, 9:05 am" or "12 Oct, 3:42 pm"
function when(at: string, now = new Date()) {
  const date = new Date(at)
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const days = Math.round((new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / 86_400_000)
  const day = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return `${day}, ${time}`
}

// The child's recent checks (history.ts): never the pictures or messages themselves
function HistorySection() {
  const keep = useKeepHistory()
  const entries = useHistory()
  const [all, setAll] = useState(false)
  const shown = all ? entries : entries.slice(0, 5)
  return (
    <Section title="History">
      <Toggle on={keep} onChange={setKeepHistory} label="Keep a history of checks">
        See what your child checked and what Scam Shield found. It is saved only on this device. It never includes the
        pictures or messages.
      </Toggle>
      {entries.length === 0 ? (
        <p>{keep ? 'No checks yet.' : 'The history is off.'}</p>
      ) : (
        <>
          <ul className="history">
            {shown.map((entry: HistoryEntry) => {
              const outcome = OUTCOMES[entry.outcome]
              return (
                <li key={entry.at} className={entry.outcome === 'urgent' ? 'history-item is-urgent' : 'history-item'}>
                  <span className={`history-dot risk-${outcome.tone}`} aria-hidden="true" />
                  <span className="history-text">
                    <strong>{outcome.text}</strong>
                    <span>
                      {CHECKERS[entry.checker]}
                      {entry.site ? ` · ${entry.site}` : ''} · {when(entry.at)}
                    </span>
                    {entry.clues.length > 0 && <span className="history-clues">{entry.clues.join(' · ')}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="settings-buttons">
            {entries.length > 5 && (
              <button className="tool-button" type="button" onClick={() => setAll(!all)}>
                {all ? 'Show fewer' : `Show all ${entries.length}`}
              </button>
            )}
            <button
              className="tool-button"
              type="button"
              onClick={() => window.confirm('Clear the history of checks on this device?') && clearHistory()}
            >
              Clear history
            </button>
          </div>
        </>
      )}
    </Section>
  )
}

// Setting, changing or removing the grown-up PIN
function PinSection() {
  const [set, setSet] = useState(hasPin)
  const [editing, setEditing] = useState(false)
  const [pin, setPinText] = useState('')
  const [again, setAgain] = useState('')
  const mismatch = again.length === PIN_LENGTH && again !== pin
  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!isPin(pin) || pin !== again) return
    await setPin(pin)
    setSet(true)
    setEditing(false)
    setPinText('')
    setAgain('')
  }
  const digits = (value: string) => value.replace(/\D/g, '').slice(0, PIN_LENGTH)
  return (
    <Section title="Grown-up PIN">
      <p>{set ? 'These settings are locked with your PIN.' : `Set a ${PIN_LENGTH}-digit PIN so only you can open these settings. Without one, a maths question protects them.`}</p>
      {editing ? (
        <form className="pin-form" onSubmit={save}>
          <label>
            New PIN
            <input className="settings-input" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPinText(digits(e.target.value))} />
          </label>
          <label>
            Same PIN again
            <input className="settings-input" type="password" inputMode="numeric" autoComplete="new-password" value={again} onChange={(e) => setAgain(digits(e.target.value))} />
          </label>
          {mismatch && <p className="gate-wrong">The two PINs don't match.</p>}
          <div className="settings-buttons">
            <button className="tool-button tool-button-main" type="submit" disabled={!isPin(pin) || pin !== again}>
              Save PIN
            </button>
            <button className="tool-button" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="settings-buttons">
          <button className="tool-button" type="button" onClick={() => setEditing(true)}>
            {set ? 'Change PIN' : 'Set a PIN'}
          </button>
          {set && (
            <button
              className="tool-button"
              type="button"
              onClick={() => {
                removePin()
                setSet(false)
              }}
            >
              Remove PIN
            </button>
          )}
        </div>
      )}
    </Section>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

// Details a grown-up can open, so each card stays short
function More({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="settings-more">
      <summary>{summary}</summary>
      {children}
    </details>
  )
}

// `disabled`: can't be turned on until the grown-up turns on the checks
function Toggle({
  on,
  disabled = false,
  onChange,
  label,
  children,
}: {
  on: boolean
  disabled?: boolean
  onChange: (on: boolean) => void
  label: string
  children: ReactNode
}) {
  return (
    <div className="settings-toggle">
      <div>
        <strong>{label}</strong>
        <p>{children}</p>
      </div>
      <button
        className="switch"
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!on)}
      >
        <span className="switch-knob" />
      </button>
    </div>
  )
}
