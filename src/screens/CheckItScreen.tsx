import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { ScanIcon } from '../icons'
import { Mockup } from '../mockups/Mockup'
import { MarkedText, ResultView } from '../tools/Result'
import { Checking } from '../tools/ToolScreen'
import { tutorialCheck } from '../tools/tutorial'
import type { Scenario } from '../types'
import '../tools/tools.css'
import './results.css'

const TITLES = { message: 'Check a message', link: 'Check a link', picture: 'Check a picture' }

type Stage = 'ready' | 'checking' | 'result'

type CheckItScreenProps = {
  scenario: Scenario
  onBack: () => void
  onContinue: () => void
}

// After "Check with Scam Shield": a tutorial version of the matching tool, with the
// scam already filled in. The player taps Check it, sees the result the real tool
// would show, then sees what happened.
export function CheckItScreen({ scenario, onBack, onContinue }: CheckItScreenProps) {
  const [stage, setStage] = useState<Stage>('ready')
  const { tool, text = '' } = scenario.checkIt
  const { result, marks } = tutorialCheck(scenario)

  const picture = (
    <div className="tool-picture">
      <Mockup screen={scenario} marks={stage === 'result' ? marks : undefined} animate={false} />
    </div>
  )

  return (
    <div className="scenario screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">{scenario.title}</h1>
      </header>

      {stage === 'ready' && (
        <main className="scenario-main">
          <div className="check-it-tool">
            {tool === 'picture' && picture}
            <div className="tool-column">
              <h2 className="tool-heading" id="check-it-heading">
                {TITLES[tool]}
              </h2>
              {tool === 'link' && (
                <input className="tool-input" type="text" value={text} readOnly aria-labelledby="check-it-heading" />
              )}
              {tool === 'message' && (
                <textarea className="tool-input" value={text} rows={6} readOnly aria-labelledby="check-it-heading" />
              )}
              <div className="tool-actions">
                <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
                  <ScanIcon />
                  Check it
                </button>
              </div>
            </div>
          </div>
          <div className="scenario-buddy">
            <Buddy mood="happy" messages={scenario.checkIt.buddy} />
          </div>
        </main>
      )}

      {stage === 'checking' && (
        <main className="tool-main">
          <Checking onDone={() => setStage('result')} ms={tool === 'link' ? 1500 : 3000} />
        </main>
      )}

      {stage === 'result' && (
        <main className="tool-main screen-enter">
          <ResultView
            subject={tool === 'picture' ? picture : <MarkedText text={text} clues={result.clues} className={`checked-${tool}`} />}
            result={result}
            actions={
              <button className="tool-button tool-button-main" type="button" onClick={onContinue}>
                See what happens
              </button>
            }
          />
        </main>
      )}
    </div>
  )
}
