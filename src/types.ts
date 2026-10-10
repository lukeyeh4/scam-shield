export type Choice = 'do' | 'ignore' | 'tell'
export type Result = 'red' | 'yellow' | 'green'
export type Mood = 'happy' | 'curious' | 'thinking' | 'worried' | 'cheering' | 'neutral'

export type SmsContent = {
  sender: string
  time: string
  // Separate texts, in order. Recap targets name them message1, message2, ...
  messages: string[]
  // A notification banner from someone else that drops down after the last text.
  // Recap targets name its parts notificationSender and notificationText.
  notification?: { sender: string; text: string }
}

// A direct message in a chat app, from someone you don't know
export type ChatAppContent = {
  sender: string
  // An image in /public for the sender's profile picture (otherwise their first letter)
  avatar?: string
  time: string
  message: string
  link: string
}

export type MessengerContent = {
  app: string
  sender: string
  handle: string
  accountNote: string
  message: string
  message2: string
}

export type EmailContent = {
  fromName: string
  fromAddress: string
  subject: string
  time: string
  body: string
  button: string
  signature: string
}

export type WebsiteContent = {
  url: string
  store: string
  product: string
  oldPrice: string
  price: string
  popupTitle: string
  timer: string
  popupText: string
  popupButton: string
}

// A scam website, shown in Safari on an iPad. Everything on it is drawn,
// not real form fields, so nothing typed can go anywhere.
export type ScamSiteContent = {
  url: string
  brand: string
  // An image in /public for the site's logo, shown white on the dark page
  logo?: string
  heading: string
  text: string
  usernameLabel: string
  passwordLabel: string
  button: string
  note: string
}

// One search result: the site's name and address, the blue title, and the snippet under it.
// `icon` is an image in /public for the site's little round icon; `iconFill` makes the
// image fill the whole circle instead of sitting on white.
export type SearchResult = { site: string; url: string; title: string; text: string; icon?: string; iconFill?: boolean }

// Search results in Safari on an iPad, with a sponsored ad at the top.
// Recap targets: query, adLabel, adSite, adUrl, adTitle, adText, and result1, result2, ...
// (each result's title).
export type SearchContent = {
  query: string
  ad: SearchResult
  results: SearchResult[]
}

// A scam website in Safari on a phone (address bar at the bottom, like an iPhone).
// Everything on it is drawn, not real form fields, so nothing typed can go anywhere.
export type PhoneSiteContent = {
  url: string
  brand: string
  // An image in /public for the site's round logo
  logo?: string
  prize: string
  heading: string
  // The order summary: what you "get" and what you pay
  summary: { label: string; value: string }[]
  total: string
  paymentLabel: string
  // A line under the payment heading, e.g. why the site "needs" a card
  note?: string
  button: string
  comments: { name: string; text: string }[]
}

// A YouTube Shorts video on a phone. Recap targets can point at the video
// itself with "video".
export type ShortsContent = {
  channel: string
  // Images in /public: the channel's profile picture and the video's picture
  avatar?: string
  video?: string
  caption: string
  link: string
  comments: string
  remixes: string
}

// Each mock-up type has its own content fields; recap targets name one of them.
export type ScenarioScreen =
  | { mockup: 'sms'; content: SmsContent }
  | { mockup: 'chat-app'; content: ChatAppContent }
  | { mockup: 'messenger'; content: MessengerContent }
  | { mockup: 'email'; content: EmailContent }
  | { mockup: 'website'; content: WebsiteContent }
  | { mockup: 'scam-site'; content: ScamSiteContent }
  | { mockup: 'shorts'; content: ShortsContent }
  | { mockup: 'phone-site'; content: PhoneSiteContent }
  | { mockup: 'search'; content: SearchContent }

export type MockupType = ScenarioScreen['mockup']

export type RecapItem = {
  // 'doIt' points at the screen "Do it" leads to (e.g. the scam website) instead of the scam itself
  screen?: 'doIt'
  target: string
  highlight?: string
  text: string
  // A short name for the clue on the "Spot the clues" checklist, e.g. "Someone rushing you".
  // Only clues with one are on the list (about 3 per scenario, the easiest to see).
  spot?: string
  // Other places on the scam screen that also count as finding this clue in
  // "Spot the clues" (e.g. both the caption and the video for "A free prize")
  spotAlso?: { target: string; highlight?: string }[]
  // What Shield Buddy says when the player asks for a hint about this clue: a gentle
  // nudge towards where to look, without giving the answer away
  spotHint?: string
}

// A text added to the phone during the recap, from the player ('me') or the scammer ('them')
export type ExtraMessage = { from: 'me' | 'them'; text: string }

// What to remember from a scenario, shown on a card at the very end of the recap:
// what you can do (`solution`) and "Make sure to avoid" (`checks`)
export type RecapSummary = {
  solution: string
  // Short warning signs to look out for next time
  checks: string[]
}

// What you can do instead, at the end of the Tell step (e.g. a family code word)
export type RecapTip = {
  label: string
  buddy: string[]
  // Part of the scam screen to highlight while Buddy explains
  target?: string
  highlight?: string
  // Texts that appear on the phone while Buddy explains (text-message scenarios)
  phone?: ExtraMessage[]
}

export type Scenario = ScenarioScreen & {
  id: string
  title: string
  outcomes: Record<Choice, { result: Result; text: string }>
  // Finishes "What if you had…" for each choice, e.g. "clicked the link"
  whatIf?: Record<Choice, string>
  buddy: {
    intro: string
    // Before the choice, in simple words: what's happening, then what the player
    // could do. Both stay neutral: no hints about which choice is safest.
    explain?: string
    choices?: string
    reactions: Record<Choice, { mood: Mood; text: string }>
  }
  recap: {
    stop: RecapItem
    check: RecapItem[]
    tell: string
    tip?: RecapTip
    // The last step: a short summary card to remember
    summary?: RecapSummary
  }
  // Optional extra step after "Do it": where the scam takes you (e.g. a website),
  // with what Shield Buddy says there
  doIt?: ScenarioScreen & { buddy: string[] }
}
