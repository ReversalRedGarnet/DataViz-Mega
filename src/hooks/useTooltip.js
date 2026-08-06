import { useCallback, useEffect, useRef, useState } from 'react'

// Shared tooltip state for anything drawn with D3 (map markers, chart
// points/bars) or plain React (the "no data" notes) inside one section
// of the page.
//
// Native SVG <title> / HTML `title` attributes only ever appear on
// mouse hover, so on a touch device they never appear at all -- a real
// problem here, since the map's own on-page instructions lead with
// "tap a marker". This hook backs a real HTML tooltip that responds to
// hover, keyboard focus, AND tap, and reads its content straight off
// the DOM event, so a D3 .on() handler set up once on mount can still
// show whatever is current when the event actually fires.
//
// containerRef must be attached to a `position: relative` element that
// wraps both the source content and the <Tooltip />, so coordinates
// line up between them.
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
    // either edge of the container on a narrow phone screen.
    const rawX = clientX - containerRect.left
    const x = Math.min(Math.max(rawX, 90), Math.max(containerRect.width - 90, 90))
    const y = clientY - containerRect.top

    setTooltip({ x, y, content })
  }, [])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  // Tapping anywhere outside the container dismisses a tapped-open
  // tooltip -- without this, a touch user has no way to hover away
  // the way a mouse user does.
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
