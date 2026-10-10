import { useState } from 'react'
import { Buddy } from '../buddy/Buddy'
import { CameraIcon, ImageIcon, ScanIcon } from '../icons'
import { Mockup } from '../mockups/Mockup'
import { examplePicture, pictureMarks, pictureResult } from './examples'
import { ResultView } from './Result'
import { Checking, ToolScreen, type ToolNav } from './ToolScreen'

type Stage = 'choose' | 'check' | 'checking' | 'result'
const STEP: Record<Stage, number> = { choose: 0, check: 1, checking: 1, result: 2 }

// Check a picture, the main tool (a wireframe: any choice uses the example picture).
// Choose a photo or screenshot, make sure it's the right one, then see the result.
export function PictureCheck({ onHome, onTell, onAsk }: ToolNav) {
  const [stage, setStage] = useState<Stage>('choose')
  const back = () => (stage === 'choose' ? onHome() : setStage(stage === 'result' ? 'check' : 'choose'))

  return (
    <ToolScreen title="Check a picture" steps={['Choose', 'Check', 'Result']} step={STEP[stage]} onBack={back}>
      {stage === 'choose' && (
        <div className="tool-column">
          <Buddy mood="curious" messages={['Show me the thing that feels weird. A screenshot or a photo works.']} />
          <div className="tool-choices">
            <button className="tool-choice" type="button" onClick={() => setStage('check')}>
              <span className="tool-choice-icon">
                <ImageIcon />
              </span>
              <span className="tool-choice-label">Choose a screenshot</span>
              <span className="tool-choice-hint">From your photos</span>
            </button>
            <button className="tool-choice" type="button" onClick={() => setStage('check')}>
              <span className="tool-choice-icon">
                <CameraIcon />
              </span>
              <span className="tool-choice-label">Take a photo</span>
              <span className="tool-choice-hint">Use the camera</span>
            </button>
          </div>
          <details className="tool-tip">
            <summary>How do I take a screenshot?</summary>
            <p>On an iPad or iPhone: press the top button and the volume up button at the same time.</p>
            <p>On most Android phones and tablets: press the power button and the volume down button together.</p>
          </details>
        </div>
      )}

      {stage === 'check' && examplePicture && (
        <div className="tool-split">
          <div className="tool-picture">
            <Mockup screen={examplePicture} animate={false} />
          </div>
          <div className="tool-column">
            <h2 className="tool-heading">Is this the right picture?</h2>
            <p className="tool-text">Your picture is only used for this check.</p>
            <div className="tool-actions">
              <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
                <ScanIcon />
                Check this picture
              </button>
              <button className="tool-button" type="button" onClick={() => setStage('choose')}>
                Choose a different one
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'checking' && <Checking onDone={() => setStage('result')} />}

      {stage === 'result' && examplePicture && (
        <ResultView
          subject={
            <div className="tool-picture">
              <Mockup screen={examplePicture} marks={pictureMarks.map((m) => ({ ...m, state: 'seen' }))} animate={false} />
            </div>
          }
          result={pictureResult}
          onTell={onTell}
          onAgain={onAsk}
          onDone={onHome}
        />
      )}
    </ToolScreen>
  )
}
