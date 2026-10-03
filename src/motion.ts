// True if the player has asked their device for reduced motion.
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
