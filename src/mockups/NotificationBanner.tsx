import { Field } from './Field'

// An iPhone notification banner for a new text, as it drops down from the top of the screen.
export function NotificationBanner({ sender, text }: { sender: string; text: string }) {
  return (
    <div className="notification" role="status">
      <MessagesIcon />
      <div className="notification-content">
        <div className="notification-top">
          <Field name="notificationSender" text={sender} className="notification-sender" />
          <span className="notification-time">now</span>
        </div>
        <Field name="notificationText" text={text} className="notification-text" />
      </div>
    </div>
  )
}

function MessagesIcon() {
  return (
    <svg className="notification-icon" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="messages-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5df777" />
          <stop offset="1" stopColor="#0abe2c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="url(#messages-green)" />
      <path
        d="M20 9c-7.2 0-13 4.7-13 10.4 0 3.3 1.9 6.2 4.9 8.1-.3 1.6-1.1 3-2.3 4.1 2.3.1 4.6-.8 6.3-2.2 1.3.3 2.7.5 4.1.5 7.2 0 13-4.7 13-10.5S27.2 9 20 9z"
        fill="#fff"
      />
    </svg>
  )
}
