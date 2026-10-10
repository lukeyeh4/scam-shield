import { describe, expect, it } from 'vitest'
import { checkLink } from './linkCheck'

const labels = (text: string) => checkLink(text)?.clues.map((c) => c.label)

describe('checkLink', () => {
  it.each([
    'roblox.com',
    'https://www.roblox.com/games/123',
    'youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'mail.google.com',
    'https://apps.apple.com/us/app/roblox/id431946152',
    'discord.gg/minecraft',
    'https://www.bbc.co.uk/news',
    'wikipedia.org',
    'apply.com',
    'google.co.uk',
    'login.microsoftonline.com',
    'pineapple.com',
  ])('finds no clues in a real website: %s', (link) => {
    expect(checkLink(link)).toMatchObject({ risk: 'none', clues: [] })
  })

  it('catches a website pretending to be Roblox, and the bait word after it', () => {
    const result = checkLink('roblox-giveaway-official.net/claim')
    expect(result?.risk).toBe('high')
    expect(result?.site).toBe('roblox-giveaway-official.net')
    expect(labels('roblox-giveaway-official.net/claim')).toEqual(['Pretending to be Roblox', 'Words that tempt you'])
  })

  it.each([
    ['rob1ox.com', 'Roblox'],
    ['robloxx.com', 'Roblox'],
    ['https://g00gle.com/login', 'Google'],
    ['paypa1.com', 'PayPal'],
    ['free-robux.xyz', 'Roblox'],
    ['roblox.com.free-prizes.net', 'Roblox'],
    ['discord-nitro.gift', 'Discord'],
    ['steamcommunlty.com', 'Steam'],
  ])('catches a copy of a brand: %s', (link, brand) => {
    expect(checkLink(link)?.risk).toBe('high')
    expect(labels(link)).toContain(`Pretending to be ${brand}`)
  })

  it('catches letters from another alphabet that look like ours', () => {
    // The "о" here is Cyrillic, not a Latin "o"
    expect(labels('rоblox.com')).toContain('Some letters are fakes')
  })

  it('catches an @ that hides the real address', () => {
    const result = checkLink('https://roblox.com@evil-site.net/login')
    expect(result?.risk).toBe('high')
    expect(result?.clues[0]).toMatchObject({ label: 'The address is hiding something', highlight: 'roblox.com@' })
    expect(result?.site).toBe('evil-site.net')
  })

  it('catches an address that is only numbers', () => {
    expect(labels('http://185.23.4.1/login')).toEqual(['No website name', 'Not a safe connection'])
  })

  it('warns about short links, which hide where they go', () => {
    expect(checkLink('bit.ly/3xVid')).toMatchObject({ risk: 'medium' })
    expect(labels('bit.ly/3xVid')).toEqual(['A short link'])
  })

  it('warns about smaller clues on their own', () => {
    expect(labels('http://my-homework-help.com')).toEqual(['Not a safe connection'])
    expect(labels('cool-games.xyz')).toEqual(['An unusual ending'])
    expect(labels('login.secure.account.example.com')).toEqual(['A very long address'])
  })

  it.each(['', 'hello there', 'roblox', 'not a link at all', 'javascript:alert(1)', 'mailto:me@example.com'])(
    "says %j isn't a link",
    (text) => {
      expect(checkLink(text)).toBeNull()
    },
  )

  it.each([
    'roblox-giveaway-official.net/claim',
    'RobLox-Giveaway.net/FREE-robux',
    'https://roblox.com@evil-site.net/login',
    'http://185.23.4.1/login',
    'free-robux.xyz',
    'rоblox.com',
  ])('highlights words that are really in the link: %s', (link) => {
    for (const clue of checkLink(link)!.clues) {
      if (clue.highlight) expect(link).toContain(clue.highlight)
    }
  })
})
