// Daily limits on checks that cost money (pictures and messages), counted in the
// Worker's storage (the SPEECH namespace)

// What each kind of check may do in a day (UTC): for everyone together, so misuse
// can't run up the bill, and for each person (well, each internet address: a
// family or a school may share one, so it's generous), so one person can't use up
// everyone's checks. Pictures cost about a cent each on Sonnet (so at most about
// $3 a day); messages about a tenth of that. Kids over a limit see "Couldn't check
// it ... show it to a grown-up".
export const LIMITS = {
  pictures: { all: 300, each: 40 },
  messages: { all: 1000, each: 100 },
}
export type Checked = keyof typeof LIMITS

type Counter = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}
const today = (now: Date) => now.toISOString().slice(0, 10)
const TWO_DAYS = 2 * 24 * 60 * 60

// A person's counter for today, under a code made from their address and the day
// (so the address itself is never stored, and the code changes every day)
async function personKey(what: Checked, who: string, now: Date) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${today(now)}:${who}`))
  const code = [...new Uint8Array(hash).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${what}:${today(now)}:${code}`
}

// How many were checked today, for everyone (e.g. "pictures:2026-10-18")
export async function checkedToday(kv: Counter, what: Checked, now = new Date()) {
  return Number((await kv.get(`${what}:${today(now)}`)) ?? 0)
}

// Whether there's room for `count` more today, for everyone and for this person
export async function roomFor(kv: Counter, what: Checked, who: string, limits: { all: number; each: number }, count = 1, now = new Date()) {
  const [all, mine] = await Promise.all([checkedToday(kv, what, now), kv.get(await personKey(what, who, now))])
  return all + count <= limits.all && Number(mine ?? 0) + count <= limits.each
}

// Counts `count` checked (e.g. 3 pictures in one check). The counters are thrown
// away after two days. Close enough: two at the same moment can count as one.
export async function countCheck(kv: Counter, what: Checked, who: string, count = 1, now = new Date()) {
  const key = await personKey(what, who, now)
  const [all, mine] = await Promise.all([checkedToday(kv, what, now), kv.get(key)])
  await Promise.all([
    kv.put(`${what}:${today(now)}`, String(all + count), { expirationTtl: TWO_DAYS }),
    kv.put(key, String(Number(mine ?? 0) + count), { expirationTtl: TWO_DAYS }),
  ])
}
