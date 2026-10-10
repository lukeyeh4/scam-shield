import { Buddy } from '../buddy/Buddy'
import { LinkIcon, MessageIcon, QrIcon } from '../icons'
import { MenuTile, ScanCard } from './MenuCards'

// The tools for checking something real: Check a picture first, then the others.
// Each gets its own screen once it's built; until then it shows "Coming soon".
// Order and plans: see PROJECT.md.
const TOOLS = [
  { id: 'link', icon: <LinkIcon />, label: 'Check a link', hint: 'Is this website real?' },
  { id: 'qr', icon: <QrIcon />, label: 'Scan a QR code', hint: 'Where does it go?' },
  { id: 'message', icon: <MessageIcon />, label: 'Check a message', hint: 'Is this text a trick?' },
]

export function CheckScreen({ onBack, onScan }: { onBack: () => void; onScan: () => void }) {
  return (
    <div className="screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">Check for a scam</h1>
      </header>

      <main className="menu">
        <Buddy
          mood="thinking"
          messages={[
            'Soon you can show me things, and we will look for clues together.',
            'Not sure about something right now? Show a grown-up.',
          ]}
        />

        <ScanCard onClick={onScan} />

        <ul className="menu-tiles">
          {TOOLS.map((tool) => (
            <li key={tool.id}>
              <MenuTile icon={tool.icon} label={tool.label} hint={tool.hint} soon />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
