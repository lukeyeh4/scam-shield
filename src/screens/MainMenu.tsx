import { IMAGES } from '../buddy/moods'
import { BookIcon, CameraIcon, GearIcon, LinkIcon, MessageIcon, ShieldLogo } from '../icons'
import type { Tool } from '../router'
import { OptionCard } from './OptionCard'

type MainMenuProps = {
  onTool: (tool: Tool) => void
  onLearn: () => void
  onAsk: () => void
  onGrownUps: () => void
}

// The home screen: the logo with a gear for grown-ups, a big warm card for each tool
// and the game, then Shield Buddy, who opens the chat when tapped
export function MainMenu({ onTool, onLearn, onAsk, onGrownUps }: MainMenuProps) {
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
          icon={<CameraIcon />}
          tone="orange"
          title="Check a picture"
          hint="Find red flags in a screenshot"
          onClick={() => onTool('picture')}
        />
        <OptionCard
          icon={<MessageIcon />}
          tone="peach"
          title="Check a message"
          hint="See if it might be a scam"
          onClick={() => onTool('message')}
        />
        <OptionCard
          icon={<LinkIcon />}
          tone="gold"
          title="Check a link"
          hint="Check a website before you open it"
          onClick={() => onTool('link')}
        />
        <OptionCard icon={<BookIcon />} tone="amber" title="Learn about scams" hint="Play the scam game" onClick={onLearn} />
      </nav>

      <button className="home-buddy" type="button" onClick={onAsk}>
        <span className="buddy-body">
          <img className="home-buddy-image" src={IMAGES.happy} alt="" />
        </span>
        <span className="home-buddy-bubble">
          <strong>Not sure about something?</strong>
          <span>Tap me, and we can check it together.</span>
        </span>
      </button>
    </main>
  )
}
