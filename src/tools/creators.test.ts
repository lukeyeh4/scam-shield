import { describe, expect, it } from 'vitest'
import { fakeHandle, handlesIn } from './creators'

describe('fakeHandle', () => {
  it.each([
    ['@MrBeast_Giveaway', 'giveaway'],
    ['MrBeastFreeRobux', 'free'],
    ['@mrbeast.official.team', 'official'],
    ['@IShowSpeed-Support', 'support'],
    ['@KaiCenatCashApp', 'cash'],
  ])("catches a famous name with a prize or helper word: %s", (handle, word) => {
    expect(fakeHandle(handle)?.reason).toContain(`"${word}"`)
  })

  it.each(['@MrBea5t', '@MrB3ast', '@MrBeastt', '@MrBaest', '@MrBeas7', '@rnrbeast', '@PewDiePle', '@Markipller', '@mrbеast'])(
    'catches a misspelled famous name: %s',
    (handle) => {
      expect(fakeHandle(handle)?.reason).toContain("isn't spelled like")
    },
  )

  it.each(['@MrBeast', '@MrBeast2', '@MrBeastGaming', '@BeastReacts', '@MrBeast6000', '@IShowSpeed', '@ishowspeedshorts', '@DanTDM', '@sam_plays', '@ninja', '@dream'])(
    "doesn't flag a name with nothing tricky added (never says it's real either): %s",
    (handle) => {
      expect(fakeHandle(handle)).toBeNull()
    },
  )

  it('names the creator', () => {
    expect(fakeHandle('@MrBeast_Giveaway')?.creator.name).toBe('MrBeast')
  })
})

describe('handlesIn', () => {
  it('finds accounts, not email addresses', () => {
    expect(handlesIn('Hi from @MrBeast_Giveaway. Email sam@example.com or DM @mr.beast.')).toEqual(['MrBeast_Giveaway', 'mr.beast'])
  })
})
