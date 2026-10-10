import { useSyncExternalStore } from 'react'

// Every place in the app has an address after the # (e.g. #/learn/2), so the
// browser's back button works, and a link can open a part of the app directly.
// The # keeps it working on GitHub Pages and, later, inside a phone app.
export type Route =
  | { name: 'home' }
  // The game, used as the tutorial: `scenario` counts from 1
  | { name: 'learn'; scenario: number }
  | { name: 'learnDone' }
  // The tools for checking something real (not built yet)
  | { name: 'check' }
  // Check a picture: the main tool
  | { name: 'scan' }
  // The grown-ups' area: setup and settings (not built yet)
  | { name: 'grownUps' }

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'learn':
      return `#/learn/${route.scenario}`
    case 'learnDone':
      return '#/learn/done'
    case 'check':
      return '#/check'
    case 'scan':
      return '#/check/picture'
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
  if (parts[0] === 'check' && parts.length === 1) return { name: 'check' }
  if (parts[0] === 'check' && parts[1] === 'picture' && parts.length === 2) return { name: 'scan' }
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
