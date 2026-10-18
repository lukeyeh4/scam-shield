import { type FormEvent, useEffect, useEffectEvent, useRef, useState } from 'react'
import { IMAGES } from '../buddy/moods'
import { useDots } from '../buddy/useDots'
import { readingPause, useTypewriter } from '../buddy/useTypewriter'
import { isFast } from '../dev/devSettings'
import { CameraIcon, CloseIcon, LinkIcon, MessageIcon, MicIcon, QuestionIcon, SendIcon } from '../icons'
import { canReadAloud } from '../readAloud'
import { OptionCard, type Tone } from '../screens/OptionCard'
import { useSetUp } from '../setup'
import { canTalk, listen, type ListenProblem, useTalkingAllowed } from '../voiceInput'
import { askBuddy, canAsk, useQuestionsAllowed } from './askBuddy'
import {
  ANSWERED,
  BACK_AFTER,
  buddySays,
  type ChatIcon,
  type ChatOption,
  findLink,
  replyTo,
  STEPS,
  type StepId,
  TOPIC_STEPS,
} from './script'
import { checkSinceChat, type Entry, forgetCheck, saveChat, savedChat } from './session'
import './chat.css'

// How Buddy's messages appear in the chat: 'dots' shows moving "typing" dots,
// then the whole message at once (chosen for the chat); 'typewriter' types each
// message out letter by letter, like the rest of the game.
const REVEAL = 'dots' as 'dots' | 'typewriter'
const useReveal = REVEAL === 'dots' ? useDots : useTypewriter

// The same icons and warm colours as the cards on the home screen
const ICONS: Record<ChatIcon, { Icon: typeof CameraIcon; tone: Tone }> = {
  picture: { Icon: CameraIcon, tone: 'orange' },
  message: { Icon: MessageIcon, tone: 'peach' },
  link: { Icon: LinkIcon, tone: 'gold' },
  question: { Icon: QuestionIcon, tone: 'amber' },
}

// What Buddy says on arriving at a step (the `turn`th time, for steps it says in turn)
function buddyLines(id: StepId, turn = 0): Entry[] {
  return buddySays(id, turn).map((text) => ({ from: 'buddy', text, mood: STEPS[id].mood }))
}

// Steps where Buddy has just asked what to check, so there's nothing to add
const ASKING: StepId[] = ['start', 'again', ...Object.values(BACK_AFTER)]

// Where the chat starts: Buddy's greeting the first time; after that, the chat so
// far (all showing at once) and Buddy carrying on: about what a check just found,
// or asking what to check next (unless it just asked)
function resume() {
  const chat = savedChat()
  if (!chat) return { step: 'start' as StepId, entries: buddyLines('start'), shown: 1, typedLink: undefined, backTurns: 0 }
  const risk = checkSinceChat()
  if (!risk && ASKING.includes(chat.step)) return { ...chat, shown: chat.entries.length }
  const next = risk ? BACK_AFTER[risk] : 'again'
  return {
    step: next,
    entries: [...chat.entries, ...buddyLines(next, chat.backTurns)],
    shown: chat.entries.length + 1,
    typedLink: chat.typedLink,
    backTurns: chat.backTurns + (risk ? 1 : 0),
  }
}

// Entries in a row from the same side, shown together like in a messaging app
function groupEntries(entries: Entry[]) {
  const groups: { from: Entry['from']; start: number; entries: Entry[] }[] = []
  entries.forEach((entry, i) => {
    const last = groups[groups.length - 1]
    if (last?.from === entry.from) last.entries.push(entry)
    else groups.push({ from: entry.from, start: i, entries: [entry] })
  })
  return groups
}

// What the box says when empty: normally, or after asking out loud didn't work
const PLACEHOLDERS: Record<ListenProblem | 'none', string> = {
  none: 'Type a question',
  unheard: "I didn't hear that. Try again, or type.",
  blocked: 'Ask a grown-up to let me use the mic.',
  failed: "I can't listen right now. Please type.",
}

