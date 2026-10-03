import { reduceMotion } from '../motion'
import type { ScenarioScreen } from '../types'
import { smsArrivalMs } from './smsTimeline'

// How long a fake screen takes to show its scam, so Shield Buddy can wait for it.
export function arrivalDelay(screen: ScenarioScreen) {
  if (reduceMotion()) return 0
  return screen.mockup === 'sms' ? smsArrivalMs(screen.content) : 0
}
