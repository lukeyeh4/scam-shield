import { createContext, useContext, useEffect, useRef } from 'react'
import { splitByHighlights } from '../highlight'

export type Mark = { target: string; highlight?: string; state: 'active' | 'seen' }

// The recap passes the red flags to highlight; mock-ups render content through <Field>.
export const MarksContext = createContext<Mark[]>([])

type FieldProps = { name: string; text: string; className?: string }

export function Field({ name, text, className = '' }: FieldProps) {
  const marks = useContext(MarksContext)
  const ref = useRef<HTMLSpanElement>(null)

  const whole = marks.find((m) => m.target === name && !m.highlight)
  const parts = marks
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => m.target === name && m.highlight)
  const isActive = whole?.state === 'active' || parts.some(({ m }) => m.state === 'active')

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isActive])

  const segments = splitByHighlights(text, parts.map(({ m, index }) => ({ index, text: m.highlight! })))

  return (
    <span ref={ref} className={`field ${whole ? `flag flag-${whole.state}` : ''} ${className}`}>
      {segments.map((s, i) =>
        s.mark === undefined ? (
          s.text
        ) : (
          <mark key={i} className={`flag flag-${marks[s.mark].state}`}>
            {s.text}
          </mark>
        ),
      )}
    </span>
  )
}
