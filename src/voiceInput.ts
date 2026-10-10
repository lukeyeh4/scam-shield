import { useSyncExternalStore } from 'react'

// Voice input: the player asks Shield Buddy out loud and the words appear in the
// chat's box, to check before sending. Uses the browser's own speech recognition
// (Web Speech API), which is free but not on device: Chrome sends the voice to
// Google, Safari usually to Apple, to turn it into text. Nothing is kept here.
// A grown-up turns it on in setup (off by default); the choice is remembered on
// the device. Browsers without it (e.g. Firefox) don't show the microphone.

const KEY = 'scam-shield-voice'

// Just the parts of the Web Speech API used here (not every TypeScript lib has them)
type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

const Recognition: (new () => Recognition) | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as Record<string, new () => Recognition>).SpeechRecognition ??
      (window as unknown as Record<string, new () => Recognition>).webkitSpeechRecognition)

export const canTalk = Recognition !== undefined

let allowed = false
try {
  allowed = canTalk && localStorage.getItem(KEY) === '1'
} catch {
  // Storage blocked: talking starts off
}

const listeners = new Set<() => void>()

export const isTalkingAllowed = () => allowed

export function setTalkingAllowed(value: boolean) {
  allowed = value && canTalk
  try {
    if (allowed) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the choice lasts until the page is reloaded
  }
  listeners.forEach((listener) => listener())
}

export function useTalkingAllowed() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    isTalkingAllowed,
  )
}

// Why listening ended early: 'blocked' (the microphone isn't allowed), 'unheard'
// (no words, or they couldn't be made out), or 'failed' (anything else, e.g. offline)
export type ListenProblem = 'blocked' | 'unheard' | 'failed'

// Listens until the player stops talking (or `stop` is called), calling `onWords`
// with everything heard so far as it's heard, then `onEnd` once, with a problem if
// nothing usable was heard. Returns a function that stops listening (keeping what
// was heard).
export function listen(onWords: (text: string) => void, onEnd: (problem?: ListenProblem) => void) {
  if (!Recognition) {
    onEnd('failed')
    return () => {}
  }
  const recognition = new Recognition()
  recognition.lang = 'en-US'
  recognition.interimResults = true
  recognition.continuous = false

  let heard = ''
  let problem: ListenProblem | undefined
  recognition.onresult = (e) => {
    heard = Array.from(e.results, (result) => result[0].transcript).join('')
    onWords(heard)
  }
  recognition.onerror = (e) => {
    problem = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'blocked' : e.error === 'no-speech' ? 'unheard' : e.error === 'aborted' ? undefined : 'failed'
  }
  recognition.onend = () => onEnd(problem ?? (heard.trim() ? undefined : 'unheard'))

  try {
    recognition.start()
  } catch {
    onEnd('failed')
  }
  return () => recognition.stop()
}
