import { describe, expect, it } from 'vitest'
import { ANSWERED, BACK_AFTER, buddySays, findLink, replyTo, STEPS, type StepId, TOPIC_STEPS, TYPED_STEPS } from './script'

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
  it('can reach every step from the start, by typing, or by coming back from a check', () => {
    expect([...new Set([...reachable(), ...TYPED_STEPS, ...Object.values(BACK_AFTER)])].sort()).toEqual([...ids].sort())
  })

  it('sends a kid to a grown-up after every check, however Buddy says it', () => {
    for (const id of Object.values(BACK_AFTER)) {
      for (const lines of [STEPS[id].buddy, ...(STEPS[id].alternatives ?? [])]) expect(lines.join(' '), id).toContain('grown-up')
    }
  })

  it("sends a kid to a grown-up after every AI answer, or when the AI can't answer", () => {
    for (const id of [...Object.values(ANSWERED), ...Object.values(TOPIC_STEPS), 'askFailed' as const]) {
      for (const lines of [STEPS[id].buddy, ...(STEPS[id].alternatives ?? [])]) expect(lines.join(' '), id).toContain('grown-up')
    }
  })

  it("says it a different way each time, and only says 'Good thinking' the first time", () => {
    for (const id of Object.values(BACK_AFTER)) {
      const said = [0, 1, 2].map((turn) => buddySays(id, turn).join(' '))
      expect(new Set(said).size, id).toBe(3)
      expect(said.filter((s) => s.includes('Good thinking')), id).toHaveLength(1)
    }
  })

  it.each([
    ['is roblox-giveaway-official.net real?', 'typedLink'],
    ['someone sent me https://bit.ly/3xVid', 'typedLink'],
    ['check www.example.com', 'typedLink'],
    ['is free-robux.site real?', 'typedLink'],
    ['they sent me roblox.gift/claim', 'typedLink'],
    ['someone in my game wants my password', 'typed'],
    ['is this a scam? i got a text from a new number', 'typed'],
    ['what does e.g. mean? it was in a message', 'typed'],
    ['i have 3.5 dollars of robux. is that ok?', 'typed'],
    ['my password is fluffy123, is that ok?', 'personal'],
    ['i live at 12 oak street, can i say that?', 'personal'],
    ['someone asked me to send nudes', 'upset'],
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
    ['is free-robux.site real?', 'free-robux.site'],
    ['no link here', undefined],
    ['the end.Then they asked again', undefined],
  ])('finds the link in "%s"', (text, link) => {
    expect(findLink(text)).toBe(link)
  })

  it('sends a kid who is not sure to a grown-up', () => {
    expect(STEPS.notSure.buddy.join(' ')).toContain('grown-up')
  })
})
