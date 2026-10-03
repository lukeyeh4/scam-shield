import { useState } from 'react'
import { scenarios } from './scenarios'
import { MainMenu } from './screens/MainMenu'
import { ScenarioScreen } from './screens/ScenarioScreen'

export default function App() {
  const [current, setCurrent] = useState<number | null>(null)

  if (current === null) return <MainMenu onPlay={setCurrent} />
  const isLast = current === scenarios.length - 1
  return (
    <ScenarioScreen
      key={scenarios[current].id}
      scenario={scenarios[current]}
      isLast={isLast}
      onBack={() => setCurrent(null)}
      onNext={() => setCurrent(isLast ? null : current + 1)}
    />
  )
}
