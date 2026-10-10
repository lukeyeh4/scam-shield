import { Buddy } from '../buddy/Buddy'
import { ScanIcon } from '../icons'

type MainMenuProps = {
  onCheck: () => void
  onLearn: () => void
  onGrownUps: () => void
}

// The home screen: one big button to check something (it opens the chat with
// Buddy, which leads to the right checker), with the game and the grown-ups'
// area as small links underneath
export function MainMenu({ onCheck, onLearn, onGrownUps }: MainMenuProps) {
  return (
    <main className="menu home">
      <h1 className="menu-title">Scam Shield</h1>

      <Buddy mood="happy" messages={["Hi! I'm Shield Buddy. Got something that feels weird? Let's check it."]} />

      <button className="home-check" type="button" onClick={onCheck}>
        <ScanIcon />
        Check something
      </button>

      <nav className="home-links" aria-label="More">
        <button type="button" onClick={onLearn}>
          Learn about scams
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={onGrownUps}>
          For grown-ups
        </button>
      </nav>
    </main>
  )
}
