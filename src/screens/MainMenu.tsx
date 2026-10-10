import { BookIcon, GearIcon, ScanIcon, ShieldLogo } from '../icons'
import { OptionCard } from './OptionCard'

type MainMenuProps = {
  onCheck: () => void
  onLearn: () => void
  onGrownUps: () => void
}

// The home screen: the logo with a gear for grown-ups, then two big warm cards:
// Check something (opens the chat with Shield Buddy, which leads to the right
// checker) and Learn about scams (the game)
export function MainMenu({ onCheck, onLearn, onGrownUps }: MainMenuProps) {
  return (
    <main className="home">
      <header className="home-header">
        <ShieldLogo className="home-logo" />
        <div className="home-name">
          <h1 className="home-title">Scam Shield</h1>
          <p className="home-tagline">Spot scams. Stay safe.</p>
        </div>
        <button className="home-gear" type="button" onClick={onGrownUps} aria-label="For grown-ups">
          <GearIcon />
        </button>
      </header>

      <nav className="home-cards" aria-label="What do you want to do?">
        <OptionCard
          icon={<ScanIcon />}
          tone="orange"
          title="Check something"
          hint="A picture, a message or a link"
          onClick={onCheck}
        />
        <OptionCard icon={<BookIcon />} tone="amber" title="Learn about scams" hint="Play the scam game" onClick={onLearn} />
      </nav>
    </main>
  )
}
