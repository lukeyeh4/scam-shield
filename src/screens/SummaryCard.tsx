import type { RecapSummary } from '../types'

// The last step of the recap: what you can do next time, and what to avoid.
export function SummaryCard({ summary }: { summary: RecapSummary }) {
  return (
    <section className="summary-card" aria-label="Remember">
      <h2 className="summary-title">Remember</h2>

      <p className="summary-solution">{summary.solution}</p>

      <span className="summary-label">Make sure to avoid</span>
      <ul className="summary-checks">
        {summary.checks.map((check) => (
          <li key={check}>
            <WarningIcon />
            {check}
          </li>
        ))}
      </ul>
    </section>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fdf1c4" />
      <path d="M12 6.5v7" stroke="#7a5600" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="1.5" fill="#7a5600" />
    </svg>
  )
}
