import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { CameraIcon, ImageIcon, ScanIcon } from '../icons'
import { useSetUp } from '../setup'
import { inPictureOrder } from './examples'
import { lookUpPicture, type PictureCheck as PictureResult, pictureResult } from './pictureLookup'
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
import { MarkedPicture, ResultView } from './Result'
import { Checking, SetupFirst, ToolScreen, type ToolNav } from './ToolScreen'

type Stage = 'choose' | 'check' | 'checking'
const STEP: Record<Stage, number> = { choose: 0, check: 1, checking: 2 }

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
// The picture is sent to our server, which has Claude look for warning signs
// (pictureLookup.ts).
export function PictureCheck({ onHome, onAsk, onSetUp }: ToolNav) {
  const setUp = useSetUp()
  const [stage, setStage] = useState<Stage>('choose')
  const [result, setResult] = useState<PictureResult | null>(null)
  // The result shows once "Checking" has had its moment and the server has answered
  const [waited, setWaited] = useState(false)
  // Only the newest check's answer counts, if the player goes back and checks again
  const latestCheck = useRef(0)
  const [picture, setPicture] = useState<PreparedPicture | null>(null)
  // A picture shared to the app (or handed over from elsewhere) opens straight away
  const [received] = useState(() => (setUp ? takeReceivedPicture() : null))
  const [problem, setProblem] = useState<PictureProblem | null>(null)
  const [preparing, setPreparing] = useState(received !== null)
  const [dragging, setDragging] = useState(false)
  const back = () => (stage === 'choose' ? onHome() : setStage(stage === 'checking' ? 'check' : 'choose'))

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

  // Sends the picture, and turns the answer into the result
  const check = () => {
    if (!picture) return
    const id = ++latestCheck.current
    setResult(null)
    setWaited(false)
    setStage('checking')
    void lookUpPicture(picture)
      .then(pictureResult)
      .then((checked) => {
        if (id === latestCheck.current) setResult(checked)
      })
  }
  const showResult = stage === 'checking' && waited && result !== null
  // Numbered in the order they come down the picture
  const shown = result && inPictureOrder(result)

  if (!setUp) return <SetupFirst title="Check a picture" what="pictures" onHome={onHome} onSetUp={onSetUp} />

  return (
    // (Pictures are really checked, so no preview note)
    <ToolScreen title="Check a picture" steps={showResult ? undefined : 3} step={STEP[stage]} onBack={back} note={null}>
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
                <button className="tool-button tool-button-main" type="button" onClick={check}>
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

        {stage === 'checking' && !showResult && <Checking onDone={() => setWaited(true)} ms={1500} />}

        {showResult && picture && shown && (
          <ResultView
            subject={(picked) => (
              <div className="tool-picture">
                <MarkedPicture src={picture.url} clues={shown.clues} picked={picked} />
              </div>
            )}
            result={shown}
            onAgain={onAsk}
            onDone={onHome}
          />
        )}
      </div>
    </ToolScreen>
  )
}
