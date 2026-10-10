import { useSyncExternalStore } from 'react'

// A setting that's on or off, remembered on the device ('1' or '0' in
// localStorage, so a choice holds whatever the default is). Starts at `fallback`
// until someone chooses, or if storage is blocked.
export function storedSwitch(key: string, fallback: boolean) {
  let on = fallback
  try {
    const chosen = localStorage.getItem(key)
    if (chosen !== null) on = chosen === '1'
  } catch {
    // Storage blocked: the default until the page is reloaded
  }

  const listeners = new Set<() => void>()
  const get = () => on

  function set(value: boolean) {
    on = value
    try {
      localStorage.setItem(key, on ? '1' : '0')
    } catch {
      // Storage blocked: the choice lasts until the page is reloaded
    }
    listeners.forEach((listener) => listener())
  }

  function use() {
    return useSyncExternalStore((listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }, get)
  }

  return { get, set, use }
}
