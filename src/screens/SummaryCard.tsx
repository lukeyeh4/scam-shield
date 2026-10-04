import type { RecapSummary } from '../types'

// The last step of the recap: what you can do next time, and what to check for.
export function SummaryCard({ summary }: { summary: RecapSummary }) {
  return (
    <section className="summary-card" aria-label="Remember">
      <h2 className="summary-title">Remember</h2>

      <div className="summary-solution">
        <span className="summary-label">What you can do</span>
        <p>{summary.solution}</p>
      </div>

      <span className="summary-label">Make sure to check for</span>
      <ul className="summary-checks">
        {summary.checks.map((check) => (
          <li key={check}>
            <CheckIcon />
            {check}
          </li>
        ))}
      </ul>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fdf1c4" />
      <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#7a5600" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
