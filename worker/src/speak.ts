// Shield Buddy's voice: turns Buddy's lines into speech with Google Cloud
// Text-to-Speech, so Buddy sounds the same on every device. Only Buddy's own lines
// are spoken (never anything a kid types), so each line's audio is made once and
// kept, and replayed for free after that.
//
// Google gives 1 million characters a month free for these voices; we stop at
// MONTHLY_LIMIT to stay well inside it. When the limit is reached (or Google is
// down), the app uses the device's own voice instead (src/readAloud.ts).
// See this month's count at GET /usage.

const VOICE = { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Alnilam' }
// A little slower than usual, for young listeners
const SPEAKING_RATE = 0.9
export const MONTHLY_LIMIT = 500_000
// The longest line we'll speak
export const MAX_SPEECH = 400

type KV = {
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>
  get(key: string): Promise<string | null>
  put(key: string, value: ArrayBuffer | string): Promise<void>
}

// This month's counter, e.g. "chars:2026-10" (months in UTC)
const counterKey = (now = new Date()) => `chars:${now.toISOString().slice(0, 7)}`

export async function charactersUsed(kv: KV, now = new Date()) {
  return Number((await kv.get(counterKey(now))) ?? 0)
}

// Each line's audio is kept under a hash of the voice and the words
async function audioKey(text: string) {
  const bytes = new TextEncoder().encode(`${VOICE.name}|${SPEAKING_RATE}|${text}`)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return `audio:${[...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

// The audio for a line we've spoken before (free), or null
export async function savedSpeech(text: string, kv: KV) {
  return kv.get(await audioKey(text), 'arrayBuffer')
}

// Makes the audio for a new line with Google, if this month's limit allows it, and
// keeps it. 'limit' when the month's characters are used up; null if Google fails.
// (The counter is a close count, not exact: two lines made at the same moment can
// both read the old total. The limit is half of Google's free amount, so that's fine.)
export async function makeSpeech(text: string, kv: KV, key: string): Promise<ArrayBuffer | 'limit' | null> {
  const used = await charactersUsed(kv)
  if (used + text.length > MONTHLY_LIMIT) return 'limit'

  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(6000),
    body: JSON.stringify({
      input: { text },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3', speakingRate: SPEAKING_RATE },
    }),
  })
  if (!res.ok) return null
  const { audioContent } = (await res.json()) as { audioContent?: string }
  if (!audioContent) return null
  const audio = Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0)).buffer

  await Promise.all([kv.put(counterKey(), String(used + text.length)), kv.put(await audioKey(text), audio)])
  return audio
}

// Checks what the app sent: { text } with one of Buddy's lines
export function readSpeech(body: unknown): string | null {
  const text = (body as { text?: unknown })?.text
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  return trimmed && trimmed.length <= MAX_SPEECH ? trimmed : null
}
