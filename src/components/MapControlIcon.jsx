// Custom icons for the map's zoom/reset buttons, replacing the plain
// "+" / "\u2212" / "\u27f2" text glyphs that used to sit inside those
// circles. Same stroke weight (2.25) and color (ink) as the chart
// lines and the wave border, so these read as part of the same visual
// language rather than a separate icon set bolted on top.
//
// Zoom-out's minus is literally just the cross's horizontal stroke --
// no separate design, same coordinates. Reset is the one genuinely new
// shape: a ~290-degree arc (large-arc-flag 1, sweep-flag 0 -- the long
// way around the circle, not the short way through the gap) with a
// small filled triangular arrowhead landing tangent to the curl.
//
// Props:
//   kind -- 'zoomIn' | 'zoomOut' | 'reset'
const STROKE = '#24333A'
const STROKE_WIDTH = 2.25

export default function MapControlIcon({ kind }) {
  if (kind === 'zoomIn') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <line x1="12" y1="4" x2="12" y2="20" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'zoomOut') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <line x1="4" y1="12" x2="20" y2="12" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M 7.70 5.86 A 7.5 7.5 0 1 0 16.30 5.86"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="14.42,4.54 18.82,5.05 16.41,8.49" fill={STROKE} />
    </svg>
  )
}
