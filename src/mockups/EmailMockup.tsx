import type { EmailContent } from '../types'
import { Field } from './Field'

export function EmailMockup({ content }: { content: EmailContent }) {
  return (
    <div className="email">
      <div className="email-toolbar">📥 Inbox</div>
      <Field name="subject" text={content.subject} className="email-subject" />
      <div className="email-from">
        <div className="avatar avatar-blue">{content.fromName.charAt(0)}</div>
        <div>
          <div className="email-from-name">{content.fromName}</div>
          <Field name="fromAddress" text={`<${content.fromAddress}>`} className="email-address" />
          <div className="email-to">to me · {content.time}</div>
        </div>
      </div>
      <Field name="body" text={content.body} className="email-body" />
      <div className="email-button-row">
        <Field name="button" text={content.button} className="fake-button email-button" />
      </div>
      <div className="email-signature">{content.signature}</div>
    </div>
  )
}
