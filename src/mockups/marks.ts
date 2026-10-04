import { createContext, useContext, useEffect, useRef } from 'react'

// In "Spot the clues", `hidden` marks a clue that's still to be found (it looks like
// plain text, but a tap on it can be told apart), and `hint` glows softly as a hint
export type Mark = { target: string; highlight?: string; state: 'active' | 'seen' | 'hidden' | 'hint' }

// A mark for a whole part of the screen; if there are several, one that shows wins
export const findWhole = (marks: Mark[], name: string) => {
  const wholes = marks.filter((m) => m.target === name && !m.highlight)
  return wholes.find((m) => m.state !== 'hidden') ?? wholes[0]
}

// The recap passes the red flags to highlight; mock-ups render content through <Field>.
export const MarksContext = createContext<Mark[]>([])

// Scrolls a highlighted part into view, then again once Shield Buddy's new speech
// bubble has finished growing (on narrow screens it makes the fake screen shorter)
export function scrollMarkIntoView(element: HTMLElement | null) {
  const scroll = () => element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  scroll()
  const timer = setTimeout(scroll, 450)
  return () => clearTimeout(timer)
}

// For parts of a fake screen that aren't text (e.g. a video or a box of comments):
// the highlight classes to add when the recap points at `name`, and a ref so the
// part scrolls into view while it's being pointed at
export function useMark<T extends HTMLElement>(name: string) {
  const mark = findWhole(useContext(MarksContext), name)
  const ref = useRef<T>(null)
  const isActive = mark?.state === 'active'

  useEffect(() => {
    if (isActive) return scrollMarkIntoView(ref.current)
  }, [isActive])

  // Lets "Spot the clues" tell which part was tapped
  useEffect(() => {
    ref.current?.setAttribute('data-field', name)
  }, [name])

  return [mark ? `flag flag-${mark.state}` : '', ref] as const
}
