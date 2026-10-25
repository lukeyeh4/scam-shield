import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { noteCheck } from '../chat/session'
import { type Checker, recordCheck } from '../history'
import { splitByHighlights } from '../highlight'
import { ChevronIcon, CloseIcon, DangerIcon, GoodIcon, GrownUpIcon, NoEntryIcon, UnsureIcon, ZoomIcon } from '../icons'
import type { Box, CheckResult, Clue, Risk } from './examples'
import { buddyWhy } from './clueWhy'
import { marksOf } from './pictureMarks'

// How each risk level is shown: soft red, yellow or green, each with its own icon
// so colour isn't the only sign, and what to do under the heading. Never "safe": a
// check can miss things.
type Look = { title: string; tell: string; icon: ReactNode }
const RISKS: Record<Risk, Look> = {
  high: { title: 'This looks like a scam', tell: "Don't answer it or tap on it. Show a grown-up.", icon: <DangerIcon /> },
  medium: { title: 'Be careful', tell: "Don't answer it or tap on it. Show a grown-up.", icon: <UnsureIcon /> },
  none: { title: 'No clues found', tell: 'Still not sure? Show a grown-up.', icon: <GoodIcon /> },
}
// Red too, but not a scam: betting, adult or pirated streaming websites
const NOT_FOR_KIDS: Look = { title: "This isn't for kids", tell: "Don't open it. Show a grown-up.", icon: <NoEntryIcon /> }
// Someone is threatening the child or asking for photos: calm, no blame, and what
// to do, before anything else (scripted, never from the AI)
const URGENT: Look = { title: 'Show a grown-up right now', tell: "It's not your fault.", icon: <GrownUpIcon /> }
const URGENT_STEPS = ["Don't answer or send anything.", "Keep it. Don't delete it.", 'Show a grown-up you trust.']

type ResultViewProps = {
  // What was checked: the picture, the link or the message, with the clues marked.
  // A function gets the clue picked in the list (or null), to make its mark stand
  // out (MarkedPicture)
  subject: ReactNode | ((picked: number | null) => ReactNode)
  result: CheckResult
  onAgain?: () => void
  onDone?: () => void
  // "Ask Buddy about this": the chat, knowing what this check found
  onAskAbout?: () => void
  // Which checker this is (and a link's website), for the grown-ups' history
  history?: { checker: Checker; site?: string }
  // Buttons to show instead of Check something else / I'm done, in the game's
  // "Check with Scam Shield" practice (which the chat doesn't hear about)
  actions?: ReactNode
}

