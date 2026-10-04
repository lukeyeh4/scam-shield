import type { ScamSiteContent } from '../types'
import { Field } from './Field'
import { SafariBar } from './SafariBar'
import { TabletFrame } from './TabletFrame'
import './scamSite.css'

// A fake "you won" prize website in Safari on an iPad, made to look official.
// Nothing here is a real form field or button, so nothing typed can go anywhere.
// `animate` plays the page loading in; the recap shows it straight away.
export function ScamSiteMockup({ content, animate }: { content: ScamSiteContent; animate: boolean }) {
  return (
    <TabletFrame dark>
      <div className={animate ? 'safari safari-loading-in' : 'safari'}>
        <SafariBar url={content.url} notSecure />

        <div className="scam-page">
          <div className="scam-brand">
            {content.logo && <img className="scam-brand-logo" src={content.logo} alt="" />}
            <Field name="brand" text={content.brand} />
          </div>

          <div className="scam-card">
            <Field name="heading" text={content.heading} className="scam-heading" />
            <p className="scam-text">{content.text}</p>
            <Field name="usernameLabel" text={content.usernameLabel} className="scam-label" />
            <span className="scam-input" />
            <Field name="passwordLabel" text={content.passwordLabel} className="scam-label" />
            <span className="scam-input" />
            <span className="scam-button">{content.button}</span>
            <span className="scam-note">
              <ClockIcon />
              {content.note}
            </span>
          </div>
        </div>
      </div>
    </TabletFrame>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
