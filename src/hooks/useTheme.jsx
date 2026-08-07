import { createContext, useContext, useEffect, useState } from 'react'

// Site-wide light/dark state, via Context rather than a prop threaded
// through every page -- unlike useSelection() (genuinely per-page,
// reset on navigation), theme is the one piece of state that's
// meaningfully global: Header's toggle button needs to set it, and
// every D3 chart-drawing component across every page needs to read it
// (see theme.js's CHART_INK/sectionColorsFor -- axis text and the wave
// divider's fill both need to know which palette is active). Threading
// that through props would mean every page and every chart component
// takes a `theme` prop it just forwards, which is what Context exists
// to avoid.
const ThemeContext = createContext(null)

const STORAGE_KEY = 'ripple-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // No explicit choice made in this browser yet -- default to the
  // OS-level preference rather than always starting light. Read once,
  // on mount; a manual toggle after this always wins (it's written to
  // localStorage immediately below), so this never fights a person's
  // explicit choice, and there's no need to keep listening for the OS
  // setting to change later.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Throws rather than silently defaulting if used outside the provider
// -- a chart rendering with the wrong palette because this hook was
// called somewhere ThemeProvider doesn't wrap is a much harder bug to
// spot than a clear error at the call site.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
