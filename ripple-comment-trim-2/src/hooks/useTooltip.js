import { useCallback, useEffect, useRef, useState } from 'react'

// Shared tooltip state for anything drawn with D3 (map markers, chart
// points/bars) or plain React (the "no data" notes).
//
// Native SVG <title>/HTML `title` only ever appear on mouse hover, so
// they never appear on touch -- a real problem since the map leads
// with "tap a marker". This hook backs a real HTML tooltip that
// responds to hover, keyboard focus, and tap, reading its content off
// the DOM event so a D3 .on() handler set up once on mount still shows
// whatever is current when the event fires.
//
// containerRef must be attached to a `position: relative` element that
// wraps both the source content and <Tooltip />, so coordinates line
// up between them.
export function useTooltip() {
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null) // { x, y, content } | null

  const showTooltip = useCallback((event, content) => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    // Pointer/mouse events carry clientX/clientY; focus events don't,
    // so fall back to the focused element's own position.
    let clientX = event.clientX
    let clientY = event.clientY
    if (clientX === undefined) {
      const targetRect = event.target.getBoundingClientRect()
      clientX = targetRect.left + targetRect.width / 2
      clientY = targetRect.top
    }

    // Clamp so the tooltip box (roughly 200px wide) doesn't run off
    // either edge on a narrow phone screen.
    const rawX = clientX - containerRect.left
    const x = Math.min(Math.max(rawX, 90), Math.max(containerRect.width - 90, 90))
    const y = clientY - containerRect.top

    setTooltip({ x, y, content })
  }, [])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  // Tapping outside the container dismisses a tapped-open tooltip --
  // without this, a touch user has no way to "hover away" like a mouse
  // user can.
  useEffect(() => {
    function handlePointerDownOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setTooltip(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDownOutside)
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside)
  }, [])

  return { containerRef, tooltip, showTooltip, hideTooltip }
}
