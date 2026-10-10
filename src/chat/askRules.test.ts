import { describe, expect, it } from 'vitest'
import { answerProblem, asksAboutFreeGameMoney, hasPersonalDetails, soundsUpset } from './askRules'

describe('personal details (never sent to the AI)', () => {
  it.each([
    'my email is sam.k@gmail.com',
    'call me on 555 123 4567',
    'my phone is +44 7700 900123',
    'they want my code, its 482913',
    'my password is fluffy123',
    'my login: sam2015',
    'I live at 12 Oak Street',
    'we are at 4 Maple Rd now',
    'my name is Emma Jones',
    'my school is Hill Park',
    'I go to Lincoln Elementary school',
  ])('spots "%s"', (text) => {
    expect(hasPersonalDetails(text)).toBe(true)
  })

  it.each([
    'someone in my game wants my password',
    'they said i won 1000 robux',
    'is it a scam if they ask for my address?',
    'my friend got a text from a new number',
    'they want my login code to give me a free skin',
    'what is 7 times 8',
  ])('lets "%s" through', (text) => {
    expect(hasPersonalDetails(text)).toBe(false)
  })
})

describe('upsetting things (a grown-up straight away)', () => {
  it.each([
    'i want to hurt myself',
    'someone asked me to send nudes',
    'a man wants private photos of me',
    'they said they will share my picture unless i pay, it is blackmail',
    'kids at school are bullying me online',
    'he threatened me',
  ])('spots "%s"', (text) => {
    expect(soundsUpset(text)).toBe(true)
  })

  it.each(['someone wants my password', 'is this free robux real?', 'i got a scary pop-up'])('lets "%s" through', (text) => {
    expect(soundsUpset(text)).toBe(false)
  })
})

describe('free game money (always a scam, said plainly)', () => {
  it.each(['is there any way to get free robux', 'do vbucks generators work', 'a glitch for unlimited minecoins', 'Robux giveaway on youtube'])(
    'spots "%s"',
    (text) => {
      expect(asksAboutFreeGameMoney(text)).toBe(true)
    },
  )

  it.each(['how do i buy robux', 'someone wants my password for a free skin'])('lets "%s" through', (text) => {
    expect(asksAboutFreeGameMoney(text)).toBe(false)
  })

  it('shows an answer that says it plainly', () => {
    expect(answerProblem(['Free Robux is always a scam.', "Don't type anything in."], 'is free robux real')).toBeNull()
    expect(answerProblem(['That is a trick.', 'Real Robux only come from Roblox itself.'], 'robux generator?')).toBeNull()
    expect(answerProblem(['There is no such thing as free V-Bucks.'], 'free vbucks')).toBeNull()
  })

  it('throws away a softer answer', () => {
    expect(answerProblem(['Free Robux websites are a very common trick.', 'Never share your password.'], 'is free robux real')).toBe(
      "doesn't say free game money is always a scam",
    )
  })
})

describe("the AI's answer", () => {
  it.each([
    [['That is a trick! Never share your password.', "Don't answer them. Block and report them in the game."]],
    [["You are not in trouble. It's OK, tricks fool lots of people."]],
    [['Staying safe online means you stop and check.', 'A grown-up can help keep you safe.']],
    [['Real messages from mom do not ask for gift cards.']],
    [["Don't tap it, and don't answer it."]],
    [['Your password is just for you and your grown-ups.']],
  ])('can show %j', (lines) => {
    expect(answerProblem(lines)).toBeNull()
  })

  it.each([
    [[], 'no answer'],
    [['One.', 'Two.', 'Three.', 'Four.'], 'too many bubbles'],
    [['This is a very long bubble '.repeat(8)], 'a bubble is too long'],
    [['Go to roblox.com to check.'], 'a link'],
    [['Visit https://example.org'], 'a link'],
    [['Email help@roblox.com'], 'an email address'],
    [['Call 1-800-555-0199 for help.'], 'a phone number'],
    [['Great question! 🛡️'], 'an emoji'],
    [["That message looks safe."], 'says something is safe or real'],
    [["I can't call any Robux website safe."], 'says something is safe or real'],
    [['It is safe to ask a grown-up.'], 'says something is safe or real'],
    [["Don't worry, it's real."], 'says something is safe or real'],
    [['This one is totally legit.'], 'says something is safe or real'],
    [["It's not a scam."], 'says not to worry'],
    [['Go ahead and claim it.'], 'says not to worry'],
    [['Close the page and you can stop worrying.'], 'says not to worry'],
    [["Don't worry about it."], 'says not to worry'],
    [['Scammers could find you.'], 'scary words'],
    [['You could call the police.'], 'scary words'],
    [['My name is Sam, nice to meet you.'], 'personal details'],
  ])('throws away %j (%s)', (lines, why) => {
    expect(answerProblem(lines)).toBe(why)
  })
})
