export type Choice = 'do' | 'ignore' | 'tell'
export type Result = 'red' | 'yellow' | 'green'
export type Mood = 'happy' | 'curious' | 'thinking' | 'worried' | 'cheering' | 'neutral'

export type SmsContent = {
  sender: string
  time: string
  message: string
}

export type GameChatContent = {
  game: string
  channel: string
  friend: string
  friendMessage: string
  player: string
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

// Each mock-up type has its own content fields; recap targets name one of them.
export type ScenarioScreen =
  | { mockup: 'sms'; content: SmsContent }
  | { mockup: 'game-chat'; content: GameChatContent }
  | { mockup: 'messenger'; content: MessengerContent }
  | { mockup: 'email'; content: EmailContent }
  | { mockup: 'website'; content: WebsiteContent }

export type MockupType = ScenarioScreen['mockup']

export type RecapItem = {
  target: string
  highlight?: string
  text: string
}

export type Scenario = ScenarioScreen & {
  id: string
  title: string
  outcomes: Record<Choice, { result: Result; text: string }>
  buddy: {
    intro: string
    reactions: Record<Choice, { mood: Mood; text: string }>
  }
  recap: {
    stop: RecapItem
    check: RecapItem[]
    tell: string
  }
}
