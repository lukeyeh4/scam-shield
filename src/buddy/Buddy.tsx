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
// bottom, and the older ones curve away round the wheel, getting smaller and
// fainter, tucked behind the one in front. Scrolling turns the wheel, so any
// bubble can be brought round to the front.
// The wheel's radius in px: smaller curves away faster
const WHEEL_RADIUS = 240
// Bubbles further round than this (in radians) are out of sight
const WHEEL_LIMIT = 1.5

function turnWheel(scroller: HTMLElement) {
  // Layout positions (not the bubbles' tilted ones), relative to the scrolling box
  const front = scroller.scrollTop + scroller.clientHeight - parseFloat(getComputedStyle(scroller).paddingBottom)
  scroller.querySelectorAll<HTMLElement>('.buddy-row').forEach((row) => {
    // How far the bubble is from the front, along the wheel (negative: below it, when scrolled up)
    const distance = front - row.offsetTop - row.offsetHeight
    const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, distance / WHEEL_RADIUS))
    // Seen from the front, a bubble that far round the wheel is only this far from the front
    const shift = distance - WHEEL_RADIUS * Math.sin(angle)
    const depth = 1 - Math.cos(angle) // 0 at the front, 1 at the top of the wheel
    row.style.transform = `perspective(600px) translateY(${shift}px) rotateX(${angle}rad) scale(${1 - depth * 0.15})`
    row.style.setProperty('--fade', String(Math.min(0.85, depth * 1.5)))
    row.style.opacity = String(Math.max(0, Math.min(1, (WHEEL_LIMIT - Math.abs(angle)) / 0.25)))
    // The bubble nearest the front is drawn on top
    row.style.zIndex = String(1000 - Math.round(Math.abs(distance)))
  })
}

// Leaves room above the first bubble so it too can be scrolled round to the front,
// once there are more bubbles than fit
function makeRoomAtTop(scroller: HTMLElement, track: HTMLElement) {
  const first = track.firstElementChild as HTMLElement | null
  const style = getComputedStyle(scroller)
  const space = scroller.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
  const room = parseFloat(track.style.paddingTop) || 0
  const overflows = track.offsetHeight - room > space
  const wanted = first && overflows ? Math.max(0, space - first.offsetHeight) : 0
  if (Math.abs(wanted - room) > 1) track.style.paddingTop = `${wanted}px`
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
    const track = scroller?.firstElementChild as HTMLElement | null
    if (!scroller || !track) return
    // Where this code last scrolled to, so its own scrolling isn't mistaken for the player's
    let scrolledTo = -1
    const follow = () => {
      makeRoomAtTop(scroller, track)
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
