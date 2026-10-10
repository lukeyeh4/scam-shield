import type { ReactNode } from 'react'
import { splitByHighlights } from '../highlight'
import type { CheckResult, Clue, Risk } from './examples'

// How each risk level is shown. Never "safe": a check can miss things.
const RISKS: Record<Risk, { title: string; tell: string }> = {
  high: { title: 'This looks like a scam', tell: "Don't answer it or tap on it. Show a grown-up." },
  medium: { title: 'Be careful', tell: "Don't answer it or tap on it. Show a grown-up." },
  none: { title: 'No clues found', tell: 'Still not sure? Show a grown-up.' },
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
  return (
    <section className="result" aria-labelledby="result-title">
      <div className="result-subject">{subject}</div>

      <div className="result-panel">
        <h2 id="result-title" className={`result-title risk-${result.risk}`}>
          {risk.title}
        </h2>
        <ol className="result-clues">
          {result.clues.map((c) => (
            <li key={c.label} className="result-clue">
              <strong>{c.label}</strong>
              <span>{c.reason}</span>
            </li>
          ))}
        </ol>
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
