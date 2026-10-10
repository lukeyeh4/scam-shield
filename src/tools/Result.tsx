import { type ReactNode, useEffect } from 'react'
import { noteCheck } from '../chat/session'
import { splitByHighlights } from '../highlight'
import { DangerIcon, GoodIcon, UnsureIcon } from '../icons'
import type { CheckResult, Clue, Risk } from './examples'

// How each risk level is shown: soft red, yellow or green, each with its own icon
// so colour isn't the only sign. Never "safe": a check can miss things.
const RISKS: Record<Risk, { title: string; tell: string; icon: ReactNode }> = {
  high: { title: 'This looks like a scam', tell: "Don't answer it or tap on it. Show a grown-up.", icon: <DangerIcon /> },
  medium: { title: 'Be careful', tell: "Don't answer it or tap on it. Show a grown-up.", icon: <UnsureIcon /> },
  none: { title: 'No clues found', tell: 'Still not sure? Show a grown-up.', icon: <GoodIcon /> },
}

type ResultViewProps = {
  // What was checked: the picture, the link or the message, with the clues marked
  subject: ReactNode
  result: CheckResult
  onAgain: () => void
  onDone: () => void
}

// The result of any check: what was checked beside how risky it looks, the
// numbered clues (matching the numbers on what was checked), and what to do next
export function ResultView({ subject, result, onAgain, onDone }: ResultViewProps) {
  const risk = RISKS[result.risk]
  // Back in the chat, Buddy talks about what this check found
  useEffect(() => noteCheck(result.risk), [result.risk])
  return (
    <section className={`result result-${result.risk}`} aria-labelledby="result-title">
      <div className="result-subject">{subject}</div>

      <div className="result-panel">
        <h2 id="result-title" className={`result-title risk-${result.risk}`}>
          <span className="result-icon">{risk.icon}</span>
          {risk.title}
        </h2>
        {result.clues.length > 0 && (
          <ol className="result-clues">
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
            <h3>Good signs</h3>
            <ul>
              {result.good.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="result-tell">{risk.tell}</p>
        <div className="tool-actions">
          <button className="tool-button tool-button-main" type="button" onClick={onAgain}>
            Check something else
          </button>
          <button className="tool-text-button" type="button" onClick={onDone}>
            I'm done
          </button>
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
