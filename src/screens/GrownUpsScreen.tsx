import { type ReactNode, useState } from 'react'
import { LockIcon } from '../icons'
import { exampleGrownUps } from '../tools/examples'
import { ToolScreen } from '../tools/ToolScreen'

// The grown-ups' area (a wireframe: nothing is saved). A parent gate first, then
// the settings: how checks work, trusted grown-ups, a family code word, and
// whether the child can type or talk to Shield Buddy.
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
      note="Preview: nothing is saved yet"
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
  const [agreed, setAgreed] = useState(false)
  const [typing, setTyping] = useState(false)
  const [voice, setVoice] = useState(false)

  return (
    <div className="settings">
      <h2 className="tool-heading">Set up Scam Shield</h2>
      <p className="tool-text">Your child can play the game without this. The tools that check real things need you first.</p>

      <Section title="How checks work">
        <p>
          When your child checks a picture, link or message, it is sent to our server and checked by AI. Nothing is
          kept after the check. AI can make mistakes, so Scam Shield always tells your child to show a grown-up.
        </p>
        <label className="settings-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />I understand, and
          agree to my child using the checks
        </label>
      </Section>

      <Section title="Trusted grown-ups">
        <p>Your child can send something they checked to these people.</p>
        <ul className="settings-list">
          {exampleGrownUps.map((g) => (
            <li key={g.name}>
              <span>
                <strong>{g.name}</strong> {g.note}
              </span>
              <button className="tool-text-button" type="button" disabled>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button className="tool-button" type="button" disabled>
          Add a grown-up
        </button>
      </Section>

      <Section title="Family code word">
        <p>
          A secret word only your family knows. If someone says they're you, your child can ask for it. Choose it
          together, and don't write it in messages.
        </p>
        <input className="settings-input" type="text" placeholder="Choose a word together" readOnly />
      </Section>

      <Section title="Typing questions">
        <Toggle on={typing} onChange={setTyping} label="Let your child type questions to Shield Buddy">
          Answers are written by AI and can be wrong. Shield Buddy only answers questions about scams and staying safe
          online.
        </Toggle>
      </Section>

      <Section title="Talking to Shield Buddy">
        <Toggle on={voice} onChange={setVoice} label="Let your child ask questions out loud">
          Your child can tap the microphone and talk instead of typing.
        </Toggle>
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

function Toggle({
  on,
  onChange,
  label,
  children,
}: {
  on: boolean
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
      <button className="switch" type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
        <span className="switch-knob" />
      </button>
    </div>
  )
}
