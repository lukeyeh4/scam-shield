import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { CameraIcon, ImageIcon, ScanIcon } from '../icons'
import { Mockup } from '../mockups/Mockup'
import { useSetUp } from '../setup'
import { examplePicture, pictureMarks, pictureResult } from './examples'
import {
  canTakePhoto,
  forgetPicture,
  pickPicture,
  type PictureProblem,
  type PictureSource,
  type PreparedPicture,
  preparePicture,
  takeReceivedPicture,
} from './picturePicker'
import { ResultView } from './Result'
import { Checking, SetupFirst, ToolScreen, type ToolNav } from './ToolScreen'

type Stage = 'choose' | 'check' | 'checking' | 'result'
const STEP: Record<Stage, number> = { choose: 0, check: 1, checking: 1, result: 2 }

// What to say when a picture can't be used
const PROBLEMS: Record<PictureProblem, string> = {
  notAPicture: "That isn't a picture. Try a screenshot or a photo.",
  unreadable: "I couldn't open that picture. Try another one.",
  tooBig: 'That picture is too big. Try a screenshot instead.',
}

// How to take a screenshot, for the device being used
const SCREENSHOT_TIP = !canTakePhoto
  ? 'Take the screenshot, then drag it here or paste it.'
  : /android/i.test(navigator.userAgent)
    ? 'Press the power button and the volume down button at the same time.'
    : 'Press the top button and the volume up button at the same time. If there is a Home button, press the top button and Home.'

// The first image in something pasted or dropped
const imageIn = (files: FileList | null | undefined) => [...(files ?? [])].find((f) => f.type.startsWith('image/')) ?? null

// Check a picture, the main tool. Choose a screenshot or photo (or paste or drag
// one in; in the app, share one to Scam Shield: picturePicker.ts), make sure it's
// the right one, then see the result. Pictures will be sent to be checked, so a
// grown-up has to finish setup first.
// The picture is really chosen and prepared; the check itself is still a wireframe
// (the result is the example).
export function PictureCheck({ onHome, onAsk, onSetUp }: ToolNav) {
  const setUp = useSetUp()
  const [stage, setStage] = useState<Stage>('choose')
  const [picture, setPicture] = useState<PreparedPicture | null>(null)
  // A picture shared to the app (or handed over from elsewhere) opens straight away
  const [received] = useState(() => (setUp ? takeReceivedPicture() : null))
  const [problem, setProblem] = useState<PictureProblem | null>(null)
  const [preparing, setPreparing] = useState(received !== null)
  const [dragging, setDragging] = useState(false)
  const back = () => (stage === 'choose' ? onHome() : setStage(stage === 'result' ? 'check' : 'choose'))

  // Shows a picture once it's ready (or why it can't be used)
  const show = (prepared: PreparedPicture | PictureProblem) => {
    setPreparing(false)
    if (typeof prepared === 'string') return setProblem(prepared)
    setPicture((old) => {
      forgetPicture(old)
      return prepared
    })
    setStage('check')
  }
  // ...from the picker, or pasted or dropped in
  const takePicture = (chosen: Blob | null) => {
    if (!chosen) return
    setProblem(null)
    setPreparing(true)
    void preparePicture(chosen).then(show)
  }
  const choose = async (source: PictureSource) => takePicture(await pickPicture(source))

  const showReceived = useEffectEvent(show)
  useEffect(() => {
    if (received) void preparePicture(received).then(showReceived)
  }, [received])

  // The picture is let go when leaving
  const current = useRef(picture)
  useEffect(() => {
    current.current = picture
  }, [picture])
  useEffect(() => () => forgetPicture(current.current), [])

  // Pasting (Cmd+V or Ctrl+V) or dropping a picture anywhere on the page works on
  // the first two steps. (Dropping is always caught here, so a picture dropped by
  // mistake never opens in place of the app.)
  const takesPictures = setUp && (stage === 'choose' || stage === 'check')
  const onPaste = useEffectEvent((e: ClipboardEvent) => {
    const image = imageIn(e.clipboardData?.files)
    if (!image || !takesPictures) return
    e.preventDefault()
    takePicture(image)
  })
  const onDrag = useEffectEvent((e: DragEvent) => {
    e.preventDefault()
    if (e.type === 'dragover') return setDragging(takesPictures)
    setDragging(false)
    if (e.type === 'drop' && takesPictures) takePicture(imageIn(e.dataTransfer?.files))
  })
  useEffect(() => {
    const drag = (e: DragEvent) => onDrag(e)
    const paste = (e: ClipboardEvent) => onPaste(e)
    window.addEventListener('paste', paste)
    for (const type of ['dragover', 'dragleave', 'drop']) window.addEventListener(type, drag as EventListener)
    return () => {
      window.removeEventListener('paste', paste)
      for (const type of ['dragover', 'dragleave', 'drop']) window.removeEventListener(type, drag as EventListener)
    }
  }, [])

  if (!setUp) return <SetupFirst title="Check a picture" what="pictures" onHome={onHome} onSetUp={onSetUp} />

  return (
    <ToolScreen title="Check a picture" steps={3} step={STEP[stage]} onBack={back}>
      <div className={dragging ? 'picture-drop is-dragging' : 'picture-drop'}>
        {stage === 'choose' && (
          <div className="tool-column">
            <h2 className="tool-heading">Send a screenshot or photo</h2>
            <div className="tool-actions">
              <button className="tool-button tool-button-main" type="button" disabled={preparing} onClick={() => choose('library')}>
                <ImageIcon />
                Choose a screenshot
              </button>
              {canTakePhoto && (
                <button className="tool-button" type="button" disabled={preparing} onClick={() => choose('camera')}>
                  <CameraIcon />
                  Take a photo
                </button>
              )}
            </div>
            {preparing ? (
              <p className="tool-text" role="status">
                Getting your picture ready…
              </p>
            ) : problem ? (
              <p className="tool-problem" role="alert">
                {PROBLEMS[problem]}
              </p>
            ) : (
              !canTakePhoto && <p className="tool-text">Or drag a picture here, or paste one.</p>
            )}
            <details className="tool-tip">
              <summary>How do I take a screenshot?</summary>
              <p>{SCREENSHOT_TIP}</p>
            </details>
          </div>
        )}

        {stage === 'check' && picture && (
          <div className="tool-split">
            <div className="tool-picture">
              <img className="tool-photo" src={picture.url} alt="The picture you chose" />
            </div>
            <div className="tool-column">
              <h2 className="tool-heading">Is this the right picture?</h2>
              <div className="tool-actions">
                <button className="tool-button tool-button-main" type="button" onClick={() => setStage('checking')}>
                  <ScanIcon />
                  Check it
                </button>
                <button className="tool-text-button" type="button" disabled={preparing} onClick={() => choose('library')}>
                  Choose another
                </button>
              </div>
              {problem && (
                <p className="tool-problem" role="alert">
                  {PROBLEMS[problem]}
                </p>
              )}
            </div>
          </div>
        )}

        {stage === 'checking' && <Checking onDone={() => setStage('result')} />}

        {/* Still the example result: the real check comes next (step 2 in PROJECT.md) */}
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
      </div>
    </ToolScreen>
  )
}
