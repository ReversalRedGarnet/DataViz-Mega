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

// Shared application layout.
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

          {HAZARDS.map((hazard) => (
            <Route
              key={hazard.slug}
              path={hazard.path}
              element={<HazardRoute slug={hazard.slug} />}
            />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

// Maps hazard slugs to page components.
const HAZARD_PAGES = {
  cyclones: CyclonesPage,
  'el-nino-drought': ElNinoDroughtPage,
  'sea-level-rise': SeaLevelRisePage,
}

function HazardRoute({ slug }) {
  const PageComponent = HAZARD_PAGES[slug]

  if (!PageComponent) return null

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
