import { Buddy } from '../buddy/Buddy'
import { ScanIcon } from '../icons'
import type { Mark } from '../mockups/marks'
import { Mockup } from '../mockups/Mockup'
import { scenarios } from '../scenarios'
import './scan.css'

// An example of what a scan will show, made from the "new number" scam in the
// game: its "Spot the clues" red flags, marked on the screen and listed with reasons
const example = scenarios.find((s) => s.id === 'new-number')
const clues = example ? [example.recap.stop, ...example.recap.check].filter((c) => c.spot && c.screen !== 'doIt') : []
const marks: Mark[] = clues.map((c) => ({ target: c.target, highlight: c.highlight, state: 'seen' }))

// Check a picture, the main tool (not built yet). Plans: see PROJECT.md.
export function ScanScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">Check a picture</h1>
      </header>

      <main className="scan">
        <div className="scan-intro">
          <Buddy
            mood="curious"
            messages={[
              'Soon you can show me a screenshot or a photo.',
              "I'll look for scam clues and point them out, like in this example.",
            ]}
          />
          <button className="feature-button" type="button" disabled>
            <ScanIcon />
            Choose a picture
            <span className="soon-pill">Coming soon</span>
          </button>
        </div>

        {example && (
          <section className="scan-example" aria-labelledby="scan-example-title">
            <div className="scan-example-picture">
              <Mockup screen={example} marks={marks} animate={false} />
            </div>

            <div className="scan-result">
              <p className="scan-result-kicker">Example</p>
              <h2 id="scan-example-title" className="scan-result-title">
                This looks like a scam
              </h2>
              <p className="risk-badge">
                {clues.length} clues found
              </p>
              <ol className="scan-clues">
                {clues.map((c) => (
                  <li key={c.spot} className="scan-clue">
                    <strong>{c.spot}</strong>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ol>
              <p className="scan-tell">Not sure? Show a grown-up before you do anything.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
