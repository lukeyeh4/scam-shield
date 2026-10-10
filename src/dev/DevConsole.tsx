// DEV CONSOLE: remove before shipping (see "Dev console" in PROJECT.md).
import { useEffect, useState } from 'react'
import { resetBadges } from '../badges'
import { scenarios } from '../scenarios'
import type { ScenarioStart } from '../screens/ScenarioScreen'
import type { Choice } from '../types'
import {
  type Font,
  FONT_NAMES,
  FONTS,
  getFont,
  getPalette,
  isFast,
  type Palette,
  PALETTES,
  setFast,
  setFont,
  setPalette,
} from './devSettings'
import './devConsole.css'
import './fonts.css'
import './palettes.css'

// The palette and font picked last time
setPalette(getPalette())
setFont(getFont())

export type DevJump =
  | { to: 'menu' }
  | { to: 'end' }
  | { to: 'scenario'; index: number; start?: ScenarioStart }

const CHOICES: Choice[] = ['do', 'ignore', 'tell']

// A small panel for testing: jump to any screen, and turn on fast mode to skip
// waiting for Buddy. Open it with the "Dev" button or the ` key.
// Only rendered while running `npm run dev`.
export function DevConsole({ onJump }: { onJump: (jump: DevJump) => void }) {
  const [open, setOpen] = useState(false)
  const [fast, setFastState] = useState(isFast)
  const [palette, setPaletteState] = useState(getPalette)
  const [font, setFontState] = useState(getFont)
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<Choice>('do')
  const scenario = scenarios[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleFast = () => {
    setFast(!fast)
    setFastState(!fast)
  }

  if (!open) {
    return (
      <button className="dev-toggle" type="button" onClick={() => setOpen(true)}>
        Dev
      </button>
    )
  }

  const go = (start?: ScenarioStart) => onJump({ to: 'scenario', index, start })

  return (
    <aside className="dev-console" aria-label="Dev console">
      <div className="dev-row dev-head">
        <strong>Dev console</strong>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <label className="dev-row">
        <input type="checkbox" checked={fast} onChange={toggleFast} />
        Fast mode (skip waiting)
      </label>

      <label className="dev-row">
        Colours
        <select
          value={palette}
          onChange={(e) => {
            setPalette(e.target.value as Palette)
            setPaletteState(e.target.value as Palette)
          }}
        >
          {PALETTES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
              {p === 'cream' ? ' (now)' : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="dev-row">
        Font
        <select
          value={font}
          onChange={(e) => {
            setFont(e.target.value as Font)
            setFontState(e.target.value as Font)
          }}
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {FONT_NAMES[f]}
            </option>
          ))}
        </select>
      </label>

      <div className="dev-row">
        <button type="button" onClick={() => onJump({ to: 'menu' })}>
          Menu
        </button>
        <button type="button" onClick={() => onJump({ to: 'end' })}>
          End screen
        </button>
        <button type="button" onClick={resetBadges}>
          Reset badges
        </button>
      </div>

      <label className="dev-row">
        Scenario
        <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
          {scenarios.map((s, i) => (
            <option key={s.id} value={i}>
              {i + 1}. {s.title}
            </option>
          ))}
        </select>
      </label>

      <label className="dev-row">
        Choice
        <select value={choice} onChange={(e) => setChoice(e.target.value as Choice)}>
          {CHOICES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="dev-row dev-stages">
        <button type="button" onClick={() => go()}>
          Scam
        </button>
        <button
          type="button"
          disabled={!scenario.doIt}
          title={scenario.doIt ? undefined : 'This scenario has no Do it step'}
          onClick={() => go({ choice: 'do', stage: 'doIt' })}
        >
          Do it page
        </button>
        <button type="button" onClick={() => go({ choice, stage: 'outcome' })}>
          Outcome
        </button>
        <button type="button" onClick={() => go({ choice, stage: 'spot' })}>
          Spot clues
        </button>
        <button type="button" onClick={() => go({ choice, stage: 'recap' })}>
          Recap
        </button>
        <button type="button" onClick={() => go({ choice, stage: 'summary' })}>
          Summary
        </button>
      </div>
    </aside>
  )
}
