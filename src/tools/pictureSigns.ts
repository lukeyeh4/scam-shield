import type { Box } from './examples'

// What the server can say about a picture (worker/src/picture.ts) or a message
// (worker/src/message.ts), shared by the app and the Worker. The app has the kid
// words for each sign (pictureLookup.ts).

// The warning signs Claude can name
export const SIGNS = [
  'asks for a password or login code',
  'asks for money, gift cards or card details',
  'asks for personal details',
  'asks for photos or videos of you',
  'free prize or free game money',
  'sad story to get you to buy or give money',
  'product that may not look like the photo',
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
  // Claude wouldn't look at the picture (its safety rules), so it may show
  // something that isn't OK for kids: the app says "Show a grown-up right now"
  declined?: boolean
}

// What the server answers about a message: the same signs, with the exact words
// that show each (to highlight) instead of boxes
export type MessageFacts = {
  kind: 'text message' | 'chat or game chat' | 'email' | 'social media post' | 'other'
  signs: { sign: Sign; words: string }[]
  // Web addresses in the message, as written
  links: string[]
  threatOrPhotos: boolean
  // Claude wouldn't read it (see PictureFacts)
  declined?: boolean
}