// The result of any check: what was checked beside how risky it looks and what to
// do, the clues (one card each, numbered to match the marks), good signs when
// there are no clues, then the buttons
export function ResultView({ subject, result, onAgain, onDone, onAskAbout, history, actions }: ResultViewProps) {
  const risk = result.urgent ? URGENT : result.notForKids ? NOT_FOR_KIDS : RISKS[result.risk]
  // A clue tapped in the list: its reason shows, and its boxes on a picture stand
  // out (tap again to close)
  const [picked, setPicked] = useState<number | null>(null)
  // The clue the kid asked Shield Buddy about
  const [asked, setAsked] = useState<number | null>(null)
  const pick = (i: number) => {
    setPicked(picked === i ? null : i)
    setAsked(null)
  }
  const practice = actions !== undefined
  // Back in the chat, Buddy talks about what this check found
  useEffect(() => {
    if (!practice) noteCheck(result.urgent ? 'urgent' : result.notForKids ? 'notForKids' : result.risk)
  }, [practice, result.risk, result.notForKids, result.urgent])
  // In the grown-ups' history (not the game's practice checks)
  useEffect(() => {
    if (!practice && history) recordCheck(history.checker, result, history.site)
  }, [practice, history, result])
  return (
    <section className={`result result-${result.risk}`} aria-labelledby="result-title">
      <div className="result-subject">
        <h3 className="result-label">What you checked</h3>
        {typeof subject === 'function' ? subject(picked) : subject}
      </div>

      <div className="result-panel">
        <div className={`result-banner risk-${result.risk}`}>
          <span className="result-icon">{risk.icon}</span>
          <div>
            <h2 id="result-title" className="result-title">
              {risk.title}
            </h2>
            <p className="result-tell">{risk.tell}</p>
          </div>
        </div>

        {result.urgent && (
          <div className="result-urgent">
            <h3 className="result-label" id="result-steps">
              What to do
            </h3>
            <ol aria-labelledby="result-steps">
              {URGENT_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* "Clues", a small label like "What you checked", and how to open one */}
        {result.clues.length > 0 && (
          <div className="result-section-head">
            <h3 className="result-label" id="result-clues">
              {result.clues.length === 1 ? 'Clue' : 'Clues'}
            </h3>
            <span className="result-hint">Tap one to see why</span>
          </div>
        )}
        {result.clues.length > 0 && (
          <ol className="result-clues" aria-labelledby="result-clues">
            {result.clues.map((c, i) => (
              // Just the clue's name; tapping it opens why (and makes its boxes on
              // a picture stand out)
              <li key={c.label} className={picked === i ? 'result-clue is-open' : 'result-clue'}>
                <button className="result-clue-button" type="button" aria-expanded={picked === i} onClick={() => pick(i)}>
                  <strong>{c.label}</strong>
                  <ChevronIcon className="result-clue-arrow" />
                </button>
                {picked === i && <p className="result-clue-reason">{c.reason}</p>}
                {/* Not sure why? Shield Buddy explains, in its scripted lines */}
                {picked === i &&
                  (asked === i ? (
                    <div className="result-why">
                      <Buddy key={i} mood="thinking" messages={buddyWhy(c, i + 1)} />
                    </div>
                  ) : (
                    <button className="result-why-button" type="button" onClick={() => setAsked(i)}>
                      Why? Ask Shield Buddy
                    </button>
                  ))}
              </li>
            ))}
          </ol>
        )}

        {result.risk === 'none' && result.good?.length ? (
          <div className="result-good">
            <h3 className="result-label">Good signs</h3>
            <ul>
              {result.good.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="tool-actions">
          {actions ?? (
            <>
              <button className="tool-button tool-button-main" type="button" onClick={onAgain}>
                Check something else
              </button>
              {onAskAbout && (
                <button className="tool-button" type="button" onClick={onAskAbout}>
                  Ask Buddy about this
                </button>
              )}
              <button className="tool-button" type="button" onClick={onDone}>
                I'm done
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// A link or message with each clue's words marked and numbered, to match the list
export function MarkedText({ text, clues, className = '' }: { text: string; clues: Clue[]; className?: string }) {
  const highlights = clues.flatMap((c, index) => (c.highlight ? [{ index, text: c.highlight }] : []))
  return (
    <p className={`marked-text ${className}`}>
      {splitByHighlights(text, highlights).map((s, i) =>
        s.mark === undefined ? (
          s.text
        ) : (
          <mark key={i} className="result-mark">
            {s.text}
            <span className="result-mark-number">
              <span className="sr-only">clue </span>
              {s.mark + 1}
            </span>
          </mark>
        ),
      )}
    </p>
  )
}

// A picture with each clue's boxes drawn on it, numbered to match the list. When
// a clue is picked in the list, its boxes stand out and the others fade. The boxes
// are only decoration: the list says everything, in order, for screen readers.
// `picked`: the clue (or clues) whose boxes stand out. `onPick`: boxes become
// buttons that say which clues they mark (in the big picture).
// `index`: which of the check's pictures this is (its boxes only)
type MarkedPictureProps = { src: string; clues: Clue[]; index?: number; picked?: number | number[] | null; onPick?: (clues: number[]) => void }
export function MarkedPicture({ src, clues: all, index = 0, picked = null, onPick }: MarkedPictureProps) {
  // Every clue (so the numbers match the list), with only this picture's boxes
  const clues = all.map((c) => ({ ...c, boxes: c.boxes?.filter((b) => (b.picture ?? 0) === index) }))
  const standOut = picked === null ? [] : Array.isArray(picked) ? picked : [picked]
  const marked = clues.filter((c) => c.boxes?.length).length
  // Each number sits on its box's top-left corner, or the top-right one if another
  // number is already there (boxes on lines next to each other)
  const placed: { x: number; y: number }[] = []
  const near = (x: number, y: number) => placed.some((p) => Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 70)
  const corner = (box: Box) => {
    const right = near(box.left, box.top) && !near(box.right, box.top)
    placed.push({ x: right ? box.right : box.left, y: box.top })
    return right
  }
  return (
    <div className={standOut.length ? 'marked-picture has-picked' : 'marked-picture'}>
      <img
        className="tool-photo"
        src={src}
        alt={marked ? `The picture you checked, with ${marked === 1 ? '1 clue' : `${marked} clues`} marked` : 'The picture you checked'}
      />
      {marksOf(clues).map(({ box, clues: numbers }) => {
        const { left, top, right, bottom } = box
        const onRight = corner(box)
        const className = numbers.some((n) => standOut.includes(n)) ? 'picture-box is-picked' : 'picture-box'
        const style = { left: `${left / 10}%`, top: `${top / 10}%`, width: `${(right - left) / 10}%`, height: `${(bottom - top) / 10}%` }
        // One circle per clue, side by side, when a box marks more than one
        const circles = (
          <span className={onRight ? 'picture-box-numbers on-right' : 'picture-box-numbers'}>
            {numbers.map((n) => (
              <span key={n} className="picture-box-number">
                {n + 1}
              </span>
            ))}
          </span>
        )
        const key = `${numbers.join('-')}-${left}-${top}`
        return onPick ? (
          <button
            key={key}
            className={className}
            style={style}
            type="button"
            aria-label={`Clue ${numbers.map((n) => n + 1).join(' and ')}: ${numbers.map((n) => clues[n].label).join(', ')}`}
            onClick={() => onPick(numbers)}
          >
            {circles}
          </button>
        ) : (
          <span key={key} className={className} style={style} aria-hidden="true">
            {circles}
          </span>
        )
      })}
    </div>
  )
}

// The picture with its boxes, and a button (or a tap on the picture) to see it
// big: full screen, with the same boxes, to look closely at small writing. There,
// tapping a box shows its clues in a card at the bottom.
export function ZoomablePicture({ src, clues, index = 0, picked = null }: { src: string; clues: Clue[]; index?: number; picked?: number | null }) {
  const dialog = useRef<HTMLDialogElement>(null)
  // The clues of the box tapped in the big picture
  const [shown, setShown] = useState<number[] | null>(null)
  const open = () => dialog.current?.showModal()
  const close = () => dialog.current?.close()
  const pick = (numbers: number[]) => setShown(shown?.join() === numbers.join() ? null : numbers)
  return (
    <div className="zoomable">
      <button className="zoomable-picture" type="button" onClick={open} aria-label="Make the picture bigger">
        <MarkedPicture src={src} clues={clues} index={index} picked={picked} />
      </button>
      <button className="zoom-button" type="button" onClick={open} aria-label="Make the picture bigger">
        <ZoomIcon />
      </button>
      {/* Tapping outside the picture closes it too; Esc closes it (the dialog does that) */}
      <dialog
        ref={dialog}
        className="picture-zoom"
        aria-label="The picture, bigger"
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => setShown(null)}
      >
        <button className="zoom-close" type="button" onClick={close} aria-label="Close the big picture" autoFocus>
          <CloseIcon />
        </button>
        <MarkedPicture src={src} clues={clues} index={index} picked={shown} onPick={pick} />
        {shown && (
          <ul className="zoom-card" aria-live="polite">
            {shown.map((n) => (
              <li key={n}>
                <span className="picture-box-number">{n + 1}</span>
                <span>
                  <strong>{clues[n].label}</strong>
                  <span>{clues[n].reason}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </div>
  )
}
