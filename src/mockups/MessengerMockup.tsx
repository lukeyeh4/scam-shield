import type { MessengerContent } from '../types'
import { Field } from './Field'

export function MessengerMockup({ content }: { content: MessengerContent }) {
  return (
    <div className="phone">
      <div className="phone-status">
        <span>9:41</span>
        <span>📶 🔋</span>
      </div>
      <div className="messenger-app">{content.app}</div>
      <div className="messenger-header">
        <div className="avatar avatar-purple">{content.sender.charAt(0)}</div>
        <div>
          <div className="messenger-name">{content.sender}</div>
          <div className="messenger-handle">{content.handle}</div>
        </div>
      </div>
      <div className="messenger-note">
        <Field name="accountNote" text={content.accountNote} />
      </div>
      <div className="sms-thread">
        <div className="bubble bubble-in">
          <Field name="message" text={content.message} />
        </div>
        <div className="bubble bubble-in">
          <Field name="message2" text={content.message2} />
        </div>
      </div>
      <div className="sms-input">Message…</div>
    </div>
  )
}
