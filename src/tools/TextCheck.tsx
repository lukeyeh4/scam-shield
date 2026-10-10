import { useState } from 'react'
import { ScanIcon } from '../icons'
import { exampleLink, exampleMessage, linkResult, messageResult } from './examples'
import { MarkedText, ResultView } from './Result'
import { Checking, ToolScreen, type ToolNav } from './ToolScreen'

// Check a link and Check a message work the same way: paste it in, then see the
// result with the clues marked in the text. Wireframes: the box holds an example.
const KINDS = {
  link: {
    title: 'Check a link',
    heading: 'Paste the link',
    example: exampleLink,
    tip: "Don't tap the link. Press and hold it, then tap Copy.",
    result: linkResult,
  },
  message: {
    title: 'Check a message',
    heading: 'Paste the message',
    example: exampleMessage,
    tip: 'Press and hold the message, then tap Copy.',
    result: messageResult,
  },
}

type Stage = 'paste' | 'checking' | 'result'

export function TextCheck({ kind, onHome, onAsk }: ToolNav & { kind: keyof typeof KINDS }) {
  const k = KINDS[kind]
  const [stage, setStage] = useState<Stage>('paste')
  const back = () => (stage === 'paste' ? onHome() : setStage('paste'))

  return (
    <ToolScreen title={k.title} steps={2} step={stage === 'paste' ? 0 : 1} onBack={back}>
      {stage === 'paste' && (
        <div className="tool-column">
          <h2 className="tool-heading" id="paste-heading">
            {k.heading}
          </h2>
          {kind === 'link' ? (
            <input className="tool-input" type="text" value={k.example} readOnly aria-labelledby="paste-heading" />
          ) : (
            <textarea className="tool-input" value={k.example} rows={3} readOnly aria-labelledby="paste-heading" />
          )}
          <p className="tool-text">{k.tip}</p>
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
              <ScanIcon />
              Check it
            </button>
          </div>
        </div>
      )}

      {stage === 'checking' && <Checking onDone={() => setStage('result')} />}

      {stage === 'result' && (
        <ResultView
          subject={<MarkedText text={k.example} clues={k.result.clues} className={`checked-${kind}`} />}
          result={k.result}
          onAgain={onAsk}
          onDone={onHome}
        />
      )}
    </ToolScreen>
  )
}
