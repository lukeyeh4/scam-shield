// DEV CONSOLE: remove before shipping (see "Dev console" in PROJECT.md).

const FAST_KEY = 'scam-shield-dev-fast'
const PALETTE_KEY = 'scam-shield-dev-palette'

// Colour palettes to try (in dev/palettes.css); 'cream' is the one in index.css
export const PALETTES = ['cream', 'cloud', 'night', 'sky', 'mint', 'lavender', 'sunset'] as const
export type Palette = (typeof PALETTES)[number]

const FONT_KEY = 'scam-shield-dev-font'

// Fonts to try (in dev/fonts.css); 'nunito' is the one in index.css
export const FONTS = ['nunito', 'fredoka', 'baloo', 'andika', 'system'] as const
export type Font = (typeof FONTS)[number]
export const FONT_NAMES: Record<Font, string> = {
  nunito: 'Nunito (now)',
  fredoka: 'Fredoka + Nunito',
  baloo: 'Baloo 2 + Nunito',
  andika: 'Andika',
  system: 'System (old)',
}

export function getFont(): Font {
  try {
    const saved = localStorage.getItem(FONT_KEY)
    return FONTS.find((f) => f === saved) ?? 'nunito'
  } catch {
    return 'nunito'
  }
}

export function setFont(font: Font) {
  if (font === 'nunito') delete document.documentElement.dataset.font
  else document.documentElement.dataset.font = font
  try {
    localStorage.setItem(FONT_KEY, font)
  } catch {
    // Storage blocked: the font just isn't remembered
  }
}

export function getPalette(): Palette {
  try {
    const saved = localStorage.getItem(PALETTE_KEY)
    return PALETTES.find((p) => p === saved) ?? 'cream'
  } catch {
    return 'cream'
  }
}

// Shows the palette straight away, and remembers it after a reload
export function setPalette(palette: Palette) {
  if (palette === 'cream') delete document.documentElement.dataset.palette
  else document.documentElement.dataset.palette = palette
  try {
    localStorage.setItem(PALETTE_KEY, palette)
  } catch {
    // Storage blocked: the palette just isn't remembered
  }
}

// Fast mode: Buddy's text appears at once with no pauses, and the scam shows up
// straight away, so testing doesn't mean sitting through every conversation.
// Only ever on while running `npm run dev`.
export function isFast() {
  if (!import.meta.env.DEV) return false
  try {
    return localStorage.getItem(FAST_KEY) === '1'
  } catch {
    return false
  }
}

export function setFast(on: boolean) {
  try {
    if (on) localStorage.setItem(FAST_KEY, '1')
    else localStorage.removeItem(FAST_KEY)
  } catch {
    // Storage blocked: fast mode just stays off
  }
}
