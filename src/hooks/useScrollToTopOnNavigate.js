import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation by itself
// -- without this, following a Link from partway down a long page
// (e.g. a hazard card near the bottom of Home) would land on the next
// page already scrolled to that same pixel offset, which reads as
// broken rather than as a new page. Scrolling to top on every pathname
// change also naturally fires a 'scroll' event, which is what lets
// ScrollProgress.jsx's existing listener recompute correctly for
// whatever page just mounted, with no extra wiring needed there.
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
