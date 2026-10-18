import { describe, expect, it } from 'vitest'
import { blankOut, linksIn, messageResult } from './messageLookup'
import type { MessageFacts } from './pictureSigns'

const noServer = async () => null
const facts = (more: Partial<MessageFacts> = {}): MessageFacts => ({ kind: 'text message', signs: [], links: [], threatOrPhotos: false, ...more })

describe('blanking out personal details', () => {
  it.each([
    ['call me on +44 7700 900461 now', 'call me on [phone] now'],
    ['Save this one: +44 7700 900461. Can you help?', 'Save this one: [phone]. Can you help?'],
    ['my email is sam.smith@example.com ok', 'my email is [email] ok'],
    ['Your code is 482913. Do not share it', 'Your code is [code]. Do not share it'],
    ['482913 is your verification code', '[code] is your verification code'],
    ['send it to 12 Oak Road please', 'send it to [address] please'],
  ])('%s', (text, blanked) => {
    expect(blankOut(text)).toBe(blanked)
  })

  it('keeps links (even with numbers in them), prices, and ordinary numbers', () => {
    const text = 'Claim 10,000 robux at rbx-free.xyz/claim?id=99887766 for £1.99, only 12 left'
    expect(blankOut(text)).toBe(text)
  })

  it('finds the links in a message, as written', () => {
    expect(linksIn('go to (rbx-free-robux.xyz/claim), or bit.ly/abc. email me@x.com')).toEqual(['rbx-free-robux.xyz/claim', 'bit.ly/abc'])
  })
})

describe('messageResult', () => {
  const text = "Hi Mum it's me, new number. Can you buy a £50 gift card? Need it in 10 mins"

  it('highlights the quoted words, as they are in the message', async () => {
    const result = await messageResult(
      facts({
        signs: [
          { sign: 'pretends to be family or a friend', words: "hi mum it's me, new number" },
          { sign: 'asks for money, gift cards or card details', words: 'Can you buy a £50 gift card?' },
          { sign: 'rushes you', words: 'Need it in 10 mins' },
        ],
      }),
      text,
      noServer,
    )
    expect(result.risk).toBe('high')
    expect(result.clues.map((c) => c.highlight)).toEqual(["Hi Mum it's me, new number", 'Can you buy a £50 gift card?', 'Need it in 10 mins'])
    expect(result.clues.every((c) => c.why?.length)).toBe(true)
  })

  it("doesn't highlight words that aren't in the message", async () => {
    const result = await messageResult(facts({ signs: [{ sign: 'rushes you', words: 'hurry up now' }] }), text, noServer)
    expect(result.clues[0]).toMatchObject({ label: 'Rushing you', highlight: undefined })
  })

  it('checks the links, including any Claude missed, each once', async () => {
    const message = 'Claim at rbx-free-robux.xyz/claim now'
    const result = await messageResult(facts({ links: ['rbx-free-robux.xyz/claim'] }), message, noServer)
    expect(result).toMatchObject({ risk: 'high', clues: [{ label: 'A trick link', highlight: 'rbx-free-robux.xyz/claim' }] })
    const missed = await messageResult(facts(), message, noServer)
    expect(missed.clues).toHaveLength(1)
  })

  it("never says no clues when it couldn't check, and is urgent when Claude won't read it", async () => {
    expect(await messageResult(null, text, noServer)).toMatchObject({ risk: 'medium', clues: [{ label: "Couldn't check it" }] })
    expect(await messageResult(facts({ declined: true, threatOrPhotos: true }), text, noServer)).toMatchObject({ risk: 'high', urgent: true })
  })

  it('finds no clues in a normal message', async () => {
    expect(await messageResult(facts(), 'Dinner is at 6. Love you x', noServer)).toMatchObject({ risk: 'none', clues: [] })
  })
})
