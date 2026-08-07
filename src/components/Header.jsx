import { useLayoutEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ScrollProgress from './ScrollProgress.jsx'
import SectionNav from './SectionNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { HAZARDS } from '../content/hazards.js'

// Home plus every hazard page, in the order they should appear in the
// nav -- built from the same HAZARDS registry Home.jsx's card grid
// reads from, so a hazard added there shows up here automatically
// rather than needing its own separate nav entry.
const NAV_LINKS = [{ path: '/', label: 'Home' }, ...HAZARDS.map((h) => ({ path: h.path, label: h.navLabel }))]

// Persistent site header: title, one-line thesis, and the scroll
// progress bar directly underneath it. Fixed for the entire time
// someone's on the site, not just after scrolling past Hero -- the
// progress bar's whole job is tracking progress from the very top, so
// it has to be visible from the very top too.
//
// A plain <header> here (not nested inside <main>) gets the implicit
// "banner" landmark automatically, which is the correct role for
// persistent site-level chrome -- no explicit role attribute needed.
// The title is deliberately NOT a heading element: Hero.jsx already
// has the page's one real <h1> (the thesis headline), and a second
// h1 here would give the page two, which breaks the single-h1
// document outline screen reader users rely on.
//
// Props:
//   onHeightChange -- (px: number) => void, called with this header's
//     actual rendered height whenever it changes, so App.jsx can give
//     <main> matching padding-top -- otherwise Hero would render
//     partly hidden underneath this fixed header on load. Measured
//     rather than hardcoded so it can't drift out of sync with a
//     future copy or font-size change.
export default function Header({ onHeightChange }) {
  const headerRef = useRef(null)

  // useLayoutEffect, not useEffect: this measurement drives another
  // element's layout (main's padding-top), so it needs to run before
  // the browser paints -- otherwise Hero would flash unpadded under
  // the header for one frame on every load.
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
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-sand shadow-sm"
    >
      {/* Solid fill, not the old bg-sand/90 + backdrop-blur -- a
          translucent header let whatever was scrolling underneath
          (chart colours, the map's ocean fill) show through and
          compete with the title, and put text contrast at the mercy
          of content that changes on every scroll. Opaque sand keeps
          this a stable, legible masthead no matter what's beneath it. */}
      <div className="mx-auto max-w-5xl px-6 pt-3 md:pt-3.5">
        {/* Brand row: wordmark and thesis share a baseline on md+
            (stacked on mobile, where there isn't width to spare),
            separated by a hairline rule rather than just stacking two
            same-weight lines. Tracking-tight on the wordmark and a
            light italic on the thesis give the two roles distinct
            voices instead of one undifferentiated block of text.
            Wordmark is deliberately large -- text-2xl/4xl, a step up
            from its original text-lg/xl -- so the header reads as an
            actual masthead that fills the space it's given rather
            than a small label floating in mostly-empty padding.
            SectionNav/ThemeToggle sit in their own group on the right
            so they read as controls, not as part of the wordmark/
            thesis reading line. */}
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

        {/* Nav row: Home plus every hazard page. Underline-on-active
            rather than a background pill or tab treatment, matching
            how every other link on the site (footer citations, the
            map's "Clear selection" button) already signals state --
            one link convention sitewide instead of a second one just
            for navigation. */}
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
