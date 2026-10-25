import { describe, expect, it } from 'vitest'
import { inPictureOrder } from './examples'
import type { LinkFacts } from './linkLookup'
import { contextFor, pictureResult } from './pictureLookup'
import { marksOf } from './pictureMarks'
import { type PictureFacts, SIGNS, type Sign } from './pictureSigns'

const box = { left: 100, top: 200, right: 900, bottom: 260 }
const facts = (more: Partial<PictureFacts> = {}): PictureFacts => ({
  readable: true,
  kind: 'text message',
  signs: [],
  links: [],
  threatOrPhotos: false,
  ...more,
})
const sign = (s: Sign, words = 'some words') => ({ sign: s, words, box })
const link = (address: string) => ({ address, box })
// The link checker's server: no answer, so only the device's checks count
const noServer = async () => null
const labels = async (f: PictureFacts | null) => (await pictureResult(f, noServer)).clues.map((c) => c.label)

describe('pictureResult', () => {
  it('has kid words for every sign the server can name', async () => {
    for (const s of SIGNS) {
      const result = await pictureResult(facts({ signs: [sign(s)] }), noServer)
      expect(result.clues).toHaveLength(1)
      expect(result.clues[0].reason).not.toContain(s)
    }
  })

  it('has Shield Buddy explain every sign and link in a few short lines, sending the kid to a grown-up', async () => {
    const result = await pictureResult(
      facts({ signs: SIGNS.map((s) => sign(s)), links: [link('rbx-free-robux.xyz'), link('rainbet.com'), link('games-unblocked-4u.top')] }),
      noServer,
    )
    expect(result.clues).toHaveLength(SIGNS.length + 3)
    for (const clue of result.clues) {
      expect(clue.why?.length, clue.label).toBeGreaterThanOrEqual(2)
      expect(clue.why!.join(' '), clue.label).toContain('grown-up')
    }
  })

  it('calls a picture with strong signs a scam, with a box for each', async () => {
    const result = await pictureResult(
      facts({ signs: [sign('pretends to be family or a friend'), sign('asks for money, gift cards or card details'), sign('rushes you')] }),
      noServer,
    )
    expect(result).toMatchObject({ risk: 'high', notForKids: false })
    expect(result.clues.map((c) => c.label)).toEqual(['Maybe not who they say', 'Asks for money or gift cards', 'Rushing you'])
    expect(result.clues[0].boxes).toEqual([box])
  })

  it('says only be careful for rushing on its own', async () => {
    expect(await pictureResult(facts({ signs: [sign('rushes you')] }), noServer)).toMatchObject({ risk: 'medium' })
  })

  it('calls a sad story be careful on its own, but a scam when it rushes you or moves you elsewhere', async () => {
    const sad = sign('sad story to get you to buy or give money')
    expect((await pictureResult(facts({ signs: [sad] }), noServer)).risk).toBe('medium')
    expect((await pictureResult(facts({ signs: [sad, sign('rushes you')] }), noServer)).risk).toBe('high')
    expect((await pictureResult(facts({ signs: [sad, sign('asks you to move to another app or keep a secret')] }), noServer)).risk).toBe('high')
  })

  it('treats someone getting too close as urgent, even before they ask for anything', async () => {
    const result = await pictureResult(facts({ signs: [sign('a stranger getting too personal')] }), noServer)
    expect(result).toMatchObject({ risk: 'high', urgent: true, clues: [{ label: 'Someone getting too close' }] })
  })

  it('says betting is not for kids, without naming it', async () => {
    const result = await pictureResult(facts({ signs: [sign('betting or gambling')] }), noServer)
    expect(result).toMatchObject({ risk: 'high', notForKids: true, clues: [{ label: 'Not for kids' }] })
  })

  it("names a new kind of trick in the app's own words, never Claude's", async () => {
    const odd = { ...sign('something else that looks like a trick'), about: 'chain message threatening to delete the account' }
    const result = await pictureResult(facts({ signs: [odd] }), noServer)
    expect(result).toMatchObject({ risk: 'medium', clues: [{ label: 'Something else looks wrong' }] })
    expect(JSON.stringify(result)).not.toContain('chain message')
  })

  it('makes one clue for a sign seen in two places, with both boxes', async () => {
    const result = await pictureResult(facts({ signs: [sign('rushes you', 'hurry'), sign('rushes you', 'only 2 left')] }), noServer)
    expect(result.clues).toHaveLength(1)
    expect(result.clues[0].boxes).toHaveLength(2)
  })

  it('finds no clues in a normal picture, and never says that for one it could not read or check', async () => {
    expect(await pictureResult(facts(), noServer)).toMatchObject({ risk: 'none', clues: [] })
    expect(await labels(facts({ readable: false }))).toEqual(['Hard to read'])
    expect(await labels(null)).toEqual(["Couldn't check it"])
    expect((await pictureResult(null, noServer)).risk).toBe('medium')
  })

  it('checks the links in the picture with the link checker', async () => {
    const result = await pictureResult(facts({ links: [link('rbx-free-robux.xyz/claim')] }), noServer)
    expect(result).toMatchObject({ risk: 'high', clues: [{ label: 'A trick link', reason: 'This link goes to rbx-free-robux.xyz. It puts Roblox\'s name next to the word "free" to trick you.', boxes: [box] }] })
    const odd = await pictureResult(facts({ links: [link('games-unblocked-4u.top')] }), noServer)
    expect(odd).toMatchObject({ risk: 'medium', clues: [{ label: 'A link to be careful with', reason: expect.stringMatching(/^This link goes to games-unblocked-4u\.top\. /) }] })
  })

  // "Uses Roblox's name: gamehack.co" read as if gamehack.co were Roblox
  it('says where a link goes, and that it is not the real website', async () => {
    const result = await pictureResult(facts({ links: [link('roblox.gamehack.co')] }), noServer)
    expect(result.clues[0].reason).toBe("This link goes to gamehack.co. This isn't Roblox's own website (that's roblox.com).")
  })

  it("uses the link checker's server for links too", async () => {
    const listed = async (url: string): Promise<LinkFacts> => ({
      finalUrl: url,
      shortenerWarns: false,
      listed: [{ url, threat: 'SOCIAL_ENGINEERING' }],
      created: null,
      exists: true,
      page: null,
    })
    const result = await pictureResult(facts({ links: [link('example-games.com')] }), listed)
    expect(result).toMatchObject({ risk: 'high', clues: [{ label: 'A trick link', reason: expect.stringMatching(/^This link goes to example-games\.com\. Google checks millions of websites/) }] })
  })

  it("says a link to a website that isn't for kids is that, not a scam", async () => {
    expect(await pictureResult(facts({ links: [link('rainbet.com')] }), noServer)).toMatchObject({ risk: 'high', notForKids: true })
  })

  it('leaves out links to real websites with no clues, and text that is not a link', async () => {
    expect(await pictureResult(facts({ links: [link('roblox.com'), link('hello')] }), noServer)).toMatchObject({ risk: 'none', clues: [] })
  })

  it("treats a picture Claude wouldn't look at as urgent, and hides it", async () => {
    const result = await pictureResult(facts({ declined: true, threatOrPhotos: true }), noServer)
    expect(result).toMatchObject({ risk: 'high', urgent: true, hidePicture: true, clues: [{ label: 'Something not OK for kids' }] })
  })

  it('marks threats and requests for photos as urgent', async () => {
    const result = await pictureResult(facts({ threatOrPhotos: true, signs: [sign('asks for photos or videos of you')] }), noServer)
    expect(result).toMatchObject({ risk: 'high', urgent: true })
  })

  it('numbers clues picture by picture, then down each one', async () => {
    const box = (top: number, picture?: number) => ({ left: 0, top, right: 100, bottom: top + 50, ...(picture ? { picture } : {}) })
    const result = await pictureResult(
      facts({
        signs: [
          { sign: 'rushes you', words: 'hurry', box: box(100, 1) },
          { sign: 'free prize or free game money', words: 'free', box: box(900) },
          { sign: 'sad story to get you to buy or give money', words: 'sad', box: box(50, 2) },
        ],
      }),
      noServer,
    )
    expect(inPictureOrder(result).clues.map((c) => c.label)).toEqual(['Free prizes', 'Rushing you', 'A sad story to make you pay'])
  })

  it('numbers clues down the picture, links included', async () => {
    const at = (top: number) => ({ left: 0, top, right: 100, bottom: top + 50 })
    const result = await pictureResult(
      facts({
        signs: [
          { sign: 'rushes you', words: 'hurry', box: at(800) },
          { sign: 'free prize or free game money', words: 'free robux', box: at(100) },
        ],
        links: [link('roblox-login-help.com')],
      }),
      noServer,
    )
    // (the link's box is at 200, between the two signs)
    expect(inPictureOrder(result).clues.map((c) => c.label)).toEqual(['Free prizes', 'A trick link', 'Rushing you'])
  })
})

