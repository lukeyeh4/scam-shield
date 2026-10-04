import type { ChatAppContent } from '../types'
import { Field } from './Field'
import { TabletFrame } from './TabletFrame'

// Colours for the blurred-out servers and people, so only the stranger stands out
const BLURRED_SERVERS = ['#e9a23b', '#7d8ea8', '#d9534f', '#3fae8c']
const BLURRED_PEOPLE = ['#c97b63', '#4b8fa8', '#8a6fb5']

// A simplified desktop chat app (like Discord) showing a direct message from a stranger.
export function ChatAppMockup({ content }: { content: ChatAppContent }) {
  // The sender's profile picture: their image if they have one, otherwise their first letter
  const avatarClass = content.avatar ? 'chat-avatar chat-avatar-image' : 'chat-avatar'
  const picture = content.avatar ? <img src={content.avatar} alt="" /> : content.sender.charAt(0)

  return (
    <TabletFrame dark>
      <div className="chat">
        <nav className="chat-servers" aria-hidden="true">
          <span className="chat-home">
            <ChatIcon />
          </span>
          <span className="chat-divider" />
          {BLURRED_SERVERS.map((color) => (
            <span key={color} className="chat-server blurred" style={{ background: color }} />
          ))}
          <span className="chat-add">+</span>
        </nav>

        <aside className="chat-sidebar" aria-hidden="true">
          <div className="chat-search">Find or start a conversation</div>
          <div className="chat-nav-item">
            <FriendsIcon />
            Friends
          </div>
          <div className="chat-section">Direct Messages</div>
          <BlurredPerson color={BLURRED_PEOPLE[0]} />
          <div className="chat-dm is-selected">
            <span className={`${avatarClass} chat-avatar-small`}>{picture}</span>
            <span className="chat-dm-name">{content.sender}</span>
          </div>
          <BlurredPerson color={BLURRED_PEOPLE[1]} />
          <BlurredPerson color={BLURRED_PEOPLE[2]} />
          <div className="chat-me">
            <span className="chat-avatar chat-avatar-small blurred" style={{ background: '#5865f2' }} />
            <span className="blurred-bar blurred" />
          </div>
        </aside>

        <section className="chat-main">
          <header className="chat-header">
            <span className="chat-at">@</span>
            <Field name="sender" text={content.sender} className="chat-header-name" />
            <span className="chat-online" />
          </header>

          <div className="chat-messages">
            <div className="chat-welcome">
              <span className={`${avatarClass} chat-avatar-large`}>{picture}</span>
              <div className="chat-welcome-name">{content.sender}</div>
              <p className="chat-welcome-text">
                This is the beginning of your direct message history with <strong>@{content.sender}</strong>.
              </p>
            </div>

            <div className="chat-message">
              <span className={avatarClass}>{picture}</span>
              <div>
                <div className="chat-meta">
                  <span className="chat-name">{content.sender}</span>
                  <span className="chat-time">{content.time}</span>
                </div>
                <p className="chat-text">
                  <Field name="message" text={content.message} />
                </p>
                <Field name="link" text={content.link} className="chat-link" />
              </div>
            </div>
          </div>

          <div className="chat-input" aria-hidden="true">
            <span className="chat-input-plus">+</span>
            Message @{content.sender}
          </div>
        </section>
      </div>
    </TabletFrame>
  )
}

function BlurredPerson({ color }: { color: string }) {
  return (
    <div className="chat-dm">
      <span className="chat-avatar chat-avatar-small blurred" style={{ background: color }} />
      <span className="blurred-bar blurred" />
    </div>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h0.5A2.5 2.5 0 0 1 4 13.5z"
        fill="currentColor"
      />
      <circle cx="9" cy="9.5" r="1.4" fill="#5865f2" />
      <circle cx="15" cy="9.5" r="1.4" fill="#5865f2" />
    </svg>
  )
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" fill="currentColor" />
      <path d="M2.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="currentColor" />
      <circle cx="17" cy="9" r="2.6" fill="currentColor" opacity="0.6" />
      <path d="M16 13.2c3.2.1 5.5 2.3 5.5 5.8H17" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
