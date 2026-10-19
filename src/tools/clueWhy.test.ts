import { describe, expect, it } from 'vitest'
import { buddyWhy, LINK_WHY_NAMES } from './clueWhy'
import { checkLink, type LinkCheck } from './linkCheck'
import { type LinkFacts, type PageFacts, withFacts } from './linkLookup'

const page = (more: Partial<PageFacts>): PageFacts => ({
  copiesBrand: null, asksFor: [], freePrize: false, unbelievableDeal: false, download: false,
  freeStreams: false, trickyAds: false, rushesYou: false, gambling: false, adult: false, ...more,
})
const facts = (url: string, more: Partial<LinkFacts>): LinkFacts => ({
  finalUrl: url, shortenerWarns: false, listed: [], created: null, exists: true, page: null, ...more,
})

// Links that between them give every kind of clue the link checker has
const LINKS = [
  'roblox-giveaway-official.net/claim', 'roblox-tips.com', 'rоblox.com', 'https://roblox.com@evil.net', 'http://192.168.0.1',
  'my-roblox.vercel.app', 'bit.ly/abc', 'login.secure.account.example-games.com', 'example-games.top', 's4w.in/roblox-com-users',
  'rainbet.com', 'pornhub.com',
]

describe("Shield Buddy's explanations", () => {
  it('has its own lines for every clue the link checker gives, each ending with a grown-up', () => {
    const clues = LINKS.flatMap((l) => (checkLink(l) as LinkCheck).clues)
    const c = checkLink('example-games.com') as LinkCheck
    const server = [
      facts(c.url, { listed: [{ url: c.url, threat: 'MALWARE' }] }),
      facts(c.url, { created: new Date().toISOString() }),
      facts(c.url, { exists: false }),
      facts(c.url, { pageBlocked: true }),
      facts(c.url, { page: page({ copiesBrand: 'Roblox', asksFor: ['password'], freePrize: true, unbelievableDeal: true, download: true, rushesYou: true, freeStreams: true, trickyAds: true }) }),
    ].flatMap((f) => withFacts(c, f).clues)
    for (const clue of [...clues, ...server]) {
      const lines = buddyWhy({ ...clue, highlight: undefined }, 1)
      expect(lines, clue.label).not.toContain("If you're still not sure, ask a grown-up.")
      expect(lines.join(' '), clue.label).toContain('grown-up')
    }
    expect(LINK_WHY_NAMES.length).toBeGreaterThan(25)
  })

  it('points to where the clue is first', () => {
    expect(buddyWhy({ label: 'Rushing you', reason: '', boxes: [{ left: 0, top: 0, right: 1, bottom: 1 }] }, 2)[0]).toBe('Look at number 2 on the picture.')
    expect(buddyWhy({ label: 'A short link', reason: '', highlight: 'bit.ly' }, 3)[0]).toBe('Look at number 3, in yellow.')
  })

  it('falls back to the reason for a clue it has no lines for', () => {
    expect(buddyWhy({ label: 'Something new', reason: 'Because.' }, 1)).toEqual(['Because.', "If you're still not sure, ask a grown-up."])
  })
})
