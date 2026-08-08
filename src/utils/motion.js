// The OS-level "reduce motion" setting, in one place so every D3 transition in
// the app checks it the same way.
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Returns `ms`, or 0 if the user has asked for reduced motion.
export function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms
}

// Entrance stagger for a page's Nth section. The animation itself is already
// disabled under prefers-reduced-motion, so the delay needs no guard.
export function delayStyle(index) {
  return { animationDelay: `${index * 90}ms` }
}
