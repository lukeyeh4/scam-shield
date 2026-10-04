import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Mood } from '../types'
import cheering from '../../shield_buddy/cheering.png'
import curious from '../../shield_buddy/curious.png'
import happy from '../../shield_buddy/happy.png'
import neutral from '../../shield_buddy/neutral.png'
import thinking from '../../shield_buddy/thinking.png'
import worried from '../../shield_buddy/worried.png'
import { isFast } from '../dev/devSettings'
import { useTypewriter } from './useTypewriter'

const IMAGES: Record<Mood, string> = { cheering, curious, happy, neutral, thinking, worried }

// Pause between one message finishing and the next one appearing
const NEXT_MESSAGE_DELAY_MS = 700

type BuddyProps = {
  mood: Mood
  messages: string[]
  // Wait this long before the first message, e.g. until the scam has arrived
  delayMs?: number
  // Called once the last message has finished typing
  onDone?: () => void
}

// Shield Buddy with its speech bubbles beside it. Messages appear one at a time,
// each typing out under the last. Messages added to the end later (e.g. the next
// step of the recap) type out under the earlier ones, which stay. Give it a new
// `key` to start over.
// Buddy moves to match its mood as each new message appears (e.g. a wobble when
// worried, a jump when cheering), bobs while it talks, and floats gently otherwise.
export function Buddy({ mood, messages, delayMs = 0, onDone }: BuddyProps) {
  const [count, setCount] = useState(delayMs > 0 ? 0 : 1)
  // Messages can also be taken away (e.g. going back a step in the recap)
  const shown = Math.min(count, messages.length)
  const latest = messages[shown - 1] ?? ''
  const typed = useTypewriter(latest)
  const done = typed === latest
  // When the latest message finished, so a message added much later doesn't wait
  const doneAt = useRef(0)

  useEffect(() => {
    if (done) doneAt.current = Date.now()
  }, [done, latest])

  useEffect(() => {
    if (!done || count >= messages.length) return
    const pause = Math.max(0, NEXT_MESSAGE_DELAY_MS - (Date.now() - doneAt.current))
    // DEV CONSOLE: fast mode skips the waits
    const wait = isFast() ? 0 : count === 0 ? delayMs : pause
    const timer = setTimeout(() => setCount((c) => c + 1), wait)
    return () => clearTimeout(timer)
  }, [done, count, messages.length, delayMs])

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
    // Where this code last scrolled to, so its own scrolling isn't mistaken for the player's
    let scrolledTo = -1
    const follow = () => {
      if (!atBottom.current) return
      scroller.scrollTop = scroller.scrollHeight
      scrolledTo = scroller.scrollTop
    }
    const onScroll = () => {
      if (Math.abs(scroller.scrollTop - scrolledTo) > 1) {
        atBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 8
      }
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

  const allDone = done && shown === messages.length
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
