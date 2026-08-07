import { useLayoutEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ScrollProgress from './ScrollProgress.jsx'
import SectionNav from './SectionNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { HAZARDS } from '../content/hazards.js'

// Home plus every hazard page, in nav order -- built from the same
// HAZARDS registry Home.jsx's card grid reads from, so a hazard added
// there shows up here automatically.
const NAV_LINKS = [{ path: '/', label: 'Home' }, ...HAZARDS.map((h) => ({ path: h.path, label: h.navLabel }))]

// Persistent site header: title, one-line thesis, nav, and the scroll
// progress bar. Fixed for the whole visit, not just after scrolling
// past Hero, since the progress bar needs to be visible from the top.
//
// A plain <header> (not nested inside <main>) gets the implicit
// "banner" landmark automatically. The title is deliberately not a
// heading element -- Hero.jsx already has the page's one real <h1>,
// and a second h1 here would break the single-h1 document outline.
//
// Props:
//   onHeightChange -- (px: number) => void, called with the header's
//     actual rendered height whenever it changes, so App.jsx can give
//     <main> matching padding-top.
export default function Header({ onHeightChange }) {
  const headerRef = useRef(null)

  // useLayoutEffect, not useEffect: this measurement drives another
  // element's layout, so it needs to run before the browser paints --
  // otherwise Hero flashes unpadded under the header for one frame.
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const report = () => onHeightChange(el.offsetHeight)
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeightChange])

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-sand shadow-sm">
      <div className="mx-auto max-w-5xl px-6 pt-3 md:pt-3.5">
        {/* SectionNav/ThemeToggle sit in their own group on the right
            so they read as controls, not part of the wordmark/thesis
            reading line. */}
        <div className="flex items-start justify-between gap-3 md:items-baseline">
          <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
            <Link
              to="/"
              className="rounded text-2xl font-bold leading-tight tracking-tight text-ink hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:text-4xl"
            >
              Ripple
            </Link>
            <p className="text-sm italic leading-snug text-ink/70 md:border-l md:border-ink/15 md:pl-3 md:text-lg">
              Climate doesn't create inequality. It reveals it.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SectionNav />
            <ThemeToggle />
          </div>
        </div>

        {/* Underline-on-active, matching how every other link on the
            site signals state -- one convention sitewide. */}
        <nav aria-label="Site" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pb-3 text-xs md:text-sm">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) =>
                isActive
                  ? 'font-semibold text-ink underline decoration-ocean underline-offset-4'
                  : 'text-ink/60 transition-colors hover:text-ink'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <ScrollProgress />
    </header>
  )
}
