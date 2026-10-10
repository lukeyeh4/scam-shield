import { useEffect, useState } from 'react'
import { reduceMotion } from '../motion'

// How long the "typing" dots show before a message appears: longer messages a
// little longer, like someone really typing
const dotsTime = (text: string) => Math.min(2000, 700 + 15 * text.length)

// The other way for Buddy's messages to appear (see REVEAL in ChatScreen): returns
// '' while the typing dots show, then the whole message at once. Same shape as
// useTypewriter, so the two can be swapped. Shows the message straight away when
// `finished` (the player tapped to hurry it along), or with reduced motion.
export function useDots(text: string, finished = false) {
  const [revealed, setRevealed] = useState('')
  const instant = finished || reduceMotion()

  useEffect(() => {
    if (instant || revealed === text) return
    const timer = setTimeout(() => setRevealed(text), dotsTime(text))
    return () => clearTimeout(timer)
  }, [text, instant, revealed])

  return instant || revealed === text ? text : ''
}
