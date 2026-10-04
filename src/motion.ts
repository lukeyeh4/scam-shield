import { isFast } from './dev/devSettings'

// True if the player has asked their device for reduced motion
// DEV CONSOLE: or when fast mode is on.
export const reduceMotion = () => isFast() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
