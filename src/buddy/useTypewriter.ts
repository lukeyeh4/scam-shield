import { useEffect, useState } from 'react'
import { reduceMotion } from '../motion'

// How long each character takes to appear, at a pace a young reader can follow
const CHAR_MS = 50

// Time to read a message once it has finished typing, before the next one appears:
// longer messages get longer
export const readingPause = (message: string) => Math.min(3500, 1000 + 80 * message.split(/\s+/).length)

// Short breaths after punctuation, like when someone reads aloud
const pauseAfter = (char: string) => ('.!?…'.includes(char) ? 450 : ',;:'.includes(char) ? 200 : 0)

// Reveals `text` one character at a time, starting over whenever the text changes.
// Shows it all at once when `finished` (e.g. the player tapped to hurry it along),
// or if the player has asked their device for reduced motion.
export function useTypewriter(text: string, finished = false) {
  const chars = Array.from(text) // keeps emoji in one piece
  const [progress, setProgress] = useState({ text, shown: 0 })
  const shown = progress.text === text ? progress.shown : 0
  const instant = finished || reduceMotion()
  const last = chars[shown - 1] ?? ''

  useEffect(() => {
    if (instant || shown >= chars.length) return
    const timer = setTimeout(() => setProgress({ text, shown: shown + 1 }), CHAR_MS + pauseAfter(last))
    return () => clearTimeout(timer)
  }, [text, shown, chars.length, instant, last])

  return instant ? text : chars.slice(0, shown).join('')
}
