import { lazy, Suspense, useEffect, useState } from 'react'
import { recordFinished } from './badges'
import { ChatScreen } from './chat/ChatScreen'
import type { DevJump } from './dev/DevConsole'
import { navigate, type Route, type Tool, useRoute } from './router'
import { scenarios } from './scenarios'
import { BadgeToast } from './screens/Badges'
import { EndScreen } from './screens/EndScreen'
import { GrownUpsScreen } from './screens/GrownUpsScreen'
import { MainMenu } from './screens/MainMenu'
import { ScenarioScreen, type ScenarioStart } from './screens/ScenarioScreen'
import { PictureCheck } from './tools/PictureCheck'
import { TextCheck } from './tools/TextCheck'

// DEV CONSOLE: remove before shipping (see "Dev console" in PROJECT.md).
// Only loaded by `npm run dev`, so it's left out of the built game.
const DevConsole = import.meta.env.DEV
  ? lazy(() => import('./dev/DevConsole').then((m) => ({ default: m.DevConsole })))
  : null

// Names each place in the browser tab, which screen readers also read out
const TITLES: Record<Route['name'], string> = {
  home: 'Scam Shield',
  learn: 'Learn about scams',
  learnDone: 'You did it!',
  ask: 'Ask Shield Buddy',
  check: 'Check for a scam',
  grownUps: 'For grown-ups',
}

const TOOL_TITLES: Record<Tool, string> = {
  picture: 'Check a picture',
  link: 'Check a link',
  message: 'Check a message',
}

const home = () => navigate({ name: 'home' })
const check = (tool: Tool) => navigate({ name: 'check', tool })
const ask = () => navigate({ name: 'ask' })
// Where every tool can lead next
const toolNav = { onHome: home, onAsk: ask }
const learn = (scenario: number, replace = false) => navigate({ name: 'learn', scenario }, { replace })

export default function App() {
  const route = useRoute()
  // DEV CONSOLE: changes on every jump, so the same screen can start over
  const [run, setRun] = useState(0)
  // DEV CONSOLE: the scenario a jump opened part-way through, and where
  const [jumped, setJumped] = useState<{ scenario: number; start?: ScenarioStart }>()

  // DEV CONSOLE: leaving the scenarios forgets the jump, so it isn't replayed later
  if (jumped && route.name !== 'learn') setJumped(undefined)

  const title = route.name === 'check' ? TOOL_TITLES[route.tool] : TITLES[route.name]
  useEffect(() => {
    document.title = route.name === 'home' ? title : `${title} - Scam Shield`
  }, [route.name, title])

  const jump = (j: DevJump) => {
    setRun((r) => r + 1)
    if (j.to === 'scenario') {
      setJumped({ scenario: j.index + 1, start: j.start })
      learn(j.index + 1)
    } else {
      navigate({ name: j.to === 'menu' ? 'home' : 'learnDone' })
    }
  }

  let content
  if (route.name === 'learn' && route.scenario <= scenarios.length) {
    const index = route.scenario - 1
    const isLast = route.scenario === scenarios.length
    content = (
      <ScenarioScreen
        key={`${scenarios[index].id}-${run}`}
        scenario={scenarios[index]}
        isLast={isLast}
        start={jumped?.scenario === route.scenario ? jumped.start : undefined}
        onBack={home}
        onNext={() => {
          setJumped(undefined)
          // Each new scenario replaces the last, so back always leads to the menu
          if (!isLast) return learn(route.scenario + 1, true)
          recordFinished()
          navigate({ name: 'learnDone' }, { replace: true })
        }}
      />
    )
  } else if (route.name === 'learnDone') {
    content = <EndScreen key={run} onPlayAgain={() => learn(1, true)} onMenu={home} />
  } else if (route.name === 'ask') {
    content = <ChatScreen onBack={home} onLeave={(to) => (to === 'home' ? home() : check(to))} />
  } else if (route.name === 'check') {
    content =
      route.tool === 'picture' ? (
        <PictureCheck {...toolNav} />
      ) : (
        <TextCheck key={route.tool} kind={route.tool} {...toolNav} />
      )
  } else if (route.name === 'grownUps') {
    content = <GrownUpsScreen onBack={home} />
  } else {
    content = (
      <MainMenu
        onLearn={() => learn(1)}
        onCheck={ask}
        onGrownUps={() => navigate({ name: 'grownUps' })}
      />
    )
  }

  return (
    <>
      {content}
      <BadgeToast />
      {DevConsole && (
        <Suspense>
          <DevConsole onJump={jump} />
        </Suspense>
      )}
    </>
  )
}
