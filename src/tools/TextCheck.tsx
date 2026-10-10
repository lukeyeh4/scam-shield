import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { LinkIcon, MessageIcon } from '../icons'
import { exampleLink, exampleMessage, linkResult, messageResult } from './examples'
import { MarkedText, ResultView } from './Result'
import { Checking, ToolScreen, type ToolNav } from './ToolScreen'

// Check a link and Check a message work the same way: paste it in, then see the
// result with the clues marked in the text. Wireframes: the box holds an example.
const KINDS = {
  link: {
    title: 'Check a link',
    icon: LinkIcon,
    buddy: ["Copy the link, then paste it here. I'll check where it really goes."],
    label: 'The link',
    example: exampleLink,
    tip: "Don't tap the link to check it! Press and hold it, then tap Copy.",
    button: 'Check this link',
    result: linkResult,
  },
  message: {
    title: 'Check a message',
    icon: MessageIcon,
    buddy: ["Copy the message, then paste it here. I'll look for clues."],
    label: 'The message',
    example: exampleMessage,
    tip: 'Press and hold the message, then tap Copy. Has a picture in it? Check a picture instead.',
    button: 'Check this message',
    result: messageResult,
  },
}

type Stage = 'paste' | 'checking' | 'result'

export function TextCheck({ kind, onHome, onTell, onAsk }: ToolNav & { kind: keyof typeof KINDS }) {
  const k = KINDS[kind]
  const [stage, setStage] = useState<Stage>('paste')
  const back = () => (stage === 'paste' ? onHome() : setStage('paste'))
  const Icon = k.icon

  return (
    <ToolScreen title={k.title} steps={['Paste', 'Result']} step={stage === 'paste' ? 0 : 1} onBack={back}>
      {stage === 'paste' && (
        <div className="tool-column">
          <Buddy mood="curious" messages={k.buddy} />
          <label className="tool-field">
            <span className="tool-field-label">{k.label}</span>
            {kind === 'link' ? (
              <input type="text" value={k.example} readOnly />
            ) : (
              <textarea value={k.example} rows={4} readOnly />
            )}
          </label>
          <p className="tool-text">{k.tip}</p>
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
              <Icon />
              {k.button}
            </button>
          </div>
        </div>
      )}

      {stage === 'checking' && <Checking onDone={() => setStage('result')} />}

      {stage === 'result' && (
        <ResultView
          subject={
            <div className={`checked-text checked-${kind}`}>
              <span className="tool-field-label">{k.label}</span>
              <MarkedText text={k.example} clues={k.result.clues} />
            </div>
          }
          result={k.result}
          onTell={onTell}
          onAgain={onAsk}
          onDone={onHome}
        />
      )}
    </ToolScreen>
  )
}
