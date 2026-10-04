import { useContext, useEffect, useRef, useState } from 'react'
import { reduceMotion } from '../motion'
import type { ExtraMessage, SmsContent } from '../types'
import { Field } from './Field'
import { MarksContext } from './marks'
import { NotificationBanner } from './NotificationBanner'
import { PersonIcon, PhoneFrame } from './PhoneFrame'
import { smsNotificationAt, smsTimeline } from './smsTimeline'

type SmsMockupProps = {
  content: SmsContent
  animate: boolean
  extraMessages: ExtraMessage[]
}

export function SmsMockup({ content, animate, extraMessages }: SmsMockupProps) {
  const playIn = animate && !reduceMotion()
  const total = content.messages.length
  const [delivered, setDelivered] = useState(playIn ? 0 : total)
  const [typing, setTyping] = useState(false)
  const [notified, setNotified] = useState(!playIn)
  const threadRef = useRef<HTMLDivElement>(null)
  const marks = useContext(MarksContext)

  // Without the animation (the recap), the banner only shows while it's being pointed at
  // (or is still to be found), so it doesn't cover the texts the other clues point at
  const showBanner = animate
    ? notified
    : marks.some((m) => m.target.startsWith('notification') && m.state !== 'seen')

  useEffect(() => {
    if (!playIn) return
    const timers = smsTimeline(content.messages).flatMap(({ typingAt, deliveredAt }, i) => [
      setTimeout(() => setTyping(true), typingAt),
      setTimeout(() => {
        setTyping(false)
        setDelivered(i + 1)
      }, deliveredAt),
    ])
    if (content.notification) timers.push(setTimeout(() => setNotified(true), smsNotificationAt(content)))
    return () => timers.forEach(clearTimeout)
  }, [content, playIn])

  // Like a real phone, keep the newest message (or the typing dots) in view
  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: reduceMotion() ? 'auto' : 'smooth' })
  }, [delivered, typing, extraMessages.length])

  // ...and keep it in view if the phone gets shorter, e.g. when Buddy starts talking
  useEffect(() => {
    const thread = threadRef.current
    if (!thread) return
    const observer = new ResizeObserver(() => {
      thread.scrollTop = thread.scrollHeight
    })
    observer.observe(thread)
    return () => observer.disconnect()
  }, [])

  return (
    <PhoneFrame inputLabel="Message">
      {content.notification && showBanner && (
        <NotificationBanner sender={content.notification.sender} text={content.notification.text} />
      )}
      <div className="sms-header">
        <div className="sms-avatar">
          <PersonIcon />
        </div>
        <Field name="sender" text={content.sender} className="sms-sender" />
      </div>
      <div className="sms-thread" ref={threadRef}>
        {delivered > 0 && (
          <div className={playIn ? 'sms-time sms-arrive-fade' : 'sms-time'}>
            Text Message
            <br />
            Today {content.time}
          </div>
        )}
        {content.messages.slice(0, delivered).map((message, i) => (
          // Only the newest message in a row has the curled tail, like a real phone
          <div
            key={i}
            className={`bubble bubble-in ${playIn ? 'sms-arrive-pop' : ''} ${i === delivered - 1 ? '' : 'bubble-no-tail'}`}
          >
            <Field name={`message${i + 1}`} text={message} />
          </div>
        ))}
        {/* Added in the recap: each pops in a moment after the one before */}
        {extraMessages.map((m, i) => (
          <div
            key={`extra-${i}`}
            className={`bubble ${m.from === 'me' ? 'bubble-out' : 'bubble-in'} sms-arrive-pop`}
            style={{ animationDelay: `${i * 1.4}s` }}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="typing-indicator" aria-label="Typing">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </PhoneFrame>
  )
}
