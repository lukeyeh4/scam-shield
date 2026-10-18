import { type ReactNode, useEffect, useState } from 'react'
import { noteCheck } from '../chat/session'
import { splitByHighlights } from '../highlight'
import { DangerIcon, GoodIcon, NoEntryIcon, UnsureIcon } from '../icons'
import type { Box, CheckResult, Clue, Risk } from './examples'

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
const NOT_FOR_KIDS: Look = { title: "This website isn't for kids", tell: "Don't open it. Show a grown-up.", icon: <NoEntryIcon /> }

type ResultViewProps = {
  // What was checked: the picture, the link or the message, with the clues marked.
  // A function gets the clue picked in the list (or null), to make its mark stand
  // out (MarkedPicture)
  subject: ReactNode | ((picked: number | null) => ReactNode)
  result: CheckResult
  onAgain?: () => void
  onDone?: () => void
  // Buttons to show instead of Check something else / I'm done, in the game's
  // "Check with Scam Shield" practice (which the chat doesn't hear about)
  actions?: ReactNode
}

// The result of any check: what was checked beside how risky it looks and what to
// do, the clues (one card each, numbered to match the marks), good signs when
// there are no clues, then the buttons
export function ResultView({ subject, result, onAgain, onDone, actions }: ResultViewProps) {
  const risk = result.notForKids ? NOT_FOR_KIDS : RISKS[result.risk]
  // A clue tapped in the list, to show its boxes on the picture (tap again for all)
  const [picked, setPicked] = useState<number | null>(null)
  const practice = actions !== undefined
  // Back in the chat, Buddy talks about what this check found
  useEffect(() => {
    if (!practice) noteCheck(result.notForKids ? 'notForKids' : result.risk)
  }, [practice, result.risk, result.notForKids])
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

        {result.clues.length > 0 && (
          <ol className="result-clues" aria-label="Clues">
            {result.clues.map((c, i) =>
              // A clue with boxes on a picture can be tapped to show just its boxes
              c.boxes?.length ? (
                <li key={c.label} className={picked === i ? 'result-clue is-picked' : 'result-clue'}>
                  <button className="result-clue-button" type="button" aria-pressed={picked === i} onClick={() => setPicked(picked === i ? null : i)}>
                    <strong>{c.label}</strong>
                    <span>{c.reason}</span>
                  </button>
                </li>
              ) : (
                <li key={c.label} className="result-clue">
                  <strong>{c.label}</strong>
                  <span>{c.reason}</span>
                </li>
              ),
            )}
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

// Boxes a little bigger than the words they mark, inside the picture (from 0 to
// 1000), so the edges of the words aren't covered
const PAD = { across: 12, down: 8 }
function padded(box: Box) {
  return {
    left: Math.max(0, box.left - PAD.across),
    top: Math.max(0, box.top - PAD.down),
    right: Math.min(1000, box.right + PAD.across),
    bottom: Math.min(1000, box.bottom + PAD.down),
  }
}

// A picture with each clue's boxes drawn on it, numbered to match the list. When
// a clue is picked in the list, its boxes stand out and the others fade. The boxes
// are only decoration: the list says everything, in order, for screen readers.
export function MarkedPicture({ src, clues, picked = null }: { src: string; clues: Clue[]; picked?: number | null }) {
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
    <div className={picked === null ? 'marked-picture' : 'marked-picture has-picked'}>
      <img
        className="tool-photo"
        src={src}
        alt={marked ? `The picture you checked, with ${marked === 1 ? '1 clue' : `${marked} clues`} marked` : 'The picture you checked'}
      />
      {clues.flatMap((c, i) =>
        (c.boxes ?? []).map((box, j) => {
          const { left, top, right, bottom } = padded(box)
          const onRight = corner({ left, top, right, bottom })
          return (
            <span
              key={`${i}-${j}`}
              className={picked === i ? 'picture-box is-picked' : 'picture-box'}
              style={{ left: `${left / 10}%`, top: `${top / 10}%`, width: `${(right - left) / 10}%`, height: `${(bottom - top) / 10}%` }}
              aria-hidden="true"
            >
              <span className={onRight ? 'picture-box-number on-right' : 'picture-box-number'}>{i + 1}</span>
            </span>
          )
        }),
      )}
    </div>
  )
}
