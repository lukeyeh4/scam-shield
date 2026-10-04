// DEV CONSOLE: remove before shipping (see "Dev console" in PROJECT.md).

const FAST_KEY = 'scam-shield-dev-fast'

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
