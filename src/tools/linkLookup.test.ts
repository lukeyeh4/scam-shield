import { describe, expect, it } from 'vitest'
import { checkLink, type LinkCheck } from './linkCheck'
import { type LinkFacts, type PageFacts, withFacts } from './linkLookup'

const NOW = Date.parse('2026-10-10T12:00:00Z')
const check = (link: string) => checkLink(link) as LinkCheck
const facts = (url: string, more: Partial<LinkFacts> = {}): LinkFacts => ({
  finalUrl: check(url).url,
  shortenerWarns: false,
  listed: [],
  created: '2004-01-30T00:08:43Z',
  exists: true,
  page: null,
  ...more,
})
const page = (more: Partial<PageFacts>): PageFacts => ({
  copiesBrand: null,
  asksFor: [],
  freePrize: false,
  unbelievableDeal: false,
  download: false,
  freeStreams: false,
  trickyAds: false,
  rushesYou: false,
  gambling: false,
  adult: false,
  ...more,
})
const labels = (result: LinkCheck) => result.clues.map((c) => c.label)

describe('withFacts', () => {
  it('leaves the check alone when the server has no answer', () => {
    const c = check('roblox.com')
    expect(withFacts(c, null, NOW)).toBe(c)
  })

  it('gives good signs, and no clues, for an old real website on no list', () => {
    expect(withFacts(check('roblox.com'), facts('roblox.com'), NOW)).toMatchObject({
      risk: 'none',
      clues: [],
      good: [
        'This is the real Roblox website.',
        "Google hasn't marked it as dangerous yet.",
        'This website has been around for 22 years.',
      ],
    })
  })

  it("puts a website on Google's list first, as a scam", () => {
    const c = check('example-games.com')
    const listed = [{ url: c.url, threat: 'SOCIAL_ENGINEERING' }]
    const result = withFacts(c, facts('example-games.com', { listed }), NOW)
    expect(result.risk).toBe('high')
    expect(labels(result)).toEqual(['On a list of dangerous websites'])
    expect(result.clues[0].reason).toContain('passwords')
  })

  it('says how new a website is', () => {
    const brandNew = withFacts(check('example-games.com'), facts('example-games.com', { created: '2026-10-07T00:00:00Z' }), NOW)
    expect(brandNew.risk).toBe('high')
    expect(brandNew.clues[0].reason).toContain('3 days ago')

    const fairlyNew = withFacts(check('example-games.com'), facts('example-games.com', { created: '2026-07-01T00:00:00Z' }), NOW)
    expect(fairlyNew.risk).toBe('medium')
    expect(labels(fairlyNew)).toEqual(['A new website'])
  })

  it("says when a website can't be found", () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { exists: false }), NOW)
    expect(result).toMatchObject({ risk: 'medium', clues: [{ label: "This website can't be found" }] })
  })

  it("follows a short link and checks where it really goes", () => {
    const c = check('bit.ly/abc123')
    const result = withFacts(c, facts('bit.ly/abc123', { finalUrl: 'https://roblox-free-robux.xyz/claim' }), NOW)
    expect(result.risk).toBe('high')
    expect(labels(result)).toEqual(['A short link', 'Pretending to be Roblox', 'An unusual ending', 'Words that tempt you'])
    expect(result.clues.find((x) => x.label === 'A short link')?.reason).toContain('roblox-free-robux.xyz')
    // Only the short link's own clue can be marked in what the player pasted
    expect(result.clues.filter((x) => x.highlight).map((x) => x.label)).toEqual(['A short link'])
  })

  it('treats a page copying a brand and asking for a password as a scam', () => {
    const result = withFacts(
      check('example-games.com'),
      facts('example-games.com', { page: page({ copiesBrand: 'Roblox', asksFor: ['password', 'card'] }) }),
      NOW,
    )
    expect(result.risk).toBe('high')
    expect(labels(result)).toEqual(['Copies Roblox', 'Asks for private things'])
    expect(result.clues[1].reason).toContain('your password and card details')
  })

  it('treats a password form on a free website maker as a scam', () => {
    const result = withFacts(check('my-login.pages.dev'), facts('my-login.pages.dev', { created: null, page: page({ asksFor: ['password'] }) }), NOW)
    expect(result).toMatchObject({ risk: 'high', clues: [{ label: 'Asks for private things' }, { label: 'Made with a free website maker' }] })
  })

  it('only says be careful about a plain login page', () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { page: page({ asksFor: ['password'] }) }), NOW)
    expect(result.risk).toBe('medium')
  })

  it('treats unreal deals and downloads as scams', () => {
    const shop = withFacts(check('example-games.com'), facts('example-games.com', { page: page({ unbelievableDeal: true, asksFor: ['card'] }) }), NOW)
    expect(shop).toMatchObject({ risk: 'high', clues: [{ label: 'Asks for private things' }, { label: 'A deal too good to be true' }] })
    const hack = withFacts(check('example-games.com'), facts('example-games.com', { page: page({ download: true }) }), NOW)
    expect(hack).toMatchObject({ risk: 'high', clues: [{ label: 'Wants you to download something' }] })
  })

  it('says free streaming websites are not for kids, and warns about tricky ads', () => {
    const streams = withFacts(check('example-games.com'), facts('example-games.com', { page: page({ freeStreams: true, trickyAds: true }) }), NOW)
    expect(streams).toMatchObject({ risk: 'high', notForKids: true, clues: [{ label: 'Free shows or sports without paying' }, { label: 'Tricky ads' }] })
  })

  it("doesn't count a donation banner on its own", () => {
    const donate = page({ asksFor: ['money or gift cards'], rushesYou: true })
    expect(withFacts(check('wikipedia.org'), facts('wikipedia.org', { page: donate }), NOW)).toMatchObject({ risk: 'none', clues: [] })
  })

  it('counts asking for money and rushing you on a page with free prizes', () => {
    const scam = page({ freePrize: true, asksFor: ['money or gift cards'], rushesYou: true })
    const result = withFacts(check('example-games.com'), facts('example-games.com', { page: scam }), NOW)
    expect(labels(result)).toEqual(['Asks for private things', 'Free prizes', 'Rushing you'])
  })

  it('warns about betting websites, and gives no good signs then', () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { page: page({ gambling: true }) }), NOW)
    expect(result).toMatchObject({ risk: 'high', notForKids: true, clues: [{ label: 'A betting website' }] })
  })

  it('names a betting website only once when the device knew it already', () => {
    const result = withFacts(check('bloxflip.com'), facts('bloxflip.com', { page: page({ gambling: true }) }), NOW)
    expect(labels(result)).toEqual(['A betting website'])
  })

  it('says not for kids when the family filter blocks a website, once', () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { adult: true }), NOW)
    expect(result).toMatchObject({ risk: 'high', notForKids: true, clues: [{ label: 'Not for kids' }] })
    const known = withFacts(check('pornhub.com'), facts('pornhub.com', { adult: true, page: page({ adult: true }) }), NOW)
    expect(labels(known)).toEqual(['Not for kids'])
  })

  it("treats a website a safety filter blocks as dangerous, with no good sign from Google", () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { dangerous: true, pageBlocked: true }), NOW)
    expect(result).toMatchObject({ risk: 'high', clues: [{ label: 'On a list of dangerous websites' }] })
    expect(result.good).not.toContain("Google hasn't marked it as dangerous yet.")
  })

  it('says what Claude knows about a website whose page was blocked, instead of only that it was blocked', () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { pageBlocked: true, page: page({ adult: true }) }), NOW)
    expect(labels(result)).toEqual(['Not for kids'])
  })

  it('calls it a scam, not only not for kids, when a betting website is also on a dangerous list', () => {
    const result = withFacts(check('rainbet.com'), facts('rainbet.com', { dangerous: true }), NOW)
    expect(result).toMatchObject({ risk: 'high', notForKids: false })
  })

  it("says be careful when the website wouldn't let us look at its page", () => {
    const result = withFacts(check('example-games.com'), facts('example-games.com', { pageBlocked: true }), NOW)
    expect(result).toMatchObject({ risk: 'medium', clues: [{ label: "Couldn't look inside" }] })
  })

  it('treats a short link to a website with no clues as no clue, and says where it goes', () => {
    const result = withFacts(check('bit.ly/abc123'), facts('bit.ly/abc123', { finalUrl: 'https://www.roblox.com/games/123' }), NOW)
    expect(result).toMatchObject({ risk: 'none', clues: [] })
    expect(result.good).toEqual([
      'This short link goes to roblox.com.',
      'This is the real Roblox website.',
      "Google hasn't marked it as dangerous yet.",
      'This website has been around for 22 years.',
    ])
  })

  it("doesn't count an old http:// address behind a short link", () => {
    const result = withFacts(check('bit.ly/abc123'), facts('bit.ly/abc123', { finalUrl: 'http://example-games.com/' }), NOW)
    expect(result).toMatchObject({ risk: 'none', clues: [] })
  })

  it('names a short link only once when it leads to another short link page', () => {
    const result = withFacts(check('tinyurl.com/abc'), facts('tinyurl.com/abc', { finalUrl: 'https://tinyurl.com/preview/abc' }), NOW)
    expect(labels(result)).toEqual(['A short link'])
  })

  it('keeps other clues in a short link that goes somewhere clean', () => {
    const result = withFacts(check('bit.ly/free-robux'), facts('bit.ly/free-robux', { finalUrl: 'https://www.roblox.com/' }), NOW)
    expect(result).toMatchObject({ risk: 'medium', clues: [{ label: 'Words that tempt you' }] })
  })

  it("still says be careful about a short link that couldn't be followed", () => {
    expect(withFacts(check('bit.ly/abc123'), facts('bit.ly/abc123'), NOW)).toMatchObject({ risk: 'medium', clues: [{ label: 'A short link' }] })
    expect(withFacts(check('bit.ly/abc123'), null, NOW)).toMatchObject({ risk: 'medium' })
  })

  it("treats the short link website's own warning as a scam", () => {
    const result = withFacts(check('bit.ly/abc123'), facts('bit.ly/abc123', { shortenerWarns: true }), NOW)
    expect(result.risk).toBe('high')
    expect(labels(result)[0]).toBe('The short link has a warning')
  })
})
