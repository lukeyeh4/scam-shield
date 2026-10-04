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

// The speech bubbles: the two newest sit stacked one above the other, both fully
// visible. Older cards slide behind the upper one and fade, with just the third
// peeking out. Scrolling up brings older cards back down into the front two.
// How far (px) a faded card tucks under the top of the card in front of it
const CARD_TUCK = 20

const between = (a: number, b: number, t: number) => a + (b - a) * t

function stackCards(scroller: HTMLElement) {
  const rows = Array.from(scroller.querySelectorAll<HTMLElement>('.buddy-row'))
  if (rows.length === 0) return
  // The front line, in layout positions relative to the scrolling box
  const front = scroller.scrollTop + scroller.clientHeight - parseFloat(getComputedStyle(scroller).paddingBottom)
  const bottoms = rows.map((row) => row.offsetTop + row.offsetHeight)

  // Which card is at the front (the bottom one): a whole number when scrolling has
  // settled, in between while moving from one card to the next
  let at = 0
  if (front >= bottoms[bottoms.length - 1]) at = rows.length - 1
  else if (front > bottoms[0]) {
    const i = bottoms.findIndex((b) => b > front) - 1
    at = i + (front - bottoms[i]) / (bottoms[i + 1] - bottoms[i])
  }

  // Newest first, so each card can tuck behind where the next one ended up
  const tops: number[] = []
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const behind = at - i // 0 at the front, 1 just above it; negative: newer, below the front
    let top = row.offsetTop
    let fade = 0
    let opacity = 1
    if (behind > 1) {
      // From the third card on: slide behind the card after it and fade
      const tucked = tops[i + 1] + CARD_TUCK - row.offsetHeight
      const t = Math.min(1, behind - 1)
      top = between(row.offsetTop, tucked, t)
      fade = 0.5 * t
      opacity = Math.max(0, Math.min(1, 3 - behind))
    }
    tops[i] = top
    const scale = 1 - 0.04 * Math.max(0, Math.min(1, behind - 1))
    // The card inside moves, not the row, so scrolling still snaps to where the rows really are
    const card = row.firstElementChild as HTMLElement
    card.style.transform = `translateY(${top - row.offsetTop}px) scale(${scale})`
    card.style.setProperty('--fade', String(fade))
    card.style.opacity = String(opacity)
    // Newer cards are on top of older ones
    row.style.zIndex = String(i)
  }
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
      stackCards(scroller)
    }
    const onScroll = () => {
      if (Math.abs(scroller.scrollTop - scrolledTo) > 1) {
        atBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 8
      }
      stackCards(scroller)
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
                <div className="buddy-card">
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
