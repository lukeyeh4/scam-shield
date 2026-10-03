import { useState } from 'react'
import { scenarios } from './scenarios'
import { MainMenu } from './screens/MainMenu'
import { ScenarioScreen } from './screens/ScenarioScreen'

export default function App() {
  const [current, setCurrent] = useState<number | null>(null)

  if (current === null) return <MainMenu onPlay={setCurrent} />
  return <ScenarioScreen scenario={scenarios[current]} onBack={() => setCurrent(null)} />
}
