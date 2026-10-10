import { type FormEvent, useEffect, useEffectEvent, useRef, useState } from 'react'
import { IMAGES } from '../buddy/moods'
import { useDots } from '../buddy/useDots'
import { readingPause, useTypewriter } from '../buddy/useTypewriter'
import { isFast } from '../dev/devSettings'
import { LinkIcon, MessageIcon, MicIcon, QuestionIcon, ScanIcon, SendIcon } from '../icons'
import type { Mood } from '../types'
import { type ChatIcon, type ChatOption, replyTo, STEPS, type StepId } from './script'
import './chat.css'

// EXPERIMENT: how Buddy's messages appear in the chat. 'dots' shows moving
// "typing" dots, then the whole message at once; 'typewriter' types each message
// out letter by letter, like the rest of the game. To undo, set it back to
// 'typewriter' (or delete this, useDots.ts and the .ask-dots styles).
const REVEAL = 'dots' as 'dots' | 'typewriter'
const useReveal = REVEAL === 'dots' ? useDots : useTypewriter

type Entry = { from: 'buddy'; text: string; mood: Mood } | { from: 'kid'; text: string }

const ICONS: Record<ChatIcon, typeof ScanIcon> = {
  picture: ScanIcon,
  link: LinkIcon,
  message: MessageIcon,
  question: QuestionIcon,
}

// What Buddy says on arriving at a step
function buddyLines(id: StepId): Entry[] {
  const step = STEPS[id]
  return step.buddy.map((text) => ({ from: 'buddy', text, mood: step.mood }))
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

type ChatScreenProps = {
  onBack: () => void
  onLeave: (to: NonNullable<ChatOption['leave']>) => void
}

// Ask Shield Buddy: a chat where Buddy helps check something that feels weird.
// Buddy's messages type out one at a time, like everywhere else in the game; once
// it has finished, the answers slide up and the player taps one, or types a
// question in the box (Buddy's replies are placeholders until the AI answers them).
// Everything Buddy says is in script.ts. Asking out loud is shown but not built yet.
export function ChatScreen({ onBack, onLeave }: ChatScreenProps) {
  const [step, setStep] = useState<StepId>('start')
  const [entries, setEntries] = useState<Entry[]>(() => buddyLines('start'))
  // How many entries are showing; the last one may still be typing
  const [shown, setShown] = useState(1)
  const [hurried, setHurried] = useState(-1)
  // What the player is typing in the box
  const [draft, setDraft] = useState('')

  const latest = entries[shown - 1]
  const latestText = latest.from === 'buddy' ? latest.text : ''
  const typed = useReveal(latestText, hurried === shown - 1)
  const done = latest.from === 'kid' || typed === latestText
  const ready = done && shown === entries.length

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
    if (option.leave) return onLeave(option.leave)
    if (option.next) say(option.label, option.next)
  }

  const send = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    say(text, replyTo(text))
    setDraft('')
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
                    // EXPERIMENT (REVEAL): the moving dots, until the whole message appears
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
        </div>
      </div>

      <div className="ask-dock">
        {ready && (
          <div key={shown} className="ask-options" role="group" aria-label="Your answer">
            {STEPS[step].options.map((option) => {
              const Icon = option.icon && ICONS[option.icon]
              return (
                <button
                  key={option.label}
                  className={Icon ? 'ask-option' : 'ask-option ask-option-plain'}
                  type="button"
                  onClick={() => choose(option)}
                >
                  {Icon && (
                    <span className="ask-option-icon">
                      <Icon />
                    </span>
                  )}
                  {option.label}
                </button>
              )
            })}
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
            placeholder="Type a question"
            autoComplete="off"
            maxLength={300}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {/* Voice input: ask out loud instead of typing (not built yet, see PROJECT.md) */}
          <button className="ask-mic" type="button" disabled aria-label="Talk to Shield Buddy">
            <MicIcon />
          </button>
          <button className="ask-send" type="submit" disabled={!draft.trim()} aria-label="Send">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  )
}
