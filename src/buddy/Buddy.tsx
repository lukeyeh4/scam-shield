import { useEffect, useState } from 'react'
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
// each typing out under the last. Give it a new `key` to start over.
export function Buddy({ mood, messages, delayMs = 0, onDone }: BuddyProps) {
  const [count, setCount] = useState(delayMs > 0 ? 0 : 1)
  const latest = messages[count - 1] ?? ''
  const typed = useTypewriter(latest)
  const done = typed === latest

  useEffect(() => {
    if (!done || count >= messages.length) return
    // DEV CONSOLE: fast mode skips the waits
    const wait = isFast() ? 0 : count === 0 ? delayMs : NEXT_MESSAGE_DELAY_MS
    const timer = setTimeout(() => setCount((c) => c + 1), wait)
    return () => clearTimeout(timer)
  }, [done, count, messages.length, delayMs])

  const allDone = done && count === messages.length
  useEffect(() => {
    if (allDone) onDone?.()
  }, [allDone, onDone])

  return (
    <div className="buddy">
      <img className="buddy-image" src={IMAGES[mood]} alt={`Shield Buddy looking ${mood}`} />
      <div className="buddy-messages" aria-live="polite">
        {messages.slice(0, count).map((message, i) => {
          const isLatest = i === count - 1
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
  )
}
