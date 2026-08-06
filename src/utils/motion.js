// Respects the OS-level "reduce motion" setting (relevant for
// vestibular disorders). Pulled out into one place so every D3
// transition in the app (map zoom, marker recolour, chart draw-ins)
// checks it the same way instead of each component re-implementing it.
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Returns `ms`, or 0 if the user has asked for reduced motion.
export function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms
}
