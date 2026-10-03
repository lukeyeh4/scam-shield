import type { ReactNode } from 'react'

// A modern smartphone: black bezel, camera notch, status bar, home bar.
// `inputLabel` is the placeholder in the message box at the bottom.
export function PhoneFrame({ children, inputLabel }: { children: ReactNode; inputLabel: string }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">9:41</span>
          <span className="phone-island" />
          <span className="phone-icons">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </span>
        </div>

        {children}

        <div className="phone-compose" aria-hidden="true">
          <CameraIcon />
          <span className="phone-input">{inputLabel}</span>
        </div>
        <span className="phone-home-bar" aria-hidden="true" />
      </div>
    </div>
  )
}

export function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="4" fill="currentColor" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor" />
    </svg>
  )
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 18 12" width="16" height="11">
      <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
      <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" width="15" height="11">
      <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .3 10.6 10.6 0 0 0 .7 3.2L2 4.6a8.6 8.6 0 0 1 6-2.4z" fill="currentColor" />
      <path d="M8 5.9c1.3 0 2.5.5 3.4 1.3l1.3-1.4A7 7 0 0 0 8 4a7 7 0 0 0-4.7 1.8l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3z" fill="currentColor" />
      <circle cx="8" cy="10" r="1.8" fill="currentColor" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 27 12" width="24" height="11">
      <rect x="0.5" y="0.5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor" />
      <path d="M25 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg className="phone-camera" viewBox="0 0 28 22" width="28" height="22">
      <path
        d="M9.5 1h9l1.8 3H25a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4.7z"
        fill="currentColor"
      />
      <circle cx="14" cy="12.5" r="5" fill="#fff" />
      <circle cx="14" cy="12.5" r="3.2" fill="currentColor" />
    </svg>
  )
}
