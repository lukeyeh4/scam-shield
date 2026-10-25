import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ExtraMessage, MockupType, ScenarioScreen } from '../types'
import { ChatAppMockup } from './ChatAppMockup'
import { EmailMockup } from './EmailMockup'
import { type Mark, MarksContext } from './marks'
import { MessengerMockup } from './MessengerMockup'
import { PhoneSiteMockup } from './PhoneSiteMockup'
import { ScamSiteMockup } from './ScamSiteMockup'
import { SearchMockup } from './SearchMockup'
import { ShortsMockup } from './ShortsMockup'
import { SmsMockup } from './SmsMockup'
import { WebsiteMockup } from './WebsiteMockup'

type MockupProps = {
  screen: ScenarioScreen
  // Red flags to highlight (used by the recap)
  marks?: Mark[]
  // false shows the finished screen straight away, without the arrival animation
  animate?: boolean
  // Texts added to the conversation during the recap (text-message screens only)
  extraMessages?: ExtraMessage[]
}

// Which device each fake screen is shown on
const TABLET_MOCKUPS: MockupType[] = ['chat-app', 'scam-site', 'search']

// Each device is drawn at one size (its frame and everything on its screen), then
// shrunk or grown as a whole to fit the space it has, so it always keeps its real
// shape, corners and text sizes, whatever the screen. Must match .phone and
// .tablet in index.css. A tablet can grow a little on big screens.
const DEVICES = {
  phone: { width: 300, height: 629, most: 1 },
  tablet: { width: 820, height: 570, most: 1.25 },
}

// On a phone or tablet, a fake device inside the real one looks odd, so the fake
// screens drop their frame and fill the space, as if the player were in the app
// themselves (the "bare" look). Touch screens get it, and so do narrow windows (a
// phone-sized window, or the phone demo); computers keep the fake device.
const BARE_QUERY = '(pointer: coarse), (max-width: 560px)'
// How much bigger than the drawn size the bare screens show, for realistic text
// (a tablet's apps already have phone-sized text)
const BARE_SCALE = { phone: 1.1, tablet: 1 }

type Fit = { scale: number; bare: boolean; width?: number; height?: number }

// How much to shrink or grow the device so it fits the box it's in
function useFit(device: keyof typeof DEVICES) {
  const box = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<Fit>({ scale: 1, bare: false })
  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const { width, height, most } = DEVICES[device]
    const bareQuery = window.matchMedia(BARE_QUERY)
    const update = () => {
      const space = element.getBoundingClientRect()
      if (!space.width || !space.height) return
      if (bareQuery.matches) {
        // Drawn at the size that fills the box exactly, then grown a little
        const scale = BARE_SCALE[device]
        setFit({ scale, bare: true, width: space.width / scale, height: space.height / scale })
      } else {
        setFit({ scale: Math.min(space.width / width, space.height / height, most), bare: false })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    bareQuery.addEventListener('change', update)
    return () => {
      observer.disconnect()
      bareQuery.removeEventListener('change', update)
    }
  }, [device])
  return { box, ...fit }
}

// With a mouse, dragging a fake screen's page scrolls it like a finger would, so a
// long page can be read on a computer too (touch and trackpads already scroll). A
// drag doesn't count as a tap, so it doesn't hurry Buddy or pick a clue.
function useDragScroll(box: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = box.current
    if (!element) return
    let drag: { page: HTMLElement; y: number; top: number; moved: boolean } | null = null
    const scrollable = (target: EventTarget | null) => {
      for (let e = target as HTMLElement | null; e && e !== element; e = e.parentElement) {
        const overflow = getComputedStyle(e).overflowY
        if ((overflow === 'auto' || overflow === 'scroll') && e.scrollHeight > e.clientHeight) return e
      }
      return null
    }
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      const page = scrollable(event.target)
      if (page) drag = { page, y: event.clientY, top: page.scrollTop, moved: false }
    }
    const move = (event: PointerEvent) => {
      if (!drag) return
      const distance = event.clientY - drag.y
      if (Math.abs(distance) > 4) drag.moved = true
      if (drag.moved) drag.page.scrollTop = drag.top - distance
    }
    const up = () => {
      if (drag?.moved) {
        // Swallow the click that ends the drag
        const stop = (e: MouseEvent) => e.stopPropagation()
        window.addEventListener('click', stop, { capture: true, once: true })
        setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0)
      }
      drag = null
    }
    element.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      element.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [box])
}

// Renders a scenario's fake screen. Nothing inside is a real link or button.
export function Mockup({ screen, marks = [], animate = true, extraMessages = [] }: MockupProps) {
  const device = TABLET_MOCKUPS.includes(screen.mockup) ? 'tablet' : 'phone'
  const { box, scale, bare, width, height } = useFit(device)
  useDragScroll(box)
  // The bare look sizes the phone to the box (--bare-width and --bare-height in index.css)
  const size = bare ? { '--bare-width': `${width}px`, '--bare-height': `${height}px` } : {}
  return (
    <MarksContext.Provider value={marks}>
      <div ref={box} className={`mockup mockup-${device}${bare ? ' mockup-bare' : ''}`} aria-label="The message you got">
        <div className="mockup-device" style={{ zoom: scale, ...size }}>
        {screen.mockup === 'sms' && <SmsMockup content={screen.content} animate={animate} extraMessages={extraMessages} />}
        {screen.mockup === 'chat-app' && <ChatAppMockup content={screen.content} />}
        {screen.mockup === 'messenger' && <MessengerMockup content={screen.content} />}
        {screen.mockup === 'email' && <EmailMockup content={screen.content} />}
        {screen.mockup === 'website' && <WebsiteMockup content={screen.content} />}
        {screen.mockup === 'scam-site' && <ScamSiteMockup content={screen.content} animate={animate} />}
        {screen.mockup === 'shorts' && <ShortsMockup content={screen.content} />}
        {screen.mockup === 'phone-site' && <PhoneSiteMockup content={screen.content} animate={animate} />}
        {screen.mockup === 'search' && <SearchMockup content={screen.content} />}
        </div>
      </div>
    </MarksContext.Provider>
  )
}
