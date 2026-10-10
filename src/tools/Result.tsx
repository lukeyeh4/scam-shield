import type { ReactNode } from 'react'
import { splitByHighlights } from '../highlight'
import { GrownUpIcon } from '../icons'
import type { CheckResult, Clue, Risk } from './examples'

// How each risk level is shown. Never "safe": a check can miss things.
const RISKS: Record<Risk, { title: string; badge: (n: number) => string }> = {
  high: { title: 'This looks like a scam', badge: (n) => `${n} scam clue${n === 1 ? '' : 's'} found` },
  medium: { title: 'Be careful with this one', badge: (n) => `${n} clue${n === 1 ? '' : 's'} to think about` },
  none: { title: "I didn't spot any clues", badge: () => 'No clues found' },
}

type ResultViewProps = {
  // What was checked: the picture, the link or the message, with the clues marked
  subject: ReactNode
  result: CheckResult
  onTell: () => void
  onAgain: () => void
  onDone: () => void
}

// The result of any check: what was checked beside how risky it looks, the
// numbered clues (matching the numbers on what was checked), and what to do next
export function ResultView({ subject, result, onTell, onAgain, onDone }: ResultViewProps) {
  const risk = RISKS[result.risk]
  return (
    <section className="result" aria-labelledby="result-title">
      <div className="result-subject">{subject}</div>

      <div className="result-panel">
        <h2 id="result-title" className="result-title">
          {risk.title}
        </h2>
        <p className={`risk-badge risk-${result.risk}`}>{risk.badge(result.clues.length)}</p>
        <ol className="result-clues">
          {result.clues.map((c) => (
            <li key={c.label} className="result-clue">
              <strong>{c.label}</strong>
              <span>{c.reason}</span>
            </li>
          ))}
        </ol>
        <p className="result-tell">
          {result.risk === 'none'
            ? 'Still not sure? Show a grown-up before you do anything.'
            : "Don't answer it or tap on it. Show a grown-up."}
        </p>
        <div className="tool-actions">
          <button className="tool-button tool-button-main" type="button" onClick={onTell}>
            <GrownUpIcon />
            Tell a grown-up
          </button>
          <button className="tool-button" type="button" onClick={onAgain}>
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
