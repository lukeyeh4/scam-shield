import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { setQuestionsAllowed, useQuestionsAllowed } from '../chat/askBuddy'
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
// results say about grown-up websites, the PIN, and a family code word (advice
// only: it's never saved). Everything is saved on this device.
// Written for adults, so the kids' reading-level rules don't apply here.

export function GrownUpsScreen({ onBack }: { onBack: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <ToolScreen title="For grown-ups" onBack={onBack} note={null}>
      {unlocked ? <Settings onDone={onBack} /> : <Gate onOpen={() => setUnlocked(true)} />}
    </ToolScreen>
  )
}

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

  // The PIN is checked as soon as all its digits are in
  const pressDigit = async (digit: string) => {
    const next = (typed + digit).slice(0, PIN_LENGTH)
    setTyped(next)
    setWrong(false)
    if (next.length === PIN_LENGTH) void answer(await checkPin(next))
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
          <div className="pin-dots" aria-label={`${typed.length} of ${PIN_LENGTH} digits entered`}>
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
          {forgot && <p className="tool-text">This removes the PIN and turns the checks off. You can set them up again.</p>}
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
        <Toggle on={agreed} onChange={setSetUp} label="Let my child use the checks">
          {agreed
            ? 'Pictures, messages and links are sent to our server and checked by AI. Scam Shield keeps nothing.'
            : 'Off: nothing is sent anywhere. Links are only checked on this device, and pictures and messages stay locked.'}
        </Toggle>
        <More summary="What is sent, and where">
          <ul className="settings-list">
            <li>
              <strong>Pictures</strong> go to our server and are checked by AI (Claude, by Anthropic).
            </li>
            <li>
              <strong>Messages</strong> have phone numbers, emails, codes and addresses blanked out on this device first,
              then are checked the same way. Names can't always be caught.
            </li>
            <li>
              <strong>Links</strong> are checked against Google Safe Browsing, public website records and family-safe
              filters, and AI may read the page.
            </li>
            <li>
              <strong>Questions to Shield Buddy</strong> and <strong>speech</strong>, only if you turn them on below.
            </li>
            <li>
              <strong>Read aloud</strong> (the speaker in the corner) turns Shield Buddy's own lines, never anything your
              child types, into speech with Google. It works without this switch.
            </li>
          </ul>
          <p>
            Anthropic deletes what it's sent within 30 days and doesn't train on it. See{' '}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
              Anthropic's privacy policy
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Google's
            </a>
            . Each home can check 40 pictures and 100 messages a day. AI can make mistakes, so Scam Shield always tells
            your child to show a grown-up.
          </p>
        </More>
      </Section>

      <Section title="Shield Buddy">
        <Toggle on={questions && agreed} disabled={!agreed} onChange={setQuestionsAllowed} label="Answer my child's questions">
          Typed questions are answered by AI, only about scams and staying safe, always pointing to a grown-up.
        </Toggle>
        {canTalk ? (
          <Toggle on={voice && agreed} disabled={!agreed} onChange={setTalkingAllowed} label="Let my child ask out loud">
            Uses your browser's speech service (Google in Chrome, Apple in Safari). No recordings are kept.
          </Toggle>
        ) : (
          <p className="settings-off">Asking out loud needs Chrome or Safari.</p>
        )}
        {!agreed && <p className="settings-off">Turn on the checks first.</p>}
      </Section>

      <Section title="Results">
        <Toggle on={sayKind} onChange={setSayWebsiteKind} label="Say what kind of website it is">
          Off: betting, adult and pirated streaming sites just say "not for kids", so they don't spark curiosity. Scam
          warnings always explain the trick.
        </Toggle>
      </Section>

      <PinSection />

      <Section title="Family code word">
        <p>
          Choose a secret word together. If someone says they're you, your child can ask for it. Keep it in your heads:
          don't write it in messages, or here.
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
      <p>{set ? 'These settings are locked with your PIN.' : `Set a ${PIN_LENGTH}-digit PIN so only you can open these settings.`}</p>
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
