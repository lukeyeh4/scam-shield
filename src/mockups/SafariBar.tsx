import { Field } from './Field'
import './safari.css'

// Safari's toolbar on an iPad (dark): back, forward and bookmarks; the address bar
// with aA, the address and reload; then share, new tab and tabs.
// Put it inside an element with the `safari` class; add `safari-loading-in` to that
// element to play the blue loading bar. `notSecure` shows Safari's warning instead
// of the lock. Use it in a dark TabletFrame so the status bar matches.
export function SafariBar({ url, notSecure = false }: { url: string; notSecure?: boolean }) {
  return (
    <div className="safari-bar">
      <span className="safari-buttons" aria-hidden="true">
        <ChevronIcon />
        <ChevronIcon flip disabled />
        <BookIcon />
      </span>
      <div className="safari-address">
        <span className="safari-aa" aria-hidden="true">
          <small>A</small>A
        </span>
        <span className="safari-url-group">
          {notSecure ? (
            <>
              <WarningIcon />
              <span className="safari-not-secure">Not Secure</span>
            </>
          ) : (
            <LockIcon />
          )}
          <Field name="url" text={url} className="safari-url" />
        </span>
        <ReloadIcon />
        <span className="safari-loading" aria-hidden="true" />
      </div>
      <span className="safari-buttons" aria-hidden="true">
        <ShareIcon />
        <PlusIcon />
        <TabsIcon />
      </span>
    </div>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function ChevronIcon({ flip = false, disabled = false }: { flip?: boolean; disabled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className={disabled ? 'safari-disabled' : undefined}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M15 4 7 12l8 8" {...stroke} strokeWidth={2.4} />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6zM12 6v14.5" {...stroke} />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" {...stroke} />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M12 5v14M5 12h14" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

function TabsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <rect x="7" y="3" width="14" height="14" rx="2.5" {...stroke} />
      <path d="M17 21H5.5A2.5 2.5 0 0 1 3 18.5V7" {...stroke} />
    </svg>
  )
}

function ReloadIcon() {
  return (
    <svg className="safari-reload" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4" {...stroke} />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="safari-lock" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="safari-warning" viewBox="0 0 20 18" width="13" height="12" aria-hidden="true">
      <path d="M10 1 19 17H1z" fill="currentColor" />
      <rect x="9" y="6" width="2" height="6" rx="1" fill="#3a3a3c" />
      <circle cx="10" cy="14.3" r="1.1" fill="#3a3a3c" />
    </svg>
  )
}
