import type { ScenarioScreen } from '../types'
import { EmailMockup } from './EmailMockup'
import { GameChatMockup } from './GameChatMockup'
import { type Mark, MarksContext } from './Field'
import { MessengerMockup } from './MessengerMockup'
import { SmsMockup } from './SmsMockup'
import { WebsiteMockup } from './WebsiteMockup'

// Renders a scenario's fake screen. Nothing inside is a real link or button.
export function Mockup({ screen, marks = [] }: { screen: ScenarioScreen; marks?: Mark[] }) {
  return (
    <MarksContext.Provider value={marks}>
      <div className="mockup" aria-label="The message you got">
        {screen.mockup === 'sms' && <SmsMockup content={screen.content} />}
        {screen.mockup === 'game-chat' && <GameChatMockup content={screen.content} />}
        {screen.mockup === 'messenger' && <MessengerMockup content={screen.content} />}
        {screen.mockup === 'email' && <EmailMockup content={screen.content} />}
        {screen.mockup === 'website' && <WebsiteMockup content={screen.content} />}
      </div>
    </MarksContext.Provider>
  )
}
