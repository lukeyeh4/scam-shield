// The parent gate before the grown-ups' settings (app stores require one in kids'
// apps). A grown-up PIN is what really keeps kids out: until one is set, and if
// it's forgotten, the gate asks a question that's new every time and has to be
// typed (a multiple-choice sum can be guessed, and a fixed one remembered). After
// three wrong tries in a row, it waits 30 seconds.
//
// The PIN is kept on this device only, never in plain sight: as a hash of a random
// salt and the PIN. Clearing the browser's data removes it, but also turns the
// checks off (setup.ts), so that can't be used to get around it.

const PIN_KEY = 'scam-shield-grown-up-pin'
export const PIN_LENGTH = 4

// A sum most 8 to 12 year olds can't do in their heads quickly, e.g. 23 × 7
export function makeQuestion(random = Math.random) {
  const a = 13 + Math.floor(random() * 17)
  const b = 6 + Math.floor(random() * 4)
  return { text: `What is ${a} × ${b}?`, answer: a * b }
}

// Three wrong tries in a row, then a wait
const TRIES = 3
const WAIT_MS = 30_000
let wrong = 0
let lockedUntil = 0
export const secondsLocked = (now = Date.now()) => Math.max(0, Math.ceil((lockedUntil - now) / 1000))
export function noteTry(right: boolean, now = Date.now()) {
  if (right) {
    wrong = 0
    return
  }
  wrong += 1
  if (wrong >= TRIES) {
    wrong = 0
    lockedUntil = now + WAIT_MS
  }
}

async function hash(salt: string, pin: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${pin}`))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function stored() {
  try {
    return localStorage.getItem(PIN_KEY)
  } catch {
    return null
  }
}

export const hasPin = () => stored() !== null

export const isPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)

export async function setPin(pin: string) {
  if (!isPin(pin)) return
  const salt = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('')
  try {
    localStorage.setItem(PIN_KEY, `${salt}:${await hash(salt, pin)}`)
  } catch {
    // Storage blocked: no PIN, so the gate keeps asking its question
  }
}

export async function checkPin(pin: string) {
  const [salt, saved] = (stored() ?? '').split(':')
  return Boolean(salt && saved) && (await hash(salt, pin)) === saved
}

export function removePin() {
  try {
    localStorage.removeItem(PIN_KEY)
  } catch {
    // Storage blocked: there was no PIN to remove
  }
}
