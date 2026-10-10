import { type FormEvent, useRef, useState } from 'react'
import { ScanIcon } from '../icons'
import type { CheckResult } from './examples'
import { exampleMessage, messageResult } from './examples'
import { checkLink } from './linkCheck'
import { lookUpLink, withFacts } from './linkLookup'
import { MarkedText, ResultView } from './Result'
import { Checking, ToolScreen, type ToolNav } from './ToolScreen'

// Check a link and Check a message work the same way: paste it in, then see the
// result with the clues marked in the text. Links are really checked (linkCheck.ts,
// on the device, then linkLookup.ts on our server while "Checking" shows); messages
// are still a wireframe with an example.
const KINDS = {
  link: {
    title: 'Check a link',
    heading: 'Paste the link',
    tip: "Don't tap the link. Press and hold it, then tap Copy.",
    // Links are really checked, so no preview note
    note: null,
  },
  message: {
    title: 'Check a message',
    heading: 'Paste the message',
    tip: 'Press and hold the message, then tap Copy.',
    note: undefined,
  },
}

// Checking turns into the result once it's ready (see showResult)
type Stage = 'paste' | 'checking'

type TextCheckProps = ToolNav & {
  kind: keyof typeof KINDS
  // A link to start with, e.g. one the player typed in the chat
  initial?: string
}

export function TextCheck({ kind, initial = '', onHome, onAsk }: TextCheckProps) {
  const k = KINDS[kind]
  const [stage, setStage] = useState<Stage>('paste')
  const [text, setText] = useState(kind === 'link' ? initial : exampleMessage)
  const [result, setResult] = useState<CheckResult>()
  const [notALink, setNotALink] = useState(false)
  // The result shows once "Checking" has had its moment and the server has answered
  const [waited, setWaited] = useState(false)
  const [lookedUp, setLookedUp] = useState(true)
  // Only the newest check's answer counts, if the player goes back and checks again
  const latestCheck = useRef(0)
  const back = () => (stage === 'paste' ? onHome() : setStage('paste'))

  const check = (e: FormEvent) => {
    e.preventDefault()
    setWaited(false)
    if (kind === 'message') {
      setResult(messageResult)
      return setStage('checking')
    }
    const checked = checkLink(text)
    setNotALink(!checked)
    if (!checked) return
    setResult(checked)
    setStage('checking')
    const id = ++latestCheck.current
    setLookedUp(false)
    lookUpLink(checked.url).then((facts) => {
      if (id !== latestCheck.current) return
      setResult(withFacts(checked, facts))
      setLookedUp(true)
    })
  }
  const showResult = stage === 'checking' && waited && lookedUp

  // The Paste button: reads what the player copied (the browser may ask first)
  const paste = async () => {
    try {
      const copied = await navigator.clipboard.readText()
      if (copied) {
        setText(copied.trim())
        setNotALink(false)
      }
    } catch {
      // Not allowed: they can still press and hold in the box to paste
    }
  }

  return (
    <ToolScreen title={k.title} steps={2} step={stage === 'paste' ? 0 : 1} onBack={back} note={k.note}>
      {stage === 'paste' && (
        <form className="tool-column" onSubmit={check}>
          <h2 className="tool-heading" id="paste-heading">
            {k.heading}
          </h2>
          {kind === 'link' ? (
            <div className="tool-input-row">
              <input
                className="tool-input"
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                placeholder="e.g. roblox.com"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setNotALink(false)
                }}
                aria-labelledby="paste-heading"
                aria-invalid={notALink}
                aria-describedby={notALink ? 'not-a-link' : undefined}
              />
              <button className="tool-paste" type="button" onClick={paste}>
                Paste
              </button>
            </div>
          ) : (
            <textarea className="tool-input" value={text} rows={3} readOnly aria-labelledby="paste-heading" />
          )}
          {notALink ? (
            <p className="tool-problem" id="not-a-link" role="alert">
              That doesn't look like a link. Try copying it again.
            </p>
          ) : (
            <p className="tool-text">{k.tip}</p>
          )}
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="submit" disabled={!text.trim()}>
              <ScanIcon />
              Check it
            </button>
          </div>
        </form>
      )}

      {stage === 'checking' && !showResult && (
        <Checking onDone={() => setWaited(true)} ms={kind === 'link' ? 1500 : 3000} />
      )}

      {showResult && result && (
        <ResultView
          subject={<MarkedText text={text.trim()} clues={result.clues} className={`checked-${kind}`} />}
          result={result}
          onAgain={onAsk}
          onDone={onHome}
        />
      )}
    </ToolScreen>
  )
}
