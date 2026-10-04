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

// Renders a scenario's fake screen. Nothing inside is a real link or button.
export function Mockup({ screen, marks = [], animate = true, extraMessages = [] }: MockupProps) {
  const device = TABLET_MOCKUPS.includes(screen.mockup) ? 'mockup-tablet' : ''
  return (
    <MarksContext.Provider value={marks}>
      <div className={`mockup ${device}`} aria-label="The message you got">
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
    </MarksContext.Provider>
  )
}
