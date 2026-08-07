import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_SECTIONS } from '../content/pageSections.js'

// Same stroke convention as MapControlIcon.jsx/ThemeToggle.jsx (2.25,
// currentColor). Three bars morphing into an X on open, drawn as one
// component with `open` swapping the middle bar's opacity and the
// outer two bars' rotation/position, rather than two separate icons --
// the morph itself is a small, free bit of feedback that the button
// did something.
function HamburgerIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 7px',
          transform: open ? 'translateY(5px) rotate(45deg)' : 'none',
          transition: 'transform 180ms ease-out',
        }}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{ opacity: open ? 0 : 1, transition: 'opacity 120ms ease-out' }}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 17px',
          transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none',
          transition: 'transform 180ms ease-out',
        }}
      />
    </svg>
  )
}

// In-page "jump to section" menu -- a real anchor link per section
// (href="#id"), not a JS-driven scroll: native fragment navigation
// already gets a smooth scroll from index.css's scroll-behavior rule
// and the right header-clearance offset from its scroll-padding-top
// rule (both gated correctly on prefers-reduced-motion / kept in sync
// with Header's real height -- see index.css and Header.jsx), and
// it's a real, shareable, bookmarkable URL for free. Renders nothing
// on a page with no registered sections (e.g. a 404) rather than an
// empty, useless menu.
export default function SectionNav() {
  const { pathname } = useLocation()
  const sections = PAGE_SECTIONS[pathname]
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Closing on navigation matters even though clicking a link inside
  // the menu already triggers a route-internal scroll, not a real
  // navigation -- someone could still open this menu, then use the
  // sitewide nav row (or browser back/forward) instead, and a stale
  // open dropdown listing the PREVIOUS page's sections would be
  // actively wrong, not just untidy.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!sections || sections.length === 0) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="section-nav-menu"
        aria-label={open ? 'Close section menu' : 'Open section menu'}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5"
      >
        <HamburgerIcon open={open} />
      </button>
      {open && (
        <ul
          id="section-nav-menu"
          role="menu"
          className="animate-pop-in absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-ink/10 bg-sand py-2 shadow-lg"
        >
          {sections.map((section) => (
            <li key={section.id} role="none">
              <a
                role="menuitem"
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
