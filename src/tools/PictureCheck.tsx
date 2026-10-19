import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { CameraIcon, CloseIcon, ImageIcon, ScanIcon } from '../icons'
import { askAbout } from '../chat/session'
import { useSetUp } from '../setup'
import { type CheckResult, inPictureOrder } from './examples'
import { contextFor, lookUpPicture, type Place, pictureResult } from './pictureLookup'
import { PlacePicker } from './PlacePicker'
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
import { ResultView, ZoomablePicture } from './Result'
import { Checking, SetupFirst, ToolScreen, type ToolNav } from './ToolScreen'

type Stage = 'choose' | 'check' | 'checking'
const STEP: Record<Stage, number> = { choose: 0, check: 1, checking: 2 }

// The most pictures checked together (the Worker takes up to 3)
const MAX_PICTURES = 3

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
// one in; in the app, share one to Scam Shield: picturePicker.ts), add up to two
// more of the same thing (e.g. a video's comments, or the shop it links to), make
// sure they're the right ones, then see the result. Pictures will be sent to be checked, so a
// grown-up has to finish setup first.
// The picture is sent to our server, which has Claude look for warning signs
// (pictureLookup.ts).
export function PictureCheck({ onHome, onAsk, onSetUp }: ToolNav) {
  const setUp = useSetUp()
  const [stage, setStage] = useState<Stage>('choose')
  const [result, setResult] = useState<CheckResult | null>(null)
  // The result shows once "Checking" has had its moment and the server has answered
  const [waited, setWaited] = useState(false)
  // Only the newest check's answer counts, if the player goes back and checks again
  const latestCheck = useRef(0)
  // Where the kid says the picture came from (optional), and what they typed
  const [place, setPlace] = useState<Place | null>(null)
  const [typed, setTyped] = useState('')
  const about = contextFor(place, typed)
  // The pictures to check together (up to MAX_PICTURES)
  const [pictures, setPictures] = useState<PreparedPicture[]>([])
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
    setPictures((old) => {
      if (old.length < MAX_PICTURES) return [...old, prepared]
      forgetPicture(prepared)
      return old
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

  // Taking one out (back to choosing if it was the last)
  const remove = (gone: PreparedPicture) => {
    forgetPicture(gone)
    const left = pictures.filter((p) => p !== gone)
    setPictures(left)
    if (!left.length) setStage('choose')
  }

  // The pictures are let go when leaving
  const current = useRef(pictures)
  useEffect(() => {
    current.current = pictures
  }, [pictures])
  useEffect(() => () => current.current.forEach(forgetPicture), [])

  // Pasting (Cmd+V or Ctrl+V) or dropping a picture anywhere on the page works on
  // the first two steps. (Dropping is always caught here, so a picture dropped by
  // mistake never opens in place of the app.)
  const takesPictures = setUp && (stage === 'choose' || stage === 'check') && pictures.length < MAX_PICTURES
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

  // Sends the pictures, and turns the answer into the result
  const check = () => {
    if (!pictures.length) return
    const id = ++latestCheck.current
    setResult(null)
    setWaited(false)
    setStage('checking')
    const { context, upset } = about
    void lookUpPicture(pictures, context)
      .then(pictureResult)
      // Something upsetting typed about it: a grown-up right now, whatever's in it
      .then((checked) => (upset ? { ...checked, risk: 'high' as const, urgent: true } : checked))
      .then((checked) => {
        if (id === latestCheck.current) setResult(checked)
      })
  }
  const showResult = stage === 'checking' && waited && result !== null
  // Numbered in the order they come down the picture
  const shown = result && inPictureOrder(result)

  if (!setUp) return <SetupFirst title="Check a picture" what="pictures" onHome={onHome} onSetUp={onSetUp} />

  return (
    // (The note under a result says an AI checked it: kids must be told, by
    // Anthropic's rules for apps used by minors)
    <ToolScreen
      title="Check a picture"
      steps={showResult ? undefined : 3}
      step={STEP[stage]}
      onBack={back}
      note={showResult ? 'Checked by AI, a computer program. It can make mistakes.' : null}
    >
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

        {stage === 'check' && pictures.length > 0 && (
          <div className="tool-split">
            <div className={`tool-picture picture-set count-${pictures.length}`}>
              {pictures.map((p, i) => (
                <div key={p.url} className="picture-set-item">
                  <img className="tool-photo" src={p.url} alt={`Picture ${i + 1} you chose`} />
                  <button className="picture-remove" type="button" onClick={() => remove(p)} aria-label={`Take out picture ${i + 1}`}>
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="tool-column">
              <h2 className="tool-heading">{pictures.length > 1 ? 'Are these the right pictures?' : 'Is this the right picture?'}</h2>
              {/* Where it came from helps the check (optional) */}
              <PlacePicker place={place} onPlace={setPlace} typed={typed} onTyped={setTyped} personal={about.personal} />
              <div className="tool-actions">
                <button className="tool-button tool-button-main" type="button" onClick={check}>
                  <ScanIcon />
                  Check it
                </button>
                {pictures.length < MAX_PICTURES && (
                  <button className="tool-button" type="button" disabled={preparing} onClick={() => choose('library')}>
                    <ImageIcon />
                    Add another screenshot
                  </button>
                )}
              </div>
              {pictures.length < MAX_PICTURES && (
                <p className="tool-text">You can add the comments or the shop page too.</p>
              )}
              {problem && (
                <p className="tool-problem" role="alert">
                  {PROBLEMS[problem]}
                </p>
              )}
            </div>
          </div>
        )}

        {stage === 'checking' && !showResult && <Checking onDone={() => setWaited(true)} ms={1500} />}

        {showResult && pictures.length > 0 && shown && (
          <ResultView
            subject={(picked) => (
              <div className="tool-picture picture-results">
                {/* Each picture with its own boxes (numbered across all of them). A
                    picture that may not be OK to look at is blurred, with no boxes */}
                {pictures.map((p, i) =>
                  shown.hidePicture ? (
                    <img key={p.url} className="tool-photo is-hidden" src={p.url} alt={`Picture ${i + 1}, hidden`} />
                  ) : (
                    <ZoomablePicture key={p.url} src={p.url} index={i} clues={shown.clues} picked={picked} />
                  ),
                )}
              </div>
            )}
            result={shown}
            onAgain={onAsk}
            onAskAbout={() => {
              askAbout(shown.clues.map((c) => c.label))
              onAsk()
            }}
            onDone={onHome}
          />
        )}
      </div>
    </ToolScreen>
  )
}
