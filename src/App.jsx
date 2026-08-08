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

// The other half of the HAZARDS registry: content/hazards.js says which
// hazards exist and where they live, this says what renders there. A hazard
// added to the registry without an entry here falls through to NotFound rather
// than rendering a blank route.
const HAZARD_PAGES = {
  cyclones: CyclonesPage,
  'el-nino-drought': ElNinoDroughtPage,
  'sea-level-rise': SeaLevelRisePage,
}

function AppShell() {
  const [headerHeight, setHeaderHeight] = useState(0)

  useScrollToTopOnNavigate()

  // Keep the CSS scroll offset in sync with the measured header height.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--header-height',
      `${headerHeight}px`
    )
  }, [headerHeight])

  return (
    <>
      {/* Skip navigation for keyboard users. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:rounded-br-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Header onHeightChange={setHeaderHeight} />

      <main
        id="main-content"
        className="min-h-screen"
        style={{ paddingTop: headerHeight }}
      >
        <Routes>
          <Route path="/" element={<Home />} />

          {HAZARDS.map((hazard) => {
            const Page = HAZARD_PAGES[hazard.slug]
            return <Route key={hazard.slug} path={hazard.path} element={Page ? <Page /> : <NotFound />} />
          })}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
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