type ChatScreenProps = {
  onBack: () => void
  // `link` is a link the player typed, to check straight away
  onLeave: (to: NonNullable<ChatOption['leave']>, link?: string) => void
}

// Ask Shield Buddy: a chat where Buddy helps check something that feels weird. The
// conversation carries on after leaving to check something (session.ts).
// Buddy's messages appear one at a time (typing dots, then the whole message); once
// it has finished, the answers slide up and the player taps one, or types a
// question in the box. With a grown-up's OK, the AI answers questions (askBuddy.ts),
// followed by a scripted line; otherwise Buddy's replies are scripted placeholders.
// Everything else Buddy says is in script.ts. With a grown-up's OK, the player can also
// tap the microphone and ask out loud: the words fill the box as they're heard,
// to check before sending (voiceInput.ts).
export function ChatScreen({ onBack, onLeave }: ChatScreenProps) {
  const [start] = useState(resume)
  const [step, setStep] = useState<StepId>(start.step)
  const [entries, setEntries] = useState<Entry[]>(start.entries)
  // How many entries are showing; the last one may still be typing
  const [shown, setShown] = useState(start.shown)
  const [hurried, setHurried] = useState(-1)
  // What the player is typing in the box, and the last link they typed
  const [draft, setDraft] = useState('')
  const [typedLink, setTypedLink] = useState(start.typedLink)
  // Nothing is sent anywhere (to the AI, or to the browser's speech service) until a
  // grown-up has finished setup (setup.ts)
  const setUp = useSetUp()
  // Asking out loud: whether a grown-up allows it, whether it's listening now (and how
  // to stop), and what went wrong last time, to say in the box
  const talkingAllowed = useTalkingAllowed() && setUp
  const [stopListening, setStopListening] = useState<(() => void) | null>(null)
  const [listenProblem, setListenProblem] = useState<ListenProblem>()
  // Asking the AI: whether a grown-up allows it, and whether Buddy is working on an answer
  const questionsAllowed = useQuestionsAllowed()
  const [waiting, setWaiting] = useState(false)

  // Keep the conversation for coming back, and Buddy has now talked about the last check
  useEffect(() => forgetCheck(), [])
  useEffect(() => saveChat({ step, entries, typedLink, backTurns: start.backTurns }), [step, entries, typedLink, start.backTurns])

  const latest = entries[shown - 1]
  const latestText = latest.from === 'buddy' ? latest.text : ''
  const typed = useReveal(latestText, hurried === shown - 1)
  const done = latest.from === 'kid' || typed === latestText
  const ready = done && shown === entries.length && !waiting

  // Shows the next entry once the last has finished, after a pause to read it
  useEffect(() => {
    if (!done || shown >= entries.length) return
    // DEV CONSOLE: fast mode skips the waits
    const wait = isFast() ? 0 : latest.from === 'kid' ? 600 : readingPause(latest.text)
    const timer = setTimeout(() => setShown(shown + 1), wait)
    return () => clearTimeout(timer)
  }, [done, shown, entries.length, latest])

  // Tapping anywhere except a button hurries Buddy along, as in the game
  const hurry = useEffectEvent(() => {
    if (!done) setHurried(shown - 1)
    else if (shown < entries.length) setShown(shown + 1)
  })
  useEffect(() => {
    const onTap = (e: MouseEvent) => {
      if ((e.target as Element).closest('button, a, input, select, label, .dev-console')) return
      hurry()
    }
    document.addEventListener('click', onTap)
    return () => document.removeEventListener('click', onTap)
  }, [])

  // Keep the newest message in view as messages arrive and grow (and as the answers
  // appear below), unless the player has scrolled up to read older ones
  const logRef = useRef<HTMLDivElement>(null)
  const following = useRef(true)
  useEffect(() => {
    const log = logRef.current
    const track = log?.firstElementChild
    if (!log || !track) return
    // Only scrolling up means the player is reading older messages; anything else
    // (this code following the newest message, or messages growing) keeps following
    let lastTop = log.scrollTop
    const follow = () => {
      if (following.current) log.scrollTop = log.scrollHeight
      lastTop = log.scrollTop
    }
    const onScroll = () => {
      const top = log.scrollTop
      if (log.scrollHeight - top - log.clientHeight < 8) following.current = true
      else if (top < lastTop - 1) following.current = false
      lastTop = top
    }
    const observer = new ResizeObserver(follow)
    observer.observe(track)
    observer.observe(log)
    log.addEventListener('scroll', onScroll, { passive: true })
    follow()
    return () => {
      observer.disconnect()
      log.removeEventListener('scroll', onScroll)
    }
  }, [])

  // The player says something (a tapped answer or a typed question), and Buddy
  // replies with the lines for `next`. Anything Buddy hadn't finished saying shows
  // at once, so the player's message comes straight after it.
  const say = (text: string, next: StepId) => {
    setStep(next)
    setEntries([...entries, { from: 'kid', text }, ...buddyLines(next)])
    setShown(entries.length + 1)
    following.current = true
  }

  const choose = (option: ChatOption) => {
    if (option.leave) return onLeave(option.leave, option.leave === 'link' && step === 'typedLink' ? typedLink : undefined)
    if (option.next) say(option.label, option.next)
  }

  // Stop listening when leaving the chat
  const stopOnLeave = useEffectEvent(() => stopListening?.())
  useEffect(() => () => stopOnLeave(), [])

  const toggleListening = () => {
    if (stopListening) return stopListening()
    if (!talkingAllowed) return
    if (canReadAloud) speechSynthesis.cancel() // so the microphone doesn't hear Buddy
    setListenProblem(undefined)
    const before = draft.trim()
    const stop = listen(
      (words) => setDraft(before ? `${before} ${words}` : words),
      (problem) => {
        setStopListening(null)
        setListenProblem(problem)
      },
    )
    setStopListening(() => stop)
  }

  // A typed (or said) question. A link goes to the link checker, and personal
  // details or something upsetting get Buddy's scripted lines (never sent);
  // anything else is answered by the AI when allowed, with Buddy's typing dots
  // while it works. The AI's own words are only shown for questions about scams
  // and staying safe; other kinds get scripted lines too (TOPIC_STEPS).
  const send = async (e: FormEvent) => {
    e.preventDefault()
    stopListening?.()
    const text = draft.trim()
    if (!text || waiting) return
    setTypedLink(findLink(text))
    setDraft('')
    const scripted = replyTo(text)
    if (scripted !== 'typed' || !canAsk(setUp, questionsAllowed)) return say(text, scripted)

    const asked: Entry[] = [...entries, { from: 'kid', text }]
    setEntries(asked)
    setShown(asked.length)
    following.current = true
    setWaiting(true)
    const answer = await askBuddy(asked)
    setWaiting(false)
    const safety = answer?.topic === 'safety'
    const next = !answer ? 'askFailed' : safety ? ANSWERED[answer.offer] : TOPIC_STEPS[answer.topic as keyof typeof TOPIC_STEPS]
    // Which time the player has asked, so the line after the answer varies
    const turn = asked.filter((entry) => entry.from === 'kid').length - 1
    const said: Entry[] = safety ? answer.lines.map((line) => ({ from: 'buddy', text: line, mood: answer.mood })) : []
    setStep(next)
    setEntries([...asked, ...said, ...buddyLines(next, turn)])
  }

  const groups = groupEntries(entries.slice(0, shown))

  return (
    <div className="ask">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">Ask Shield Buddy</h1>
      </header>

      <div ref={logRef} className="ask-log" role="log" aria-live="polite">
        <div className="ask-track">
          {groups.map((group, g) => {
            const isLatestGroup = g === groups.length - 1
            if (group.from === 'kid') {
              return (
                <div key={group.start} className="ask-group ask-group-kid">
                  {group.entries.map((entry, i) => (
                    <p key={i} className="ask-bubble ask-bubble-kid">
                      <span className="sr-only">You: </span>
                      {entry.text}
                    </p>
                  ))}
                </div>
              )
            }
            const last = group.entries[group.entries.length - 1] as Extract<Entry, { from: 'buddy' }>
            return (
              <div key={group.start} className="ask-group ask-group-buddy">
                <span className={isLatestGroup && !ready ? 'buddy-body is-talking' : 'buddy-body'}>
                  {/* A new key for each message, so the mood's move plays again */}
                  <img
                    key={isLatestGroup ? `${last.mood}-${shown}` : last.mood}
                    className={isLatestGroup ? `ask-avatar buddy-move-${last.mood}` : 'ask-avatar'}
                    src={IMAGES[last.mood]}
                    alt=""
                  />
                </span>
                <div className="ask-bubbles">
                  {group.entries.map((entry, i) => {
                    const isTyping = group.start + i === shown - 1 && !done
                    // The moving dots, until the whole message appears (see REVEAL)
                    if (REVEAL === 'dots' && isTyping) {
                      return (
                        <p key={`${i}-dots`} className="ask-bubble ask-bubble-buddy ask-dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </p>
                      )
                    }
                    return (
                      <p key={i} className="ask-bubble ask-bubble-buddy">
                        <span className="sr-only">Shield Buddy: {entry.text}</span>
                        {/* The hidden full text holds the bubble at its final size while it types */}
                        <span className="buddy-text-full" aria-hidden="true">
                          {entry.text}
                        </span>
                        <span className="buddy-text-typed" aria-hidden="true">
                          {isTyping ? typed : entry.text}
                        </span>
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {/* Buddy working on an answer to a question */}
          {waiting && shown === entries.length && (
            <div className="ask-group ask-group-buddy">
              <span className="buddy-body is-talking">
                <img className="ask-avatar buddy-move-thinking" src={IMAGES.thinking} alt="" />
              </span>
              <div className="ask-bubbles">
                <span className="sr-only">Shield Buddy is thinking</span>
                <p className="ask-bubble ask-bubble-buddy ask-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ask-dock">
        {ready && (
          <div
            key={shown}
            className={STEPS[step].options.length === 1 ? 'ask-options is-single' : 'ask-options'}
            role="group"
            aria-label="Your answer"
          >
            {STEPS[step].options.map((option) => {
              const look = option.icon && ICONS[option.icon]
              return (
                <OptionCard
                  key={option.label}
                  title={option.label}
                  icon={look && <look.Icon />}
                  tone={look ? look.tone : undefined}
                  onClick={() => choose(option)}
                />
              )
            })}
            {/* Picked the wrong thing: go back and pick again */}
            {STEPS[step].undo && (
              <button className="ask-undo" type="button" aria-label="Pick something else" onClick={() => say('Something else', STEPS[step].undo!)}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Lights up when Buddy says to ask it down here */}
        <form className={ready && STEPS[step].pointAtBox ? 'ask-compose is-pointed' : 'ask-compose'} onSubmit={send}>
          <label className="sr-only" htmlFor="ask-question">
            Type a question
          </label>
          <input
            id="ask-question"
            type="text"
            placeholder={stopListening ? 'Listening…' : PLACEHOLDERS[listenProblem ?? 'none']}
            autoComplete="off"
            maxLength={300}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setListenProblem(undefined)
            }}
          />
          {/* Ask out loud instead of typing; turned off until a grown-up allows it,
              and not shown in browsers that can't listen */}
          {canTalk && (
            <button
              className={stopListening ? 'ask-mic is-listening' : 'ask-mic'}
              type="button"
              disabled={!talkingAllowed}
              aria-pressed={!!stopListening}
              aria-label={stopListening ? 'Stop listening' : 'Talk to Shield Buddy'}
              onClick={toggleListening}
            >
              <MicIcon />
            </button>
          )}
          <button className="ask-send" type="submit" disabled={!draft.trim() || waiting} aria-label="Send">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  )
}
