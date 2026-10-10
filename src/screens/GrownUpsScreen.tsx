// The grown-ups' area (not built yet): setting Scam Shield up for a child.
// Written for adults, so the kids' reading-level rules don't apply here.
// Before it holds real settings, it needs a parent gate (a check a young child
// can't easily pass), which app stores require for kids' apps.
export function GrownUpsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen-enter">
      <header className="scenario-header">
        <button className="back" type="button" onClick={onBack}>
          Menu
        </button>
        <h1 className="scenario-title">For grown-ups</h1>
      </header>

      <main className="menu grown-ups">
        <p>
          This is where you'll set up Scam Shield for your child. Your child can play the game without it, but the
          tools that check real messages and links will need you first.
        </p>
        <h2 className="menu-heading">Coming soon</h2>
        <ul className="grown-ups-list">
          <li>Agree to how checks work, and what is sent to check them</li>
          <li>Choose the trusted adults your child can send a check to</li>
          <li>Set up a family code word together</li>
        </ul>
      </main>
    </div>
  )
}
