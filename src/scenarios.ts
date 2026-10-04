import type { Scenario } from './types'

// One JSON file per scenario in /scenarios, played in filename order (01-, 02-, ...).
const files = import.meta.glob<Scenario>('../scenarios/*.json', { eager: true, import: 'default' })

// Scenario files name images from public/ as "/images/...". The hosted game lives in
// a folder (e.g. /scam-shield/ on GitHub Pages), so those paths start from there.
function withBase<T>(value: T): T {
  if (typeof value === 'string' && value.startsWith('/images/')) {
    return (import.meta.env.BASE_URL + value.slice(1)) as T
  }
  if (Array.isArray(value)) return value.map(withBase) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withBase(v)])) as T
  }
  return value
}

export const scenarios: Scenario[] = Object.keys(files)
  .sort()
  .map((path) => withBase(files[path]))
