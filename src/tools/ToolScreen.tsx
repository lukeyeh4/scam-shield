import { type ReactNode, useEffect, useEffectEvent } from 'react'
import { Buddy } from '../buddy/Buddy'
import './tools.css'

type ToolScreenProps = {
  title: string
  // The steps, named in a word or two (e.g. Choose, Check, Result), and which one this is.
  // Leave out for a screen with only one step.
  steps?: string[]
  step?: number
  // The first step goes back to the menu; later steps go back a step
  onBack: () => void
  // These screens are wireframes: a note says nothing really happens yet
  note?: string
  children: ReactNode
}

// The frame every tool shares: the header with a back button, a note that it's a
// preview, the step bar, then the step itself
export function ToolScreen({ title, steps, step = 0, onBack, note = 'Preview: nothing is checked yet', children }: ToolScreenProps) {
  return (
    <div className="tool">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          {step === 0 ? 'Menu' : 'Back'}
        </button>
        <h1 className="scenario-title">{title}</h1>
      </header>

      <main className="tool-main">
        <p className="preview-note">{note}</p>
        {steps && (
          <ol className="tool-steps">
            {steps.map((name, i) => (
              <li
                key={name}
                className={i < step ? 'is-done' : i === step ? 'is-current' : undefined}
                aria-current={i === step ? 'step' : undefined}
              >
                <span className="tool-step-number" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">
                    Step {i + 1} of {steps.length}:{' '}
                  </span>
                  {name}
                </span>
              </li>
            ))}
          </ol>
        )}
        {/* A new key for each step, so it slides in */}
        <div key={step} className="tool-step screen-enter">
          {children}
        </div>
      </main>
    </div>
  )
}

// While a check runs: Buddy looks for clues, then the result appears by itself
export function Checking({ onDone }: { onDone: () => void }) {
  const done = useEffectEvent(onDone)
  useEffect(() => {
    const timer = setTimeout(done, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="tool-checking" role="status">
      <Buddy mood="thinking" messages={['Let me look for clues…']} />
      <span className="checking-bar" aria-hidden="true" />
    </div>
  )
}

// Where every tool can lead next
export type ToolNav = {
  onHome: () => void
  onTell: () => void
  onAsk: () => void
}
