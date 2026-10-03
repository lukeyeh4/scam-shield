import type { SmsContent } from '../types'

// Like real incoming texts: for each message, the "typing…" dots show, then it pops in.
const FIRST_TYPING_AT_MS = 500
const PAUSE_BETWEEN_MS = 600
const POP_IN_MS = 450

// Longer messages take a little longer to "type"
const typingTime = (message: string) => Math.min(1600, Math.max(900, 400 + message.length * 15))

// When each message's typing dots appear and when it's delivered, in ms from the start
export function smsTimeline(messages: string[]) {
  let t = FIRST_TYPING_AT_MS
  return messages.map((message) => {
    const typingAt = t
    const deliveredAt = t + typingTime(message)
    t = deliveredAt + PAUSE_BETWEEN_MS
    return { typingAt, deliveredAt }
  })
}

// A notification banner drops down this long after the last text
const NOTIFICATION_AFTER_MS = 1500
const BANNER_SLIDE_MS = 500

export function smsNotificationAt(content: SmsContent) {
  const timeline = smsTimeline(content.messages)
  return timeline[timeline.length - 1].deliveredAt + NOTIFICATION_AFTER_MS
}

// When everything has finished arriving: the last text, then any notification
export function smsArrivalMs(content: SmsContent) {
  if (content.notification) return smsNotificationAt(content) + BANNER_SLIDE_MS
  const timeline = smsTimeline(content.messages)
  return timeline[timeline.length - 1].deliveredAt + POP_IN_MS
}
