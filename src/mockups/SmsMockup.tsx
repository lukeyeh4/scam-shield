import { useEffect, useRef, useState } from 'react'
import { reduceMotion } from '../motion'
import type { SmsContent } from '../types'
import { Field } from './Field'
import { NotificationBanner } from './NotificationBanner'
import { PersonIcon, PhoneFrame } from './PhoneFrame'
import { smsNotificationAt, smsTimeline } from './smsTimeline'

export function SmsMockup({ content }: { content: SmsContent }) {
  const total = content.messages.length
  const [delivered, setDelivered] = useState(() => (reduceMotion() ? total : 0))
  const [typing, setTyping] = useState(false)
  const [notified, setNotified] = useState(() => reduceMotion())
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduceMotion()) return
    const timers = smsTimeline(content.messages).flatMap(({ typingAt, deliveredAt }, i) => [
      setTimeout(() => setTyping(true), typingAt),
      setTimeout(() => {
        setTyping(false)
        setDelivered(i + 1)
      }, deliveredAt),
    ])
    if (content.notification) timers.push(setTimeout(() => setNotified(true), smsNotificationAt(content)))
    return () => timers.forEach(clearTimeout)
  }, [content])

  // Like a real phone, keep the newest message (or the typing dots) in view
  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: reduceMotion() ? 'auto' : 'smooth' })
  }, [delivered, typing])

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
      {content.notification && notified && (
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
          <div className="sms-time sms-arrive-fade">
            Text Message
            <br />
            Today {content.time}
          </div>
        )}
        {content.messages.slice(0, delivered).map((message, i) => (
          // Only the newest message in a row has the curled tail, like a real phone
          <div key={i} className={`bubble bubble-in sms-arrive-pop ${i === delivered - 1 ? '' : 'bubble-no-tail'}`}>
            <Field name={`message${i + 1}`} text={message} />
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
