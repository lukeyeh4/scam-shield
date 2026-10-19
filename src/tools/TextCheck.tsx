import { type FormEvent, useMemo, useRef, useState } from 'react'
import { ScanIcon } from '../icons'
import type { CheckResult } from './examples'
import { inTextOrder } from './examples'
import { blankOut, lookUpMessage, MAX_MESSAGE, messageResult } from './messageLookup'
import { contextFor, type Place } from './pictureLookup'
import { PlacePicker } from './PlacePicker'
import { askAbout } from '../chat/session'
import { checkLink } from './linkCheck'
import { lookUpLink, withFacts } from './linkLookup'
import { MarkedText, ResultView } from './Result'
import { useSetUp } from '../setup'
import { Checking, SetupFirst, ToolScreen, type ToolNav } from './ToolScreen'
import { useSayWebsiteKind, withoutWebsiteKind } from './websiteKind'

// Check a link and Check a message work the same way: paste it in, then see the
// result with the clues marked in the text. Links are checked on the device
// (linkCheck.ts), then on our server while "Checking" shows (linkLookup.ts).
// Messages have their personal details blanked out, then go to our server, where
// Claude finds the warning signs (messageLookup.ts); the kid can say where the
// message is from first.
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
    note: null,
  },
}

// Checking turns into the result once it's ready (see showResult)
type Stage = 'paste' | 'checking'

type TextCheckProps = ToolNav & {
  kind: keyof typeof KINDS
  // A link to start with, e.g. one the player typed in the chat
  initial?: string
}

export function TextCheck({ kind, initial = '', onHome, onAsk, onSetUp }: TextCheckProps) {
  const k = KINDS[kind]
  const setUp = useSetUp()
  const sayKind = useSayWebsiteKind()
  const [stage, setStage] = useState<Stage>('paste')
  const [text, setText] = useState(kind === 'link' ? initial : '')
  // A message as sent and shown in the result: personal details blanked out
  const [checkedText, setCheckedText] = useState('')
  // Where the kid says a message came from (optional), and what they typed
  const [place, setPlace] = useState<Place | null>(null)
  const [typed, setTyped] = useState('')
  const about = contextFor(place, typed)
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
      const message = blankOut(text.trim().slice(0, MAX_MESSAGE))
      setCheckedText(message)
      setResult(undefined)
      setStage('checking')
      const id = ++latestCheck.current
      setLookedUp(false)
      const { context, upset } = about
      void lookUpMessage(message, context)
        .then((facts) => messageResult(facts, message))
        // Something upsetting typed about it: a grown-up right now, whatever's in it
        .then((checked) => (upset ? { ...checked, risk: 'high' as const, urgent: true } : checked))
        .then((checked) => {
          if (id !== latestCheck.current) return
          setResult(checked)
          setLookedUp(true)
        })
      return
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
  // Numbered in the order they come in the text. Unless a grown-up chose otherwise,
  // only "Not for kids", not what kind of website it is (websiteKind.ts)
  const shownText = kind === 'message' ? checkedText : text.trim()
  // For the grown-ups' history: which checker, and a link's website (never the message)
  const site = kind === 'link' && result && 'site' in result ? String(result.site) : undefined
  const history = useMemo(() => ({ checker: kind, site }), [kind, site])
  const shown = result && inTextOrder(sayKind ? result : withoutWebsiteKind(result), shownText)
  // Messages will be sent to be checked, so a grown-up has to finish setup first.
  // Links are checked on the device until then, with a note saying so.
  if (kind === 'message' && !setUp) return <SetupFirst title={k.title} what="messages" onHome={onHome} onSetUp={onSetUp} />
  // A message's result says an AI checked it (kids must be told: Anthropic's rules
  // for apps used by minors)
  const note =
    kind === 'link' && !setUp
      ? 'Quick check only. Ask a grown-up to set up full checks.'
      : kind === 'message' && showResult
        ? 'Checked by AI, a computer program. It can make mistakes.'
        : k.note

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
    <ToolScreen title={k.title} steps={showResult ? undefined : 2} step={stage === 'paste' ? 0 : 1} onBack={back} note={note}>
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
            <>
              <div className="tool-input-row">
                <textarea
                  className="tool-input"
                  value={text}
                  rows={4}
                  maxLength={MAX_MESSAGE}
                  placeholder="Paste or type the message"
                  onChange={(e) => setText(e.target.value)}
                  aria-labelledby="paste-heading"
                />
                <button className="tool-paste" type="button" onClick={paste}>
                  Paste
                </button>
              </div>
              <PlacePicker place={place} onPlace={setPlace} typed={typed} onTyped={setTyped} personal={about.personal} />
            </>
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

      {showResult && shown && (
        <ResultView
          subject={<MarkedText text={shownText} clues={shown.clues} className={`checked-${kind}`} />}
          result={shown}
          history={history}
          onAgain={onAsk}
          onDone={onHome}
          onAskAbout={
            kind === 'message'
              ? () => {
                  askAbout(shown.clues.map((c) => c.label))
                  onAsk()
                }
              : undefined
          }
        />
      )}
    </ToolScreen>
  )
}
