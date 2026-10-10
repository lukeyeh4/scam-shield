import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { GrownUpIcon, SendIcon } from '../icons'
import { exampleGrownUps } from '../tools/examples'
import { ToolScreen, type ToolNav } from '../tools/ToolScreen'

// What the player can say (or send) to a grown-up
const SAY = "I got this, and I'm not sure if it's real. Can you help me check?"

type Stage = { at: 'who' } | { at: 'send'; to: string } | { at: 'show' } | { at: 'done'; to?: string }
const STEP = { who: 0, send: 1, show: 1, done: 2 }

// Tell a grown-up (a wireframe: nothing is really sent). Pick one of the trusted
// grown-ups the parent chose in setup and send them what was checked, or show
// someone who is right there.
export function TellScreen({ onHome, onAsk }: Omit<ToolNav, 'onTell'>) {
  const [stage, setStage] = useState<Stage>({ at: 'who' })
  const back = () => (stage.at === 'who' ? onHome() : setStage({ at: 'who' }))

  return (
    <ToolScreen
      title="Tell a grown-up"
      steps={['Who', 'Tell', 'Done']}
      step={STEP[stage.at]}
      onBack={back}
      note="Preview: nothing is sent yet"
    >
      {stage.at === 'who' && (
        <div className="tool-column">
          <Buddy mood="cheering" messages={['Great idea! Who do you want to tell?']} />
          <ul className="tool-choices tool-choices-list">
            {exampleGrownUps.map((g) => (
              <li key={g.name}>
                <button className="tool-person" type="button" onClick={() => setStage({ at: 'send', to: g.name })}>
                  <span className="tool-person-initial" aria-hidden="true">
                    {g.name.charAt(0)}
                  </span>
                  <span className="tool-choice-label">{g.name}</span>
                  <span className="tool-choice-hint">{g.note}</span>
                </button>
              </li>
            ))}
            <li>
              <button className="tool-person" type="button" onClick={() => setStage({ at: 'show' })}>
                <span className="tool-person-initial" aria-hidden="true">
                  <GrownUpIcon />
                </span>
                <span className="tool-choice-label">A grown-up who is with me</span>
                <span className="tool-choice-hint">Show them on this screen</span>
              </button>
            </li>
          </ul>
          <p className="tool-text tool-small">Your grown-up picked these people.</p>
        </div>
      )}

      {stage.at === 'send' && (
        <div className="tool-column">
          <h2 className="tool-heading">Send to {stage.to}</h2>
          <div className="tool-card">
            <span className="tool-field-label">What {stage.to} will see</span>
            <p className="say-bubble">{SAY}</p>
            <p className="tool-text tool-small">And the thing you checked, with its clues.</p>
          </div>
          <div className="tool-actions">
            <button
              className="tool-button tool-button-main"
              type="button"
              onClick={() => setStage({ at: 'done', to: stage.to })}
            >
              <SendIcon />
              Send to {stage.to}
            </button>
            <button className="tool-button" type="button" onClick={() => setStage({ at: 'who' })}>
              Pick someone else
            </button>
          </div>
        </div>
      )}

      {stage.at === 'show' && (
        <div className="tool-column">
          <h2 className="tool-heading">Show this to your grown-up</h2>
          <p className="say-card">{SAY}</p>
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="button" onClick={() => setStage({ at: 'done' })}>
              I showed them
            </button>
          </div>
        </div>
      )}

      {stage.at === 'done' && (
        <div className="tool-column">
          <Buddy
            mood="cheering"
            messages={[
              stage.to ? `Sent! ${stage.to} will see it soon.` : 'Great job telling a grown-up!',
              "While you wait, don't answer it or tap on it.",
            ]}
          />
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="button" onClick={onHome}>
              I'm done
            </button>
            <button className="tool-button" type="button" onClick={onAsk}>
              Check something else
            </button>
          </div>
        </div>
      )}
    </ToolScreen>
  )
}
