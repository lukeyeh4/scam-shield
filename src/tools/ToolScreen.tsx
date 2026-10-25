import { type ReactNode, useEffect, useEffectEvent } from 'react'
import { Buddy } from '../buddy/Buddy'
import { CloseIcon, LockIcon } from '../icons'
import './tools.css'

type ToolScreenProps = {
  title: string
  // How many steps the tool has, and which one this is (from 0). Leave out for a
  // screen with only one step.
  steps?: number
  step?: number
  // The first step goes back to the menu; later steps go back a step
  onBack: () => void
  // A round × instead of Menu or Back, for screens that ask for a grown-up: they
  // close and go back to where the kid was
  close?: boolean
  // These screens are wireframes: a quiet note at the bottom says nothing really happens
  // yet (null: no note, for a tool that really works)
  note?: string | null
  children: ReactNode
}

// The frame every tool shares: the header with a back button, a slim progress bar,
// the step itself, then the preview note
export function ToolScreen({ title, steps, step = 0, onBack, close = false, note = 'Preview: nothing is really checked yet', children }: ToolScreenProps) {
  return (
    <div className="tool">
      <header className="scenario-header">
        {close ? (
          <button className="back back-close" type="button" onClick={onBack} aria-label="Close">
            <CloseIcon />
          </button>
        ) : (
          <button className="back" type="button" onClick={onBack}>
            {step === 0 ? 'Menu' : 'Back'}
          </button>
        )}
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
        {note && <p className="preview-note">{note}</p>}
      </main>
    </div>
  )
}

// While a check runs: Buddy looks for clues, then the result appears by itself
export function Checking({ onDone, ms = 3000 }: { onDone: () => void; ms?: number }) {
  const done = useEffectEvent(onDone)
  useEffect(() => {
    const timer = setTimeout(done, ms)
    return () => clearTimeout(timer)
  }, [ms])

  return (
    <div className="tool-checking" role="status">
      <Buddy mood="thinking" messages={['Let me look for clues…']} />
      <span className="checking-bar" aria-hidden="true" />
    </div>
  )
}

// Where every tool can lead next. `onSetUp` opens the grown-ups' setup, then
// comes back to this tool.
export type ToolNav = {
  onHome: () => void
  onAsk: () => void
  onSetUp: () => void
}

// Instead of a tool that sends something to be checked, until a grown-up has
// finished setup (setup.ts). `what`: what the tool checks, e.g. "pictures". The ×
// goes back to the chat, where the tools are opened from.
export function SetupFirst({ title, what, onAsk, onSetUp }: { title: string; what: string; onAsk: () => void; onSetUp: () => void }) {
  return (
    <ToolScreen title={title} onBack={onAsk} close note={null}>
      <div className="tool-column gate">
        <span className="gate-icon">
          <LockIcon />
        </span>
        <h2 className="tool-heading">Ask a grown-up first</h2>
        <p className="tool-text">A grown-up needs to set up Scam Shield before I can check {what}.</p>
        <div className="tool-actions">
          <button className="tool-button tool-button-main" type="button" onClick={onSetUp}>
            Get a grown-up
          </button>
        </div>
      </div>
    </ToolScreen>
  )
}
