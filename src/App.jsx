import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import CyclonesPage from './pages/CyclonesPage.jsx'
import ElNinoDroughtPage from './pages/ElNinoDroughtPage.jsx'
import SeaLevelRisePage from './pages/SeaLevelRisePage.jsx'
import NotFound from './pages/NotFound.jsx'
import { useScrollToTopOnNavigate } from './hooks/useScrollToTopOnNavigate.js'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { HAZARDS } from './content/hazards.js'

// Router shell: Header, the skip link, and <main>'s scroll-padding are
// all genuinely site-wide (they don't belong to any one page), so they
// live here, once, outside <Routes>. Each page component below is
// responsible only for its own sequence of sections -- see
// CyclonesPage.jsx for what that looked like before the site had more
// than one page, and ElNinoDroughtPage.jsx / SeaLevelRisePage.jsx for
// how the newer pages follow the same shape with different content.
function AppShell() {
  const [headerHeight, setHeaderHeight] = useState(0)
  useScrollToTopOnNavigate()

  // The same measured height that pads <main> below also drives
  // index.css's `scroll-padding-top` (via this CSS variable), so a
  // SectionNav.jsx jump lands with its target's heading clear of the
  // fixed header -- one measurement, two consumers, rather than a
  // second independent height guess that could drift from the first.
  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
  }, [headerHeight])

  return (
    <>
      <Header onHeightChange={setHeaderHeight} />

      {/* Visually hidden until focused -- lets keyboard users jump past
          Header's nav and (on hazard pages) the map straight to the
          main content without tabbing through every link and marker
          first. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:rounded-br-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <main id="main-content" className="min-h-screen" style={{ paddingTop: headerHeight }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {HAZARDS.map((hazard) => (
            <Route key={hazard.slug} path={hazard.path} element={<HazardRoute slug={hazard.slug} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

// Maps a hazard's slug (from the single HAZARDS registry) to its page
// component. New hazard added to src/content/hazards.js needs an entry
// here too -- this is the one place page components and registry
// entries are wired together, deliberately kept separate from the
// registry itself so hazards.js can stay plain data with no JSX/import
// dependencies of its own.
const HAZARD_PAGES = {
  cyclones: CyclonesPage,
  'el-nino-drought': ElNinoDroughtPage,
  'sea-level-rise': SeaLevelRisePage,
}

function HazardRoute({ slug }) {
  const PageComponent = HAZARD_PAGES[slug]
  if (!PageComponent) return <NotFound />
  return <PageComponent />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  )
}
