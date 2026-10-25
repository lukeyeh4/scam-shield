import { describe, expect, it } from 'vitest'
import { parseHash, type Route, toHash } from './router'

describe('router', () => {
  const routes: Route[] = [
    { name: 'home' },
    { name: 'learnHub' },
    { name: 'learn', scenario: 1 },
    { name: 'learn', scenario: 3 },
    { name: 'learnDone' },
    { name: 'ask' },
    { name: 'check', tool: 'picture' },
    { name: 'check', tool: 'link' },
    { name: 'check', tool: 'message' },
    { name: 'grownUps' },
    { name: 'grownUps', then: 'picture' },
  ]

  it.each(routes)('reads back the address it makes for %o', (route) => {
    expect(parseHash(toHash(route))).toEqual(route)
  })

  it('goes home with no address', () => {
    expect(parseHash('')).toEqual({ name: 'home' })
    expect(parseHash('#')).toEqual({ name: 'home' })
  })

  it('opens Learn about scams with no scenario number', () => {
    expect(parseHash('#/learn')).toEqual({ name: 'learnHub' })
    expect(parseHash('#/learn/')).toEqual({ name: 'learnHub' })
  })

  it.each(['#/nowhere', '#/learn/0', '#/learn/abc', '#/learn/1.5', '#/ask/extra', '#/check', '#/check/qr', '#/tell', '#/grown-ups/qr'])('goes home for %s', (hash) => {
    expect(parseHash(hash)).toEqual({ name: 'home' })
  })
})
