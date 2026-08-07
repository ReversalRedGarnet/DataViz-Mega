import { useTheme } from '../hooks/useTheme.jsx'

// Same stroke weight/colour convention as MapControlIcon.jsx (2.25,
// currentColor) so this reads as part of the same custom icon set
// rather than a different one bolted on. Shows the icon for the mode
// a click will SWITCH TO (a moon while in light mode, a sun while in
// dark mode) -- the more common of the two conventions for a toggle
// like this, and the one that answers "what happens if I press this"
// rather than "what state am I in", which the button's own visual
// state (whichever icon is currently showing) already answers anyway.
const STROKE_WIDTH = 2.25

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="3.5"
          x2="12"
          y2="5.5"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M 20 14.5 A 8.5 8.5 0 1 1 9.5 4 A 6.8 6.8 0 0 0 20 14.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Props:
//   className -- forwarded to the <button>, so Header.jsx can position
//     this alongside its other controls without this component
//     needing to know its own placement
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5 ${className}`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
