import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import type { Mood } from '../types'
import { isFast } from '../dev/devSettings'
import { preloadVoice, speak, useReadAloud } from '../readAloud'
import { IMAGES } from './moods'
import { readingPause, useTypewriter } from './useTypewriter'

// A short breath between messages read aloud, since the player has just heard it
const SPOKEN_PAUSE = 600

type BuddyProps = {
  mood: Mood
  messages: string[]
  // Wait this long before the first message, e.g. until the scam has arrived
  delayMs?: number
  // Called once the last message has finished typing (and being read aloud)
  onDone?: () => void
}

// Shield Buddy with its speech bubbles beside it. Messages appear one at a time,
// each typing out under the last. Messages added to the end later (e.g. the next
// step of the recap) type out under the earlier ones, which stay. Give it a new
// `key` to start over.
// Tapping anywhere on the screen (except a button) hurries Buddy along: the first tap
// finishes the message being typed, the next skips the pause before the next message.
// With read-aloud on, each message appears whole and Buddy reads it out loud;
// the next one waits until it has finished. A tap stops the voice and goes straight
// to the next message, which is read from the start.
// Buddy moves to match its mood as each new message appears (e.g. a wobble when
// worried, a jump when cheering), bobs while it talks, and floats gently otherwise.
export function Buddy({ mood, messages, delayMs = 0, onDone }: BuddyProps) {
  const [count, setCount] = useState(delayMs > 0 ? 0 : 1)
  // Messages can also be taken away (e.g. going back a step in the recap)
  const shown = Math.min(count, messages.length)
  const latest = messages[shown - 1] ?? ''
  // The message the player tapped to finish typing straight away
  const [hurried, setHurried] = useState(-1)
  // DEV CONSOLE: fast mode doesn't read aloud
  const readAloud = useReadAloud() && !isFast()
  const typed = useTypewriter(latest, hurried === shown - 1 || readAloud)
  const done = typed === latest
  // The newest message Buddy has finished reading out loud (turning read-aloud on
  // part way through reads the latest message)
  const [said, setSaid] = useState(-1)
  const saying = shown - 1
  const finished = done && (!readAloud || said === saying)
  // When the latest message finished, so a message added much later doesn't wait
  const doneAt = useRef(0)

  useEffect(() => {
    if (!readAloud || saying < 0 || said === saying) return
    return speak(latest, () => setSaid(saying))
  }, [readAloud, saying, said, latest])

  // The next message's voice is fetched while this one is read, so it's ready to go
  const next = messages[shown]
  useEffect(() => {
    if (readAloud && next) preloadVoice(next)
  }, [readAloud, next])

  useEffect(() => {
    if (finished) doneAt.current = Date.now()
  }, [finished, latest])

  useEffect(() => {
    if (!finished || count >= messages.length) return
    const pause = Math.max(0, (readAloud ? SPOKEN_PAUSE : readingPause(latest)) - (Date.now() - doneAt.current))
    // DEV CONSOLE: fast mode skips the waits
    const wait = isFast() ? 0 : count === 0 ? delayMs : pause
    const timer = setTimeout(() => setCount((c) => c + 1), wait)
    return () => clearTimeout(timer)
  }, [finished, count, messages.length, delayMs, latest, readAloud])

  const hurry = useEffectEvent(() => {
    if (shown === 0) return
    if (!done) setHurried(shown - 1)
    else if (readAloud && said !== saying) {
      // Stop reading this message, and go straight on to the next (read from its start)
      setSaid(saying)
      if (shown < messages.length) setCount(shown + 1)
    } else if (shown < messages.length) setCount(shown + 1)
  })
  useEffect(() => {
    const onTap = (e: MouseEvent) => {
      // Buttons (and the like) do their own thing
      if ((e.target as Element).closest('button, a, input, select, label, .dev-console')) return
      hurry()
    }
    document.addEventListener('click', onTap)
    return () => document.removeEventListener('click', onTap)
  }, [])

  // Keep the newest bubble in view as bubbles arrive and grow, unless the player
  // has scrolled up to read older ones
  const scrollerRef = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  useLayoutEffect(() => {
    atBottom.current = true
  }, [shown])
  useEffect(() => {
    const scroller = scrollerRef.current
    const track = scroller?.firstElementChild
    if (!scroller || !track) return
    // Only scrolling up means the player is reading older bubbles; anything else
    // (this code following the newest bubble, or the browser nudging things as
    // bubbles grow) keeps following
    let lastTop = scroller.scrollTop
    const follow = () => {
      if (atBottom.current) scroller.scrollTop = scroller.scrollHeight
      lastTop = scroller.scrollTop
    }
    const onScroll = () => {
      const top = scroller.scrollTop
      if (scroller.scrollHeight - top - scroller.clientHeight < 8) atBottom.current = true
      else if (top < lastTop - 1) atBottom.current = false
      lastTop = top
    }
    const observer = new ResizeObserver(follow)
    observer.observe(track)
    observer.observe(scroller)
    scroller.addEventListener('scroll', onScroll, { passive: true })
    follow()
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  const allDone = finished && shown === messages.length
  useEffect(() => {
    if (allDone) onDone?.()
  }, [allDone, onDone])

  return (
    <div className="buddy">
      <span className={shown > 0 && !allDone ? 'buddy-body is-talking' : 'buddy-body'}>
        {/* A new key for each message, so the mood's move plays again */}
        <img
          key={`${mood}-${shown}`}
          className={shown > 0 ? `buddy-image buddy-move-${mood}` : 'buddy-image'}
          src={IMAGES[mood]}
          alt={`Shield Buddy looking ${mood}`}
        />
      </span>
      <div ref={scrollerRef} className="buddy-messages" aria-live="polite">
        <div className="buddy-track">
          {messages.slice(0, shown).map((message, i) => {
            const isLatest = i === shown - 1
            return (
              <div key={i} className={isLatest ? 'buddy-row' : 'buddy-row buddy-row-old'}>
                <p className="buddy-bubble">
                  {/* The hidden full text holds the bubble at its final size while it types */}
                  <span className="buddy-text-full" aria-hidden="true">
                    {message}
                  </span>
                  <span className="buddy-text-typed" aria-hidden="true">
                    {isLatest ? typed : message}
                  </span>
                  <span className="sr-only">{message}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
