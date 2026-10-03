import type { Scenario } from './types'

// One JSON file per scenario in /scenarios, played in filename order (01-, 02-, ...).
const files = import.meta.glob<Scenario>('../scenarios/*.json', { eager: true, import: 'default' })

export const scenarios: Scenario[] = Object.keys(files)
  .sort()
  .map((path) => files[path])
