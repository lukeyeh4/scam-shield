import { useSyncExternalStore } from 'react'

// Read-aloud: Shield Buddy's lines are spoken by the device's own voice (the
// browser's Web Speech API), so it can read any text, scripted or not.
// Off by default; the player's choice is remembered on the device.

const KEY = 'scam-shield-read-aloud'

export const canReadAloud = typeof window !== 'undefined' && 'speechSynthesis' in window

let on = false
try {
  on = canReadAloud && localStorage.getItem(KEY) === '1'
} catch {
  // Storage blocked: read-aloud starts off
}

const listeners = new Set<() => void>()

export const isReadAloudOn = () => on

export function setReadAloud(value: boolean) {
  on = value && canReadAloud
  try {
    if (on) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the choice lasts until the page is reloaded
  }
  if (!on && canReadAloud) speechSynthesis.cancel()
  listeners.forEach((listener) => listener())
}

export function useReadAloud() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    isReadAloudOn,
  )
}

// iPhones and iPads only let a page talk once the player has tapped something,
// so the first tap anywhere wakes the voice up
if (canReadAloud) {
  document.addEventListener('click', () => speechSynthesis.speak(new SpeechSynthesisUtterance('')), {
    capture: true,
    once: true,
  })
}

// Kept while speaking, or some browsers forget the line and never say it has ended
let current: SpeechSynthesisUtterance | null = null

// Says `text` out loud, a little slower than usual for young listeners, then calls
// `onEnd`. Returns a function that stops it early (without calling `onEnd`).
export function speak(text: string, onEnd: () => void) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  let ended = false
  const end = () => {
    if (ended) return
    ended = true
    clearTimeout(fallback)
    if (current === utterance) current = null
    onEnd()
  }
  utterance.onend = end
  utterance.onerror = end
  // In case the voice never starts (e.g. no tap yet) or never says it has ended
  const fallback = setTimeout(end, 3000 + 120 * text.length)

  speechSynthesis.cancel()
  current = utterance
  speechSynthesis.speak(utterance)

  return () => {
    ended = true
    clearTimeout(fallback)
    if (current === utterance) {
      current = null
      speechSynthesis.cancel()
    }
  }
}
