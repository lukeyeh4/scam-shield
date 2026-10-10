import { describe, expect, it } from 'vitest'
import { findLink, replyTo, STEPS, type StepId, TYPED_STEPS } from './script'

const ids = Object.keys(STEPS) as StepId[]

// Every step the player can get to by tapping answers, starting from the start
function reachable() {
  const seen = new Set<StepId>(['start'])
  const queue: StepId[] = ['start']
  while (queue.length) {
    for (const option of STEPS[queue.shift()!].options) {
      if (option.next && !seen.has(option.next)) {
        seen.add(option.next)
        queue.push(option.next)
      }
    }
  }
  return seen
}

describe('chat script', () => {
  it('can reach every step from the start, or by typing', () => {
    expect([...reachable(), ...TYPED_STEPS].sort()).toEqual([...ids].sort())
  })

  it.each([
    ['is roblox-giveaway-official.net real?', 'typedLink'],
    ['someone sent me https://bit.ly/3xVid', 'typedLink'],
    ['check www.example.com', 'typedLink'],
    ['someone in my game wants my password', 'typed'],
    ['is this a scam? i got a text from a new number', 'typed'],
  ])('replies to "%s" with %s', (text, step) => {
    expect(replyTo(text)).toBe(step)
  })

  it.each(ids)('gives "%s" something for Buddy to say and answers to tap', (id) => {
    const step = STEPS[id]
    expect(step.buddy.length).toBeGreaterThan(0)
    expect(step.options.length).toBeGreaterThan(0)
    for (const option of step.options) expect(option.next ?? option.leave, option.label).toBeDefined()
  })

  it('never leaves the player stuck: every step can get back to checking or out of the chat', () => {
    const canFinish = (id: StepId, seen = new Set<StepId>()): boolean => {
      if (seen.has(id)) return false
      seen.add(id)
      return STEPS[id].options.some((o) => o.leave || o.next === 'again' || (o.next && canFinish(o.next, seen)))
    }
    for (const id of ids) expect(canFinish(id), id).toBe(true)
  })

  it.each([
    ['is roblox-giveaway-official.net real?', 'roblox-giveaway-official.net'],
    ['someone sent me https://bit.ly/3xVid!', 'https://bit.ly/3xVid'],
    ['my friend said (www.free-robux.com) works', 'www.free-robux.com'],
    ['no link here', undefined],
  ])('finds the link in "%s"', (text, link) => {
    expect(findLink(text)).toBe(link)
  })

  it('sends a kid who is not sure to a grown-up', () => {
    expect(STEPS.notSure.buddy.join(' ')).toContain('grown-up')
  })
})
