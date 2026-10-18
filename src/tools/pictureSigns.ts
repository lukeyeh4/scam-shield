import type { Box } from './examples'

// What the picture check's server (worker/src/picture.ts) can say about a
// picture, shared by the app and the Worker. The app has the kid words for each
// sign (pictureLookup.ts).

// The warning signs Claude can name
export const SIGNS = [
  'asks for a password or login code',
  'asks for money, gift cards or card details',
  'asks for personal details',
  'asks for photos or videos of you',
  'free prize or free game money',
  'sad story to get you to buy or give money',
  'pretends to be a company, game or famous person',
  'pretends to be family or a friend',
  'rushes you',
  'threatens you',
  'asks you to move to another app or keep a secret',
  'wants you to download something',
] as const

export type Sign = (typeof SIGNS)[number]

export const isSign = (sign: string): sign is Sign => (SIGNS as readonly string[]).includes(sign)

// What the server answers about a picture
export type PictureFacts = {
  // Clear enough to read what it says
  readable: boolean
  kind: 'text message' | 'chat or game chat' | 'email' | 'website' | 'ad or pop-up' | 'social media post' | 'video' | 'other'
  // Each warning sign, with the exact words and a box around them (0 to 1000)
  signs: { sign: Sign; words: string; box: Box }[]
  // Web addresses written in the picture, as written, with a box around each
  links: { address: string; box: Box }[]
  // Someone threatens the child or asks for photos of them
  threatOrPhotos: boolean
}
