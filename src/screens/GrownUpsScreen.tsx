import { type ReactNode, useState } from 'react'
import { setQuestionsAllowed, useQuestionsAllowed } from '../chat/askBuddy'
import { LockIcon } from '../icons'
import { setSetUp, useSetUp } from '../setup'
import { ToolScreen } from '../tools/ToolScreen'
import { canTalk, setTalkingAllowed, useTalkingAllowed } from '../voiceInput'

// The grown-ups' area. A parent gate first, then the settings: agreeing to how
// checks work (nothing is sent anywhere until then: setup.ts), a family code word
// (not saved yet), and whether Shield Buddy answers the child's questions and they
// can ask out loud. Everything but the code word is saved on the device.
// Written for adults, so the kids' reading-level rules don't apply here.

// The parent gate: a question young children can't easily answer (app stores
// require one in kids' apps before settings, links or purchases)
const GATE = { question: 'What is 12 × 4?', answers: [36, 44, 48, 52], correct: 48 }

export function GrownUpsScreen({ onBack }: { onBack: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  const [wrong, setWrong] = useState(false)

  return (
    <ToolScreen
      title="For grown-ups"
      onBack={onBack}
      note="Preview: the family code word isn't saved yet"
    >
      {!unlocked ? (
        <div className="tool-column gate">
          <span className="gate-icon">
            <LockIcon />
          </span>
          <h2 className="tool-heading">Grown-ups only</h2>
          <p className="tool-text">Please answer this to continue.</p>
          <p className="gate-question">{GATE.question}</p>
          <div className="gate-answers">
            {GATE.answers.map((n) => (
              <button
                key={n}
                className="tool-button"
                type="button"
                onClick={() => (n === GATE.correct ? setUnlocked(true) : setWrong(true))}
              >
                {n}
              </button>
            ))}
          </div>
          {wrong && (
            <p className="gate-wrong" role="alert">
              That's not right. Kids: ask a grown-up to help.
            </p>
          )}
        </div>
      ) : (
        <Settings onDone={onBack} />
      )}
    </ToolScreen>
  )
}

function Settings({ onDone }: { onDone: () => void }) {
  const agreed = useSetUp()
  const questions = useQuestionsAllowed()
  const voice = useTalkingAllowed()

  return (
    <div className="settings">
      <h2 className="tool-heading">Set up Scam Shield</h2>
      <p className="tool-text">
        Your child can play the game without this. Until you agree below, nothing your child checks or asks is sent
        anywhere: links are only checked on this device, and the picture and message checks stay locked.
      </p>

      <Section title="What is sent, and where">
        <ul className="settings-list">
          <li>
            <strong>Links</strong> go to our server, which looks them up on Google Safe Browsing and in public website
            records, and may have AI (Claude, by Anthropic) read the page.
          </li>
          <li>
            <strong>Pictures and messages</strong> (coming soon), and <strong>questions to Shield Buddy</strong> if you
            turn them on below, go to our server and are checked by AI (Claude, by Anthropic). Messages that look like
            an address, phone number or password are never sent.
          </li>
          <li>
            <strong>Read aloud</strong> (the switch in the corner): Shield Buddy's own lines, never anything your child
            types, are turned into speech by Google Cloud Text-to-Speech. This works without setup, since no
            information about your child is sent.
          </li>
          <li>
            <strong>Speech</strong>, if you turn on asking out loud, is turned into text by your browser's speech
            service (Google in Chrome, Apple in Safari).
          </li>
        </ul>
        <p>
          Scam Shield keeps nothing it is sent. Anthropic and Google have their own rules for what they keep: see{' '}
          <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
            Anthropic's privacy policy
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            Google's privacy policy
          </a>
          . AI can make mistakes, so Scam Shield always tells your child to show a grown-up.
        </p>
        <label className="settings-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setSetUp(e.target.checked)} />I understand, and
          agree to my child using the checks
        </label>
        {agreed && <p className="settings-off">To stop sending anything at all, untick this. It takes effect straight away.</p>}
      </Section>

      <Section title="Family code word">
        <p>
          A secret word only your family knows. If someone says they're you, your child can ask for it. Choose it
          together, and don't write it in messages.
        </p>
        <input className="settings-input" type="text" placeholder="Choose a word together" readOnly />
      </Section>

      <Section title="Asking questions">
        <Toggle
          on={questions && agreed}
          disabled={!agreed}
          onChange={setQuestionsAllowed}
          label="Let Shield Buddy answer your child's questions"
        >
          What your child types in the chat is sent to our server and answered by AI (Claude, by Anthropic). Nothing is
          kept after the answer. Answers can be wrong, so Shield Buddy only answers questions about scams and staying
          safe online, and always tells your child to show a grown-up. When this is off, Shield Buddy asks your child
          to show a grown-up instead.
        </Toggle>
      </Section>

      <Section title="Talking to Shield Buddy">
        {canTalk ? (
          <Toggle on={voice && agreed} disabled={!agreed} onChange={setTalkingAllowed} label="Let your child ask questions out loud">
            Your child can tap the microphone and talk instead of typing, and checks the words before sending. Speech
            is turned into text by your browser's own speech service, which may send the recording to Google (Chrome)
            or Apple (Safari). Scam Shield never keeps recordings.
          </Toggle>
        ) : (
          <p>This browser can't turn speech into text. Try Chrome or Safari to let your child ask out loud.</p>
        )}
      </Section>

      <div className="tool-actions">
        <button className="tool-button tool-button-main" type="button" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
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

// `disabled`: can't be turned on until the grown-up agrees to how checks work
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
        {disabled && <p className="settings-off">Agree to how checks work above first.</p>}
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
