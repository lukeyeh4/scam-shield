import { Buddy } from '../buddy/Buddy'
import { LearnIcon, ToolsIcon } from '../icons'
import { MenuTile, ScanCard } from './MenuCards'

type MainMenuProps = {
  onScan: () => void
  onLearn: () => void
  onCheck: () => void
  onGrownUps: () => void
}

// The home screen: Check a picture first (the main tool), then the game (the
// tutorial) and the other checks. The grown-ups' area is a small link at the bottom.
export function MainMenu({ onScan, onLearn, onCheck, onGrownUps }: MainMenuProps) {
  return (
    <main className="menu home">
      <h1 className="menu-title">Scam Shield</h1>

      <Buddy mood="happy" messages={["Hi! I'm Shield Buddy. What would you like to do?"]} />

      <ScanCard onClick={onScan} />

      <div className="menu-tiles">
        <MenuTile icon={<LearnIcon />} label="Learn about scams" hint="Play the game" onClick={onLearn} />
        <MenuTile icon={<ToolsIcon />} label="More checks" hint="Links, QR codes and messages" onClick={onCheck} />
      </div>

      <button className="menu-grown-ups" type="button" onClick={onGrownUps}>
        For grown-ups
      </button>
    </main>
  )
}
