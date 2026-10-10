import type { ReactNode } from 'react'

// Simple line icons for the game's own menus (the fake screens draw their own).
// They're decoration: the words next to them say what each button does.
type IconProps = { className?: string }

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// A viewfinder with a magnifying glass: looking closely at a picture
export const ScanIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
    <circle cx="11" cy="11" r="4" />
    <path d="m14 14 3 3" />
  </Icon>
)

export const LearnIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="m10 9 5 3-5 3z" />
  </Icon>
)

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
)

export const MessageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" />
  </Icon>
)

export const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
)

export const QuestionIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01" />
  </Icon>
)

// Two people, a grown-up and a kid
export const GrownUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="6" r="3" />
    <path d="M4 21v-4a5 5 0 0 1 10 0v4" />
    <circle cx="17.5" cy="10.5" r="2" />
    <path d="M15 21v-2.5a2.5 2.5 0 0 1 5 0V21" />
  </Icon>
)

export const SendIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
)
