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

  it("doesn't count http on an official website, which switches to https by itself", () => {
    expect(checkLink('http://google.com/')).toMatchObject({ risk: 'none', clues: [] })
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
    'RbxGiveaway.com',
  ])('highlights words that are really in the link: %s', (link) => {
    for (const clue of checkLink(link)!.clues) {
      if (clue.highlight) expect(link).toContain(clue.highlight)
    }
  })

  it.each(['freerobux.gg', 'getfreerobux.net', 'rbx-giveaway.com'])('catches Roblox inside a longer name: %s', (link) => {
    expect(checkLink(link)?.risk).toBe('high')
    expect(labels(link)?.[0]).toBe('Pretending to be Roblox')
  })

  it.each([
    ['ronlox.com', 'Roblox'],
    ['roklox.com', 'Roblox'],
    ['goggle.com', 'Google'],
    ['yootube.com', 'YouTube'],
  ])('catches one letter changed: %s', (link, brand) => {
    expect(checkLink(link)).toMatchObject({ risk: 'high', clues: [{ label: `Pretending to be ${brand}` }] })
  })

  it('only says be careful about a brand inside a longer name without bait words (fan websites)', () => {
    expect(checkLink('planetminecraft.com')).toMatchObject({ risk: 'medium', clues: [{ label: "Uses Minecraft's name" }] })
    expect(checkLink('fortnitetracker.com')).toMatchObject({ risk: 'medium', clues: [{ label: "Uses Fortnite's name" }] })
  })

  it('knows YouTube Kids is the real YouTube', () => {
    expect(checkLink('youtubekids.com')).toMatchObject({ risk: 'none', good: ['This is the real YouTube website.'] })
  })

  it("doesn't mistake a real word for a typo", () => {
    expect(checkLink('discard-pile.com')).toMatchObject({ risk: 'none', clues: [] })
  })

  describe('finds the real website with the Public Suffix List', () => {
    it.each([
      ['https://www.bbc.co.uk/news', 'bbc.co.uk'],
      ['shop.example.co.kr/cart', 'example.co.kr'],
      ['a.b.example.com.br', 'example.com.br'],
      ['rbxliy.netlify.app', 'rbxliy.netlify.app'],
      ['https://roblox.com@evil-site.net/login', 'evil-site.net'],
      ['http://login.roblox.com.free-prizes.net/claim?next=roblox.com#top', 'free-prizes.net'],
    ])('%s is %s', (link, site) => {
      expect(checkLink(link)?.site).toBe(site)
    })

    it('treats the brand name as the whole website, under any ending, as pretending', () => {
      expect(labels('roblox.com.mu')).toContain('Pretending to be Roblox')
      expect(labels('robux.gg')).toContain('Pretending to be Roblox')
      expect(labels('roblox.net')).toContain('Pretending to be Roblox')
    })
  })

  describe('misleading subdomains', () => {
    it('explains a real address used as the start of a fake one', () => {
      const result = checkLink('roblox.com.free-prizes.net')
      expect(result?.risk).toBe('high')
      expect(result?.clues[0].reason).toBe(
        'This address starts with roblox.com, but websites are read from the end. This one is really free-prizes.net.',
      )
      expect(checkLink('www-paypal-com.account-check.info')?.clues[0].reason).toContain('starts with paypal.com')
    })

    it('catches a brand subdomain with logging-in words', () => {
      expect(checkLink('roblox-login.evil-site.net')).toMatchObject({ risk: 'high', clues: [{ label: 'Pretending to be Roblox' }] })
    })

    it('only says be careful about a brand subdomain on its own (a fan wiki)', () => {
      expect(checkLink('roblox.fandom.com')).toMatchObject({ risk: 'medium', clues: [{ label: "Uses Roblox's name" }] })
    })
  })

  describe('brand references and impersonation', () => {
    it.each(['roblox-tips.com', 'minecraft-builds.net'])('only says be careful about a fan website: %s', (link) => {
      expect(checkLink(link)?.risk).toBe('medium')
    })

    it.each(['xbox-achievements.com', 'discordservers.com', 'pokemon-cards-wiki.org'])(
      'only says be careful about a game or show fan website: %s',
      (link) => {
        expect(checkLink(link)?.risk).toBe('medium')
      },
    )

    it.each(['webwindos-whatsapp.com.cn', 'mfacebooks.vn', 'paypal-help.com', 'my-apple-id.net'])(
      'catches any use of a brand nobody makes fan websites for: %s',
      (link) => {
        expect(checkLink(link)?.risk).toBe('high')
      },
    )

    it.each(['roblox-login.com', 'roblox-support.net', 'robloxofficial.com', 'paypal-secure-account.com'])(
      'catches a brand with logging-in or prize words: %s',
      (link) => {
        expect(checkLink(link)?.risk).toBe('high')
      },
    )

    it.each(['robox.com', 'robloxx.com', 'ronlox.com', 'rbolox.com', 'rob1ox.com', 'r0blox.com', 'paypai.com', 'rob-lox.com'])(
      'catches a misspelled brand: %s',
      (link) => {
        expect(labels(link)?.[0]).toBe(link.startsWith('paypa') ? 'Pretending to be PayPal' : 'Pretending to be Roblox')
      },
    )

    it('mentions a real address in the path without calling the website a copy', () => {
      const result = checkLink('https://s4w.in/https-wwwroblox-com-users-3278239576257-profile')
      expect(result).toMatchObject({ risk: 'medium', clues: [{ label: "A real website's name in the wrong place" }] })
      expect(result?.clues[0].reason).toBe(
        `"roblox-com" comes after the website's name, so it doesn't change where the link goes. This link really goes to s4w.in.`,
      )
      expect(checkLink('example.com/go?to=amigo.com')).toMatchObject({ risk: 'none' })
    })

    it.each([
      ['wa.me/15551234567', 'WhatsApp'],
      ['discord.gift/abc123', 'Discord'],
      ['https://www.google.de', 'Google'],
      ['fb.me/someone', 'Facebook'],
      ['twitch.tv/somestreamer', 'Twitch'],
    ])('knows the official website %s', (link, brand) => {
      expect(checkLink(link)).toMatchObject({ risk: 'none', good: [`This is the real ${brand} website.`] })
    })
  })

  describe('explains how a brand name was changed', () => {
    const reason = (link: string) => checkLink(link)?.clues.find((c) => c.label.startsWith('Pretending'))?.reason
    it.each([
      ['ronlox.com', 'It says "ronlox", not "roblox". One letter is different: "n" instead of "b".'],
      ['robloxx.com', 'It says "robloxx", not "roblox". It has an extra "x".'],
      ['robox.com', 'It says "robox", not "roblox". It\'s missing the "l".'],
      ['rbolox.com', 'It says "rbolox", not "roblox". Two letters are swapped: "bo" instead of "ob".'],
      ['rob1ox.com', 'It says "rob1ox", not "roblox". It uses the number 1 instead of the letter l.'],
      ['robIox.com', 'It says "robIox", not "roblox". It uses "I" instead of "l", which look alike.'],
      ['rnicrosoft.com', 'It says "rnicrosoft", not "microsoft". It uses "rn" instead of "m", which look alike.'],
    ])('%s', (link, explained) => {
      expect(reason(link)).toBe(`${explained} The real ${link.includes('icrosoft') ? 'Microsoft website is microsoft.com' : 'Roblox website is roblox.com'}.`)
    })

    it("doesn't call a brand's own word a trick word", () => {
      expect(reason('robux.gg')).toBe('Only Roblox owns roblox.com. robux.gg just uses its name, so anyone could own it.')
    })

    it('says a fake-letter copy is a different website', () => {
      expect(reason('аррӏе.com')).toBe("It only looks like apple.com, but it's a different website.")
    })

    it('explains the @ trick', () => {
      expect(checkLink('https://roblox.com@evil-site.net/login')?.clues[0].reason).toBe(
        '"roblox.com@" is only there to fool you. Everything before the @ is ignored, so this link really goes to evil-site.net.',
      )
    })

    it('names the word used to trick you', () => {
      expect(reason('roblox-login.com')).toBe('It puts Roblox\'s name next to the word "login" to trick you. The real Roblox website is only roblox.com.')
    })
  })

  describe('letters from other alphabets', () => {
    it('catches a name written in lookalike letters from another alphabet', () => {
      // Every letter here is Cyrillic: а р р ӏ е
      const result = checkLink('аррӏе.com')
      expect(result?.risk).toBe('high')
      expect(labels('аррӏе.com')).toEqual(['Some letters are fakes', 'Pretending to be Apple'])
    })

    it('reads an address written as xn-- the same way', () => {
      expect(labels('https://xn--80ak6aa92e.com/')).toEqual(['Some letters are fakes', 'Pretending to be Apple'])
    })

    it('catches letters with marks that copy a brand', () => {
      expect(labels('röblox.com')).toEqual(['Some letters are fakes', 'Pretending to be Roblox'])
    })

    it('finds no clues in real websites with letters from other alphabets', () => {
      expect(checkLink('münchen.de')).toMatchObject({ risk: 'none', clues: [] })
      expect(checkLink('пример.рф')).toMatchObject({ risk: 'none', clues: [] })
    })
  })

  describe('pasted text', () => {
    it('finds the link in a message', () => {
      const text = 'Hey!! Get free Robux at rob1ox-gifts.com/claim before it ends!!'
      const result = checkLink(text)
      expect(result).toMatchObject({ risk: 'high', site: 'rob1ox-gifts.com' })
      for (const clue of result!.clues) if (clue.highlight) expect(text).toContain(clue.highlight)
    })

    it('checks every link and shows the riskiest', () => {
      expect(checkLink('Real one: roblox.com. Fake one: (rob1ox.com)')?.site).toBe('rob1ox.com')
    })

    it('takes off brackets and punctuation around a link', () => {
      expect(checkLink('(see https://www.roblox.com/home).')).toMatchObject({ risk: 'none', site: 'roblox.com' })
    })

    it.each(['meet at 5.30 today', 'version 1.2.3 is out', 'my email is me@example.com', 'e.g. this one', 'hello.there'])(
      'finds no link in %j',
      (text) => {
        expect(checkLink(text)).toBeNull()
      },
    )

    it('reads links typed in capitals or without https://', () => {
      expect(checkLink('HTTPS://WWW.ROBLOX.COM')).toMatchObject({ risk: 'none', site: 'roblox.com' })
      expect(checkLink('www.roblox.com')).toMatchObject({ risk: 'none', site: 'roblox.com' })
    })
  })

  it('catches bait words inside the website name', () => {
    expect(checkLink('rbxgiveaway.com')).toMatchObject({ risk: 'medium', clues: [{ label: 'Words that tempt you', highlight: 'giveaway' }] })
  })

  it.each(['pornhub.com', 'https://www.xvideos.com/video123', 'onlyfans.com', 'anything.xxx', 'example.porn'])('says an adult website is not for kids: %s', (link) => {
    expect(checkLink(link)).toMatchObject({ risk: 'medium', clues: [{ label: 'Not for kids' }] })
  })

  it.each(['rainbet.com', 'https://www.stake.us/casino', 'bc.game', 'bloxflip.com', 'kalshi.com'])('says be careful about a betting website: %s', (link) => {
    expect(checkLink(link)).toMatchObject({ risk: 'medium', clues: [{ label: 'A betting website' }] })
  })
})
