import { Buddy } from '../buddy/Buddy'
import { IMAGES } from '../buddy/moods'
import { LearnIcon } from '../icons'
import { MenuTile, ScanCard } from './MenuCards'

type MainMenuProps = {
  onScan: () => void
  onLearn: () => void
  onAsk: () => void
  onGrownUps: () => void
}

// The home screen: Check a picture first (the main tool), then the game (the
// tutorial) and the chat with Buddy. The grown-ups' area is a small link at the bottom.
export function MainMenu({ onScan, onLearn, onAsk, onGrownUps }: MainMenuProps) {
  return (
    <main className="menu home">
      <h1 className="menu-title">Scam Shield</h1>

      <Buddy mood="happy" messages={["Hi! I'm Shield Buddy. What would you like to do?"]} />

      <ScanCard onClick={onScan} />

      <div className="menu-tiles">
        <MenuTile
          icon={<img className="menu-tile-buddy" src={IMAGES.happy} alt="" />}
          label="Ask Shield Buddy"
          hint="Not sure about something? Let's check it together."
          onClick={onAsk}
        />
        <MenuTile icon={<LearnIcon />} label="Learn about scams" hint="Play the game" onClick={onLearn} />
      </div>

      <button className="menu-grown-ups" type="button" onClick={onGrownUps}>
        For grown-ups
      </button>
    </main>
  )
}
