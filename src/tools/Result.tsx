import { type ReactNode, useEffect } from 'react'
import { noteCheck } from '../chat/session'
import { splitByHighlights } from '../highlight'
import { DangerIcon, GoodIcon, NoEntryIcon, UnsureIcon } from '../icons'
import type { CheckResult, Clue, Risk } from './examples'

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
  // What was checked: the picture, the link or the message, with the clues marked
  subject: ReactNode
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
  const practice = actions !== undefined
  // Back in the chat, Buddy talks about what this check found
  useEffect(() => {
    if (!practice) noteCheck(result.notForKids ? 'notForKids' : result.risk)
  }, [practice, result.risk, result.notForKids])
  return (
    <section className={`result result-${result.risk}`} aria-labelledby="result-title">
      <div className="result-subject">
        <h3 className="result-label">What you checked</h3>
        {subject}
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
            {result.clues.map((c) => (
              <li key={c.label} className="result-clue">
                <strong>{c.label}</strong>
                <span>{c.reason}</span>
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
