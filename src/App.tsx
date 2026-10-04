import { lazy, Suspense, useState } from 'react'
import type { DevJump } from './dev/DevConsole'
import { scenarios } from './scenarios'
import { EndScreen } from './screens/EndScreen'
import { MainMenu } from './screens/MainMenu'
import { ScenarioScreen, type ScenarioStart } from './screens/ScenarioScreen'

// DEV CONSOLE: remove before shipping (see "Dev console" in PROJECT.md).
// Only loaded by `npm run dev`, so it's left out of the built game.
const DevConsole = import.meta.env.DEV
  ? lazy(() => import('./dev/DevConsole').then((m) => ({ default: m.DevConsole })))
  : null

type View =
  | { screen: 'menu' }
  | { screen: 'end' }
  | { screen: 'scenario'; index: number; start?: ScenarioStart }

export default function App() {
  const [view, setView] = useState<View>({ screen: 'menu' })
  // DEV CONSOLE: changes on every jump, so the same screen can start over
  const [run, setRun] = useState(0)

  const play = (index: number) => setView({ screen: 'scenario', index })
  const menu = () => setView({ screen: 'menu' })

  const jump = (j: DevJump) => {
    setRun((r) => r + 1)
    setView(j.to === 'scenario' ? { screen: 'scenario', index: j.index, start: j.start } : { screen: j.to })
  }

  let content
  if (view.screen === 'menu') {
    content = <MainMenu onStart={() => play(0)} />
  } else if (view.screen === 'end') {
    content = <EndScreen key={run} onPlayAgain={() => play(0)} onMenu={menu} />
  } else {
    const { index, start } = view
    const isLast = index === scenarios.length - 1
    content = (
      <ScenarioScreen
        key={`${scenarios[index].id}-${run}`}
        scenario={scenarios[index]}
        isLast={isLast}
        start={start}
        onBack={menu}
        onNext={() => (isLast ? setView({ screen: 'end' }) : play(index + 1))}
      />
    )
  }

  return (
    <>
      {content}
      {DevConsole && (
        <Suspense>
          <DevConsole onJump={jump} />
        </Suspense>
      )}
    </>
  )
}
