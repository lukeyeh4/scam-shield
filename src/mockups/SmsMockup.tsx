import type { SmsContent } from '../types'
import { Field } from './Field'

export function SmsMockup({ content }: { content: SmsContent }) {
  return (
    <div className="phone">
      <div className="phone-status">
        <span>9:41</span>
        <span>📶 🔋</span>
      </div>
      <div className="sms-header">
        <div className="avatar avatar-grey">?</div>
        <Field name="sender" text={content.sender} className="sms-sender" />
      </div>
      <div className="sms-thread">
        <div className="sms-time">Text Message · Today {content.time}</div>
        <div className="bubble bubble-in">
          <Field name="message" text={content.message} />
        </div>
      </div>
      <div className="sms-input">Text Message</div>
    </div>
  )
}
