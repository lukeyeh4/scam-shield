import { useSyncExternalStore } from 'react'

// Read-aloud: Shield Buddy's lines are spoken in Buddy's own voice, made by our
// server with Google Cloud Text-to-Speech (worker/src/speak.ts: each line is made
// once, within a monthly limit), so Buddy sounds the same on every device. If the
// server can't answer in time, or the month's speech is used up, the device's own
// voice (the browser's Web Speech API) reads it instead.
// Off by default; the player's choice is remembered on the device.

const SERVER: string | undefined = import.meta.env.VITE_LINK_SERVER
// Optional: a folder of Buddy's lines made ahead of time, for builds that can't
// reach the server (e.g. the demo page). Each line is <first 20 hex of its
// SHA-256>.mp3; lines not in it come from the server as usual.
const VOICE_FILES: string | undefined = import.meta.env.VITE_VOICE_FILES

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

// Buddy's voice is played with Web Audio, made on first use
const hasServerVoice = Boolean(SERVER || VOICE_FILES) && typeof window !== 'undefined' && 'AudioContext' in window
let audio: AudioContext | null = null
const audioContext = () => (audio ??= new AudioContext())

// iPhones and iPads only let a page talk once the player has tapped something,
// so the first tap anywhere wakes both voices up
if (canReadAloud) {
  document.addEventListener(
    'click',
    () => {
      speechSynthesis.speak(new SpeechSynthesisUtterance(''))
      if (hasServerVoice) void audioContext().resume()
    },
    { capture: true, once: true },
  )
}

// Each line's audio, fetched once while the app is open (the same line is often
// said again, e.g. after going back)
const lines = new Map<string, Promise<AudioBuffer | null>>()

// A line's audio made ahead of time, or null
async function savedVoice(text: string) {
  if (!VOICE_FILES) return null
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  const name = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 20)
  const res = await fetch(`${VOICE_FILES}${name}.mp3`)
  return res.ok ? res : null
}

const fromServer = (text: string) =>
  SERVER
    ? fetch(`${SERVER}/speak`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(5000),
      })
    : null

function buddyVoice(text: string): Promise<AudioBuffer | null> {
  let line = lines.get(text)
  if (!line) {
    line = savedVoice(text)
      .catch(() => null)
      .then((res) => res ?? fromServer(text))
      .then(async (res) => (res?.ok ? audioContext().decodeAudioData(await res.arrayBuffer()) : null))
      .catch(() => null)
    lines.set(text, line)
    // A line that failed is tried again next time
    void line.then((buffer) => buffer || lines.delete(text))
  }
  return line
}

// Fetches a line's audio ahead of time (e.g. Buddy's next message while it reads
// this one), so a tap that moves on can read the next line straight away
export function preloadVoice(text: string) {
  if (on && hasServerVoice && text) void buddyVoice(text)
}

// Says `text` out loud, then calls `onEnd`: in Buddy's voice, or the device's if
// that doesn't come. Returns a function that stops it early (without calling `onEnd`).
export function speak(text: string, onEnd: () => void) {
  if (!hasServerVoice) return speakOnDevice(text, onEnd)
  let stopped = false
  let stop = () => {}
  void buddyVoice(text).then((buffer) => {
    if (stopped) return
    const context = audioContext()
    // No audio, or the page isn't allowed to play sound yet (no tap): the device's voice
    if (!buffer || context.state !== 'running') {
      stop = speakOnDevice(text, onEnd)
      return
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      clearTimeout(fallback)
      onEnd()
    }
    source.onended = end
    // In case it never says it has ended
    const fallback = setTimeout(end, buffer.duration * 1000 + 2000)
    source.start()
    stop = () => {
      ended = true
      clearTimeout(fallback)
      source.onended = null
      source.stop()
    }
  })
  return () => {
    stopped = true
    stop()
  }
}

// Kept while speaking, or some browsers forget the line and never say it has ended
let current: SpeechSynthesisUtterance | null = null

// The device's own voice, a little slower than usual for young listeners
function speakOnDevice(text: string, onEnd: () => void) {
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
