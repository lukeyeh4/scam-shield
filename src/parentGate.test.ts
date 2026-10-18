import { describe, expect, it } from 'vitest'
import { checkPin, hasPin, isPin, makeQuestion, noteTry, removePin, secondsLocked, setPin } from './parentGate'

// The tests run in Node, whose own storage doesn't work without a flag: a small
// one in memory instead
{
  const items = new Map<string, string>()
  const memory: Storage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    clear: () => items.clear(),
    key: (i: number) => [...items.keys()][i] ?? null,
    get length() {
      return items.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: memory, configurable: true })
}

describe('the parent gate', () => {
  it('asks a new, harder sum each time', () => {
    const asked = new Set(Array.from({ length: 50 }, () => makeQuestion().text))
    expect(asked.size).toBeGreaterThan(20)
    const { text, answer } = makeQuestion(() => 0.5)
    expect(text).toBe('What is 21 × 8?')
    expect(answer).toBe(168)
    for (let i = 0; i < 100; i++) expect(makeQuestion().answer).toBeGreaterThanOrEqual(13 * 6)
  })

  it('waits 30 seconds after three wrong tries in a row', () => {
    const now = 1_000_000
    noteTry(false, now)
    noteTry(false, now)
    expect(secondsLocked(now)).toBe(0)
    noteTry(false, now)
    expect(secondsLocked(now)).toBe(30)
    expect(secondsLocked(now + 31_000)).toBe(0)
  })

  it('keeps a PIN as a hash, and checks it', async () => {
    removePin()
    expect(hasPin()).toBe(false)
    expect(isPin('12a4')).toBe(false)
    await setPin('4821')
    expect(hasPin()).toBe(true)
    expect(localStorage.getItem('scam-shield-grown-up-pin')).not.toContain('4821')
    expect(await checkPin('4821')).toBe(true)
    expect(await checkPin('1234')).toBe(false)
    removePin()
    expect(hasPin()).toBe(false)
  })
})
