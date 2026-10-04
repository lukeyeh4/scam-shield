import type { ReactNode } from 'react'
import { BatteryIcon, WifiIcon } from './PhoneFrame'

// A modern iPad held sideways: even black bezel, front camera on the top edge,
// iPadOS status bar and home bar. Scales as a whole to fit its space.
// `dark` is for apps with a dark background, so the status bar turns white.
export function TabletFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? 'tablet tablet-dark' : 'tablet'}>
      <span className="tablet-camera" aria-hidden="true" />
      <div className="tablet-screen">
        <div className="tablet-status" aria-hidden="true">
          <span>
            9:41 <span className="tablet-date">Mon Oct 3</span>
          </span>
          <span className="tablet-icons">
            <WifiIcon />
            <span className="tablet-battery-level">100%</span>
            <BatteryIcon />
          </span>
        </div>
        <div className="tablet-content">{children}</div>
        <span className="tablet-home-bar" aria-hidden="true" />
      </div>
    </div>
  )
}
