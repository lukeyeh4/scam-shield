import type { PhoneSiteContent } from '../types'
import { Field } from './Field'
import { useMark } from './marks'
import { PhoneFrame } from './PhoneFrame'
import './phoneSite.css'

// Comment avatars: blurred colours, so they look like real people without showing anyone
const COMMENT_COLORS = ['#f4a259', '#5b8e7d']

// A fake "you won" prize website in Safari on a phone. Nothing here is a real form
// field or button, so nothing typed can go anywhere. `animate` plays the page
// loading in; the recap shows it straight away.
export function PhoneSiteMockup({ content, animate }: { content: PhoneSiteContent; animate: boolean }) {
  const [commentsClass, commentsRef] = useMark<HTMLDivElement>('comments')
  const [summaryClass, summaryRef] = useMark<HTMLDivElement>('summary')

  return (
    <PhoneFrame>
      <div className={animate ? 'msite msite-loading-in' : 'msite'}>
        <div className="msite-page">
          <header className="msite-header">
            {content.logo && <img className="msite-logo" src={content.logo} alt="" />}
            <span className="msite-brand">{content.brand}</span>
            <CheckBadge />
          </header>

          <div className="msite-card" aria-hidden="true">
            {content.logo && <img className="msite-card-logo" src={content.logo} alt="" />}
            <span className="msite-card-amount">{content.prize}</span>
            <span className="msite-card-label">GIFT CARD</span>
          </div>

          <Field name="heading" text={content.heading} className="msite-heading" />

          <div ref={summaryRef} className={`msite-summary ${summaryClass}`}>
            {content.summary.map((row) => (
              <div key={row.label} className="msite-summary-row">
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
            <div className="msite-summary-row msite-summary-total">
              <span>Total</span>
              <span>{content.total}</span>
            </div>
          </div>

          <span className="msite-section">{content.paymentLabel}</span>
          <span className="msite-input">Card number</span>
          <div className="msite-row">
            <span className="msite-input">MM / YY</span>
            <span className="msite-input">CVV</span>
          </div>
          <span className="msite-button">{content.button}</span>

          <div ref={commentsRef} className={`msite-comments ${commentsClass}`}>
            {content.comments.map((c, i) => (
              <p key={c.name} className="msite-comment">
                <span className="msite-comment-avatar" style={{ background: COMMENT_COLORS[i % COMMENT_COLORS.length] }} />
                <span>
                  <strong>{c.name}</strong> {c.text}
                </span>
              </p>
            ))}
          </div>
        </div>

        {/* Safari's address bar and toolbar sit at the bottom on an iPhone */}
        <div className="msafari">
          <div className="msafari-address">
            <span className="msafari-aa">AA</span>
            <Field name="url" text={content.url} className="msafari-url" />
            <ReloadIcon />
            <span className="msafari-loading" aria-hidden="true" />
          </div>
          <div className="msafari-toolbar" aria-hidden="true">
            <ChevronIcon />
            <ChevronIcon flip />
            <ShareIcon />
            <BookIcon />
            <TabsIcon />
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

// A blue "verified" check mark, which anyone can put on a website
function CheckBadge() {
  return (
    <svg className="msite-check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1d9bf0" />
      <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function ChevronIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M15 4 7 12l8 8" {...stroke} />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" {...stroke} />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6zM12 6v14.5" {...stroke} />
    </svg>
  )
}

function TabsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect x="7" y="3" width="14" height="14" rx="2.5" {...stroke} />
      <path d="M17 21H5.5A2.5 2.5 0 0 1 3 18.5V7" {...stroke} />
    </svg>
  )
}

function ReloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4" {...stroke} />
    </svg>
  )
}
