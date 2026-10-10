import { useState } from 'react'
import { CameraIcon, ImageIcon, ScanIcon } from '../icons'
import { Mockup } from '../mockups/Mockup'
import { examplePicture, pictureMarks, pictureResult } from './examples'
import { ResultView } from './Result'
import { Checking, ToolScreen, type ToolNav } from './ToolScreen'

type Stage = 'choose' | 'check' | 'checking' | 'result'
const STEP: Record<Stage, number> = { choose: 0, check: 1, checking: 1, result: 2 }

// Check a picture, the main tool (a wireframe: any choice uses the example picture).
// Choose a photo or screenshot, make sure it's the right one, then see the result.
export function PictureCheck({ onHome, onAsk }: ToolNav) {
  const [stage, setStage] = useState<Stage>('choose')
  const back = () => (stage === 'choose' ? onHome() : setStage(stage === 'result' ? 'check' : 'choose'))

  return (
    <ToolScreen title="Check a picture" steps={3} step={STEP[stage]} onBack={back}>
      {stage === 'choose' && (
        <div className="tool-column">
          <h2 className="tool-heading">Send a screenshot or photo</h2>
          <div className="tool-actions">
            <button className="tool-button tool-button-main" type="button" onClick={() => setStage('check')}>
              <ImageIcon />
              Choose a screenshot
            </button>
            <button className="tool-button" type="button" onClick={() => setStage('check')}>
              <CameraIcon />
              Take a photo
            </button>
          </div>
          <details className="tool-tip">
            <summary>How do I take a screenshot?</summary>
            <p>Press the top button and the volume up button at the same time.</p>
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
            <div className="tool-actions">
              <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
                <ScanIcon />
                Check it
              </button>
              <button className="tool-text-button" type="button" onClick={() => setStage('choose')}>
                Choose another
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
          onAgain={onAsk}
          onDone={onHome}
        />
      )}
    </ToolScreen>
  )
}
