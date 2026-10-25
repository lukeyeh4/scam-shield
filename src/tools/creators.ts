import { oneSlip, plain, skeleton } from './lookalikes'

// Famous creators kids follow, whose names scammers put on fake accounts
// ("@MrBeast_Giveaway", "@MrBea5t"). Only fakes are ever caught: a handle is never
// said to be real, because real accounts get hacked, and copies can look exactly
// like them. So there's no list of real handles to keep up to date, and a handle
// that only has the creator's name (or more words, like @MrBeastGaming) gets no
// clue either way.
//
// `names` are the creator's name in plain a to z, as handles write it.

export type Creator = { name: string; names: string[] }

export const CREATORS: Creator[] = [
  { name: 'MrBeast', names: ['mrbeast'] },
  { name: 'Kai Cenat', names: ['kaicenat'] },
  { name: 'IShowSpeed', names: ['ishowspeed'] },
  { name: 'PewDiePie', names: ['pewdiepie'] },
  { name: 'Dream', names: ['dreamwastaken'] },
  { name: 'Preston', names: ['prestonplayz'] },
  { name: 'Unspeakable', names: ['unspeakable', 'unspeakablegaming'] },
  { name: 'Ninja', names: ['ninjashyper'] },
  { name: 'DanTDM', names: ['dantdm'] },
  { name: 'Markiplier', names: ['markiplier'] },
  { name: 'SSSniperWolf', names: ['sssniperwolf'] },
  { name: 'Aphmau', names: ['aphmau'] },
  { name: 'KreekCraft', names: ['kreekcraft'] },
  { name: 'Flamingo', names: ['flamingo', 'albertsstuff'] },
  { name: 'Jelly', names: ['jellyyt'] },
  { name: 'Sidemen', names: ['sidemen'] },
  { name: 'Dude Perfect', names: ['dudeperfect'] },
  { name: 'Ryan', names: ['ryanstoys', 'ryansworld'] },
]

// Words that fake accounts add to a famous name, so it looks like a prize or the
// creator's helpers: @MrBeast_Giveaway, @MrBeastOfficialTeam
const FAKE_ACCOUNT_WORDS = [
  'giveaway', 'free', 'prize', 'claim', 'winner', 'gift', 'reward', 'robux', 'vbucks', 'verify', 'unlock',
  'official', 'real', 'support', 'help', 'team', 'manager', 'money', 'cash', 'contest', 'promo', 'payout',
]

export type FakeHandle = {
  creator: Creator
  // Why it's a fake, in kid words (one sentence each)
  reason: string
}

// Whether `handle` (with or without the @) looks like a fake account of a famous
// creator: their name with a prize or helper word, or their name misspelled
export function fakeHandle(handle: string): FakeHandle | null {
  const shown = handle.replace(/^@/, '')
  // In plain a to z, without numbers after the name (real creators have @MrBeast2 too)
  const typed = skeleton(shown).replace(/[^a-z0-9]/g, '').replace(/\d+$/, '')
  const core = plain(typed)
  // Letters from another alphabet that look like ours (a Cyrillic е in mrbеast)
  const fakeLetters = skeleton(shown) !== shown.toLowerCase()
  for (const creator of CREATORS) {
    for (const name of creator.names) {
      // A number or lookalike letter (MrBea5t), or one letter off (MrBeastt, MrBaest)
      const misspelled = (core === plain(name) && (typed !== name || fakeLetters)) || (name.length >= 6 && oneSlip(core, plain(name)))
      if (misspelled) {
        return {
          creator,
          reason: `"@${shown}" isn't spelled like ${creator.name}. Fake accounts change a letter or two so they look like someone famous.`,
        }
      }
      // The name with a prize or helper word: @MrBeast_Giveaway, @MrBea5tFreeRobux
      if (core.includes(plain(name))) {
        const rest = core.replace(plain(name), ' ')
        const word = FAKE_ACCOUNT_WORDS.find((w) => rest.includes(plain(w)))
        if (word) {
          return {
            creator,
            reason: `It puts ${creator.name}'s name next to the word "${word}" to trick you. Anyone can give an account a famous name.`,
          }
        }
      }
    }
  }
  return null
}

// Account names in a message: @ then letters, numbers, dots, dashes or underscores
// (not an email address, where there's a word right before the @)
export function handlesIn(text: string) {
  return [...text.matchAll(/(?<![\w.])@([\p{L}\p{N}_.-]{2,40})/gu)].map((m) => m[1].replace(/[.-]+$/, ''))
}
