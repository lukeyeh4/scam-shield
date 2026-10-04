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

// The speech bubbles sit on a wheel seen from the front: the newest is flat at the
// bottom, and each older one tilts back, shrinks, fades and tucks under the one
// after it. Scrolling up turns the wheel, so older bubbles come back to the front.
// How far (in px) from the bottom a bubble counts as one step around the wheel
const WHEEL_STEP_PX = 80

function turnWheel(scroller: HTMLElement) {
  // Layout positions (not the bubbles' tilted ones), relative to the scrolling box
  const front = scroller.scrollTop + scroller.clientHeight - parseFloat(getComputedStyle(scroller).paddingBottom)
  const rows = Array.from(scroller.querySelectorAll<HTMLElement>('.buddy-row'))
  rows.forEach((row, i) => {
    // 0 at the front; 1, 2... further back (negative: below the front, when scrolled up)
    const steps = Math.max(-2.5, Math.min(2.5, (front - row.offsetTop - row.offsetHeight) / WHEEL_STEP_PX))
    const away = Math.abs(steps)
    row.style.transform =
      `perspective(600px) translateY(${steps * 22}px) rotateX(${steps * 18}deg) scale(${1 - away * 0.07})`
    row.style.opacity = String(Math.max(0.15, 1 - away * 0.35))
    row.style.zIndex = String(i)
  })
}

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
      if (atBottom.current) {
        scroller.scrollTop = scroller.scrollHeight
        scrolledTo = scroller.scrollTop
      }
      turnWheel(scroller)
    }
    const onScroll = () => {
      if (Math.abs(scroller.scrollTop - scrolledTo) > 1) {
        atBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 8
      }
      turnWheel(scroller)
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
      <img className="buddy-image" src={IMAGES[mood]} alt={`Shield Buddy looking ${mood}`} />
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
