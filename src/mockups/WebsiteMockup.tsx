import type { WebsiteContent } from '../types'
import { Field } from './Field'

export function WebsiteMockup({ content }: { content: WebsiteContent }) {
  return (
    <div className="browser">
      <div className="browser-bar">
        <span className="browser-dots">● ● ●</span>
        <span className="browser-url">
          🔒 <Field name="url" text={content.url} />
        </span>
      </div>
      <div className="site">
        <div className="site-header">🛍️ {content.store}</div>
        <div className="site-product">
          <div className="site-image" aria-hidden="true">👟</div>
          <div className="site-product-name">{content.product}</div>
          <div>
            <s className="site-old-price">{content.oldPrice}</s> <span className="site-price">{content.price}</span>
          </div>
        </div>
        <div className="popup">
          <Field name="popupTitle" text={content.popupTitle} className="popup-title" />
          <Field name="timer" text={content.timer} className="popup-timer" />
          <Field name="popupText" text={content.popupText} className="popup-text" />
          <span className="fake-button popup-button">{content.popupButton}</span>
        </div>
      </div>
    </div>
  )
}
