import { useEffect, useState } from 'react'
import { reduceMotion } from '../motion'

// Reveals `text` one character at a time, starting over whenever the text changes.
// Shows it all at once if the player has asked their device for reduced motion.
export function useTypewriter(text: string, msPerChar = 35) {
  const chars = Array.from(text) // keeps emoji in one piece
  const [progress, setProgress] = useState({ text, shown: 0 })
  const shown = progress.text === text ? progress.shown : 0

  useEffect(() => {
    if (reduceMotion()) return
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = (p.text === text ? p.shown : 0) + 1
        if (next >= chars.length) clearInterval(timer)
        return { text, shown: next }
      })
    }, msPerChar)
    return () => clearInterval(timer)
  }, [text, chars.length, msPerChar])

  if (reduceMotion()) return text
  return chars.slice(0, shown).join('')
}
