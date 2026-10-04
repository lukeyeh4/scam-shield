import type { ReactNode } from 'react'
import type { ShortsContent } from '../types'
import { Field } from './Field'
import { useMark } from './marks'
import { PhoneFrame } from './PhoneFrame'
import './shorts.css'

// A YouTube Shorts video, as it looks in the app. Nothing here is a real button or link.
export function ShortsMockup({ content }: { content: ShortsContent }) {
  const [videoClass, videoRef] = useMark<HTMLSpanElement>('video')

  return (
    <PhoneFrame dark>
      <div className="shorts">
        <div className="shorts-video">
          {content.video && (
            <>
              {/* A square video in Shorts: the whole picture, over a blurred copy that fills the screen */}
              <img className="shorts-backdrop" src={content.video} alt="" />
              <span ref={videoRef} className={`shorts-picture ${videoClass}`}>
                <img src={content.video} alt="The video" />
              </span>
            </>
          )}

          <div className="shorts-top" aria-hidden="true">
            <SearchIcon />
            <MoreIcon />
          </div>

          <div className="shorts-actions" aria-hidden="true">
            <Action icon={<ThumbIcon />} label="Like" />
            <Action icon={<ThumbIcon down />} label="Dislike" />
            <Action icon={<CommentIcon />} label={content.comments} />
            <Action icon={<ShareIcon />} label="Share" />
            <Action icon={<RemixIcon />} label={content.remixes} />
            {/* The sound's thumbnail: a blurred bit of the video, for colour */}
            {content.video ? (
              <img className="shorts-sound" src={content.video} alt="" />
            ) : (
              <span className="shorts-sound" />
            )}
          </div>

          <div className="shorts-info">
            <span className="shorts-link">
              <LinkIcon />
              <Field name="link" text={content.link} />
            </span>
            <div className="shorts-channel">
              {/* The profile picture counts as the channel name in "Spot the clues" */}
              {content.avatar ? (
                <img className="shorts-avatar" src={content.avatar} alt="" data-field="channel" />
              ) : (
                <span className="shorts-avatar" data-field="channel" />
              )}
              <Field name="channel" text={content.channel} className="shorts-handle" />
              <span className="shorts-subscribe">Subscribe</span>
            </div>
            <Field name="caption" text={content.caption} className="shorts-caption" />
          </div>
        </div>

        <nav className="shorts-nav" aria-hidden="true">
          <NavItem icon={<HomeIcon />} label="Home" />
          <NavItem icon={<ShortsIcon />} label="Shorts" />
          <span className="shorts-create">
            <PlusIcon />
          </span>
          <NavItem icon={<SubscriptionsIcon />} label="Subscriptions" />
          <NavItem icon={<span className="shorts-you" />} label="You" />
        </nav>
      </div>
    </PhoneFrame>
  )
}

function Action({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="shorts-action">
      {icon}
      <span>{label}</span>
    </span>
  )
}

function NavItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="shorts-nav-item">
      {icon}
      <span>{label}</span>
    </span>
  )
}

// Outline icons in the style of the YouTube app
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="10.5" cy="10.5" r="6.5" {...stroke} strokeWidth={2.2} />
      <path d="m15.5 15.5 5 5" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  )
}

function ThumbIcon({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" style={down ? { transform: 'scaleY(-1)' } : undefined}>
      <path d="M7 10v10H4V10zM7 10l4-7c1.4 0 2.3 1.1 2 2.4L12.4 9H19a2 2 0 0 1 2 2.3l-1.2 6.9A2 2 0 0 1 17.8 20H7" {...stroke} />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path d="M4 5h16v11H9l-5 4z" {...stroke} />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path d="M14 5l7 7-7 7v-4c-5 0-8 1.5-11 5 1-5.5 4-10 11-11z" {...stroke} />
    </svg>
  )
}

function RemixIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <path d="M19 12a7 7 0 0 1-12.4 4.4M5 12a7 7 0 0 1 12.4-4.4" {...stroke} />
      <path d="M17.6 3.6v4h-4M6.4 20.4v-4h4" {...stroke} />
      <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" {...stroke} />
    </svg>
  )
}

// The Shorts mark: a rounded, slanted shape with a play triangle
function ShortsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path
        d="M16.8 3.4a3.6 3.6 0 0 1 1.6 6.6l-1.3.7a3.6 3.6 0 0 1 .2 6.3l-6.1 3.3a3.6 3.6 0 0 1-3.6-6.3l1.3-.7a3.6 3.6 0 0 1-.2-6.3l6.1-3.3a3.6 3.6 0 0 1 2-.3z"
        fill="currentColor"
      />
      <path d="m10.3 9.4 4.6 2.6-4.6 2.6z" fill="#0f0f0f" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M12 5v14M5 12h14" {...stroke} strokeWidth={2} />
    </svg>
  )
}

function SubscriptionsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect x="3.5" y="8" width="17" height="12" rx="2" {...stroke} />
      <path d="M6 5h12M8 2.5h8" {...stroke} />
      <path d="m10.5 11.5 4 2.5-4 2.5z" fill="currentColor" />
    </svg>
  )
}