describe('marks on the picture', () => {
  const at = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom })
  it('draws boxes that mostly overlap as one box with both numbers, and keeps others apart', () => {
    const marks = marksOf([
      { label: 'a', reason: '', boxes: [at(100, 300, 900, 360)] },
      { label: 'b', reason: '', boxes: [at(500, 320, 900, 380)] },
      { label: 'c', reason: '', boxes: [at(100, 700, 400, 740)] },
      { label: 'd', reason: '' },
    ])
    expect(marks.map((m) => m.clues)).toEqual([[0, 1], [2]])
  })
})

describe('where the picture is from', () => {
  it('sends the place and what the kid typed', () => {
    expect(contextFor("Someone I don't know", '')).toMatchObject({ context: "From: Someone I don't know", personal: false, upset: false })
    expect(contextFor('Something else', 'it popped up in my game')).toMatchObject({ context: 'it popped up in my game' })
    expect(contextFor(null, '')).toMatchObject({ context: undefined })
  })

  it('never sends personal details', () => {
    expect(contextFor('A friend', 'my name is Sam and I live at 12 Oak Road')).toMatchObject({ context: 'From: A friend', personal: true })
  })

  it('notices something upsetting', () => {
    expect(contextFor('Something else', 'he said he would blackmail me')).toMatchObject({ upset: true })
  })
})
