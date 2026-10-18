import { describe, expect, it } from 'vitest'
import { checkLink, type LinkCheck } from './linkCheck'
import { withoutWebsiteKind } from './websiteKind'

describe('withoutWebsiteKind', () => {
  it('says only "Not for kids" for a betting website, in the same place and marking the same words', () => {
    const result = withoutWebsiteKind(checkLink('http://rainbet.com') as LinkCheck)
    expect(result.clues.map((c) => c.label)).toEqual(['Not for kids', 'Not a safe connection'])
    expect(result.clues[0]).toMatchObject({ reason: expect.not.stringContaining('betting'), highlight: 'rainbet.com' })
  })

  it('turns several kinds into one "Not for kids"', () => {
    const result = withoutWebsiteKind({
      risk: 'medium',
      clues: [
        { label: 'Free shows or sports without paying', reason: '...' },
        { label: 'Tricky ads', reason: '...' },
        { label: 'A betting website', reason: '...' },
      ],
    })
    expect(result.clues.map((c) => c.label)).toEqual(['Not for kids', 'Tricky ads'])
  })

  it('leaves scam clues alone', () => {
    const scam = checkLink('roblox-giveaway-official.net/claim') as LinkCheck
    expect(withoutWebsiteKind(scam)).toBe(scam)
  })
})
