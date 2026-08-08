import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the scroll position across navigations, so following a
// link from halfway down Home would land mid-page on the next one. Resetting
// also fires a 'scroll' event, which is what lets ScrollProgress recompute for
// the newly mounted page without extra wiring.
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
