import { type ReactNode, useEffect, useEffectEvent } from 'react'
import { Buddy } from '../buddy/Buddy'
import './tools.css'

type ToolScreenProps = {
  title: string
  // How many steps the tool has, and which one this is (from 0). Leave out for a
  // screen with only one step.
  steps?: number
  step?: number
  // The first step goes back to the menu; later steps go back a step
  onBack: () => void
  // These screens are wireframes: a quiet note at the bottom says nothing really happens yet
  note?: string
  children: ReactNode
}

// The frame every tool shares: the header with a back button, a slim progress bar,
// the step itself, then the preview note
export function ToolScreen({ title, steps, step = 0, onBack, note = 'Preview: nothing is really checked yet', children }: ToolScreenProps) {
  return (
    <div className="tool">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          {step === 0 ? 'Menu' : 'Back'}
        </button>
        <h1 className="scenario-title">{title}</h1>
      </header>

      <main className="tool-main">
        {steps && (
          <div className="tool-progress">
            <span className="tool-progress-text">
              Step {step + 1} of {steps}
            </span>
            <span className="tool-progress-bar" aria-hidden="true">
              {Array.from({ length: steps }, (_, i) => (
                <span key={i} className={i <= step ? 'is-on' : undefined} />
              ))}
            </span>
          </div>
        )}
        {/* A new key for each step, so it slides in */}
        <div key={step} className="tool-step screen-enter">
          {children}
        </div>
        <p className="preview-note">{note}</p>
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
  onAsk: () => void
}
