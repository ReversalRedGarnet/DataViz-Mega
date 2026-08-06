// Floating tooltip box, positioned by useTooltip.js. Styled with the
// site's ink border and sand fill rather than an accent colour, so it
// reads as part of the same visual language as the rest of the page
// instead of introducing another one-off colour.
//
// Uses .animate-tooltip-pop-in (a real @keyframes animation, see
// index.css) rather than a CSS `transition` -- this element fully
// mounts/unmounts each time it appears (see the `if (!tooltip) return
// null` below), and a `transition` needs a prior style to animate
// *from* within the same DOM node, so it would never actually run on
// entrance. An `animation` runs automatically on mount instead, which
// is what makes this an actual "popup" rather than an instant snap-in.
//
// Props:
//   tooltip -- { x, y, content } | null, from useTooltip()
export default function Tooltip({ tooltip }) {
  if (!tooltip) return null

  return (
    <div
      role="tooltip"
      className="animate-tooltip-pop-in pointer-events-none absolute z-30 max-w-[220px] rounded-lg border border-ink/15 bg-sand px-3 py-2 text-xs leading-snug text-ink shadow-lg"
      style={{ left: tooltip.x, top: tooltip.y - 10 }}
    >
      {tooltip.content}
    </div>
  )
}
