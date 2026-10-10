import { useSyncExternalStore } from 'react'

// Every place in the app has an address after the # (e.g. #/learn/2), so the
// browser's back button works, and a link can open a part of the app directly.
// The # keeps it working on GitHub Pages and, later, inside a phone app.
export type Route =
  | { name: 'home' }
  // The game, used as the tutorial: `scenario` counts from 1
  | { name: 'learn'; scenario: number }
  | { name: 'learnDone' }
  // Ask Shield Buddy: a chat for checking something real
  | { name: 'ask' }
  // The tools: Check a picture (the main one), a link or a message
  | { name: 'check'; tool: Tool }
  // The grown-ups' area: setup and settings (not built yet)
  | { name: 'grownUps' }

export type Tool = 'picture' | 'link' | 'message'
const TOOLS: Tool[] = ['picture', 'link', 'message']

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'learn':
      return `#/learn/${route.scenario}`
    case 'learnDone':
      return '#/learn/done'
    case 'ask':
      return '#/ask'
    case 'check':
      return `#/check/${route.tool}`
    case 'grownUps':
      return '#/grown-ups'
  }
}

// An address that isn't a real place goes home
export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'learn' && parts[1] === 'done') return { name: 'learnDone' }
  if (parts[0] === 'learn') {
    const scenario = parts[1] === undefined ? 1 : Number(parts[1])
    if (Number.isInteger(scenario) && scenario >= 1) return { name: 'learn', scenario }
  }
  if (parts[0] === 'ask' && parts.length === 1) return { name: 'ask' }
  const tool = TOOLS.find((t) => t === parts[1])
  if (parts[0] === 'check' && tool && parts.length === 2) return { name: 'check', tool }
  if (parts[0] === 'grown-ups' && parts.length === 1) return { name: 'grownUps' }
  return { name: 'home' }
}

// `replace` swaps the current page instead of adding one, so back skips over it
export function navigate(route: Route, { replace = false } = {}) {
  const hash = toHash(route)
  if (replace) {
    history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    location.hash = hash
  }
  window.scrollTo(0, 0)
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// The current place in the app; the component re-renders when it changes
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  return parseHash(hash)
}
