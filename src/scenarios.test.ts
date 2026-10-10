import { describe, expect, it } from 'vitest'
import type { Choice, Result, Scenario, ScenarioScreen } from './types'

// Every scenario file, including the ones set aside in scenarios/later/
const files = import.meta.glob<Scenario>(['../scenarios/*.json', '../scenarios/later/*.json'], {
  eager: true,
  import: 'default',
})

// The parts of each fake screen that recap items can point at, with their text.
// `null` is a part that isn't text (e.g. a video), so it can't have a `highlight`.
// This mirrors the <Field name=...> and useMark(...) names in src/mockups/: keep the two in step.
function targets(screen: ScenarioScreen): Record<string, string | null> {
  switch (screen.mockup) {
    case 'sms': {
      const { sender, messages, notification } = screen.content
      return {
        sender,
        ...Object.fromEntries(messages.map((m, i) => [`message${i + 1}`, m])),
        ...(notification && { notificationSender: notification.sender, notificationText: notification.text }),
      }
    }
    case 'chat-app': {
      const { sender, message, link } = screen.content
      return { sender, message, link }
    }
    case 'messenger': {
      const { accountNote, message, message2 } = screen.content
      return { accountNote, message, message2 }
    }
    case 'email': {
      const { subject, fromAddress, body, button } = screen.content
      return { subject, fromAddress, body, button }
    }
    case 'website': {
      const { url, popupTitle, timer, popupText } = screen.content
      return { url, popupTitle, timer, popupText }
    }
    case 'scam-site': {
      const { url, brand, heading, usernameLabel, passwordLabel } = screen.content
      return { url, brand, heading, usernameLabel, passwordLabel }
    }
    case 'shorts': {
      const { channel, caption, link } = screen.content
      return { channel, caption, link, video: null }
    }
    case 'phone-site': {
      const { url, heading, note } = screen.content
      return { url, heading, ...(note && { note }), summary: null, comments: null }
    }
    case 'search': {
      const { query, ad, results } = screen.content
      return {
        url: 'google.com',
        query,
        adLabel: 'Sponsored',
        adSite: ad.site,
        adUrl: ad.url,
        adTitle: ad.title,
        adText: ad.text,
        ...Object.fromEntries(results.map((r, i) => [`result${i + 1}`, r.title])),
      }
    }
  }
}

// Throws if `target` (and `highlight`, if given) isn't on the screen
function expectOnScreen(screen: ScenarioScreen, where: string, target: string, highlight?: string) {
  const parts = targets(screen)
  expect(Object.keys(parts), `${where}: "${target}" isn't a part of the ${screen.mockup} screen`).toContain(target)
  if (highlight === undefined) return
  const text = parts[target]
  expect(text, `${where}: "${target}" isn't text, so it can't have a highlight`).not.toBeNull()
  expect(text, `${where}: "${highlight}" isn't in the text of "${target}"`).toContain(highlight)
}

const RESULTS: Record<Choice, Result> = { do: 'red', ignore: 'yellow', tell: 'green' }

describe.each(Object.entries(files))('%s', (_path, scenario) => {
  const { recap } = scenario
  const items = [
    { where: 'recap.stop', item: recap.stop },
    ...recap.check.map((item, i) => ({ where: `recap.check[${i}]`, item })),
  ]

  it('gives each choice its usual result', () => {
    for (const choice of Object.keys(RESULTS) as Choice[]) {
      expect(scenario.outcomes[choice].result, `outcomes.${choice}`).toBe(RESULTS[choice])
    }
  })

  it('points every recap item at a real part of its screen', () => {
    for (const { where, item } of items) {
      if (item.screen === 'doIt') {
        expect(scenario.doIt, `${where} points at the Do it screen, but there isn't one`).toBeDefined()
        expectOnScreen(scenario.doIt!, where, item.target, item.highlight)
      } else {
        expectOnScreen(scenario, where, item.target, item.highlight)
      }
    }
  })

  it('points every spotAlso place at a real part of the scam screen', () => {
    for (const { where, item } of items) {
      item.spotAlso?.forEach((also, i) => expectOnScreen(scenario, `${where}.spotAlso[${i}]`, also.target, also.highlight))
    }
  })

  it('only puts clues from the scam screen on the "Spot the clues" list', () => {
    for (const { where, item } of items) {
      if (item.screen === 'doIt') expect(item.spot, `${where} is on the Do it screen, so it can't be spotted`).toBeUndefined()
    }
  })

  it('points the tip at a real part of the scam screen', () => {
    const tip = recap.tip
    if (tip?.target) expectOnScreen(scenario, 'recap.tip', tip.target, tip.highlight)
    else expect(tip?.highlight, 'recap.tip has a highlight but no target').toBeUndefined()
  })
})

it('gives every scenario its own id', () => {
  const ids = Object.values(files).map((s) => s.id)
  expect(new Set(ids).size).toBe(ids.length)
})
