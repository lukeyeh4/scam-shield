import { describe, expect, it } from 'vitest'

// The tests run in Node, whose own storage doesn't work without a flag: a small
// one in memory instead (before history.ts reads it)
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

const { clearHistory, outcomeOf, recordCheck, setKeepHistory } = await import('./history')
const saved = () => JSON.parse(localStorage.getItem('scam-shield-history') ?? '[]')

describe('the history of checks', () => {
  it('keeps when, which checker, the result and the clue names, never what was checked', () => {
    clearHistory()
    const result = { risk: 'high' as const, clues: [{ label: 'Free prizes', reason: '...', highlight: 'free robux here' }] }
    recordCheck('message', result, undefined, new Date('2026-10-18T15:42:00Z'))
    expect(saved()).toEqual([{ at: '2026-10-18T15:42:00.000Z', checker: 'message', outcome: 'scam', clues: ['Free prizes'] }])
    expect(localStorage.getItem('scam-shield-history')).not.toContain('free robux here')
  })

  it("adds each result once, keeps the newest 50, and keeps nothing when it's off", () => {
    clearHistory()
    const result = { risk: 'none' as const, clues: [] }
    recordCheck('link', result, 'roblox.com')
    recordCheck('link', result, 'roblox.com')
    expect(saved()).toHaveLength(1)
    for (let i = 0; i < 60; i++) recordCheck('picture', { risk: 'none', clues: [] })
    expect(saved()).toHaveLength(50)
    setKeepHistory(false)
    recordCheck('picture', { risk: 'high', clues: [] })
    expect(saved()).toHaveLength(50)
    setKeepHistory(true)
    clearHistory()
    expect(saved()).toEqual([])
  })

  it('names each kind of result', () => {
    expect(outcomeOf({ risk: 'high', urgent: true, clues: [] })).toBe('urgent')
    expect(outcomeOf({ risk: 'high', notForKids: true, clues: [] })).toBe('notForKids')
    expect(outcomeOf({ risk: 'medium', clues: [{ label: "Couldn't check it", reason: '' }] })).toBe('couldNotCheck')
    expect(outcomeOf({ risk: 'medium', clues: [] })).toBe('careful')
    expect(outcomeOf({ risk: 'none', clues: [] })).toBe('clean')
  })
})
