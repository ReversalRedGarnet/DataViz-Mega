// Respects the OS-level "reduce motion" setting (relevant for
// vestibular disorders). Pulled out into one place so every D3
// transition in the app (map zoom, marker recolour, chart draw-ins)
// checks it the same way instead of each component re-implementing it.
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Returns `ms`, or 0 if the user has asked for reduced motion.
export function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms
}

// Entrance stagger for a page's Nth top-level section. The CSS
// animation itself is already disabled under prefers-reduced-motion
// (see index.css), so the delay doesn't need its own guard.
export function delayStyle(index) {
  return { animationDelay: `${index * 90}ms` }
}
