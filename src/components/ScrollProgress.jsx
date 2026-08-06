import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// The scroll-linked wave + canoe, rendered as a plain SVG rather than
// its own fixed element -- it's meant to sit at the bottom of Header,
// which owns the actual fixed positioning now that the header carries
// the title and subtext too. Reuses the exact tile geometry
// PacificBorder uses between sections (TILE_WIDTH/BASELINE_Y/CREST_Y),
// so this reads as the same wave motif, not a second one.
//
// Traveled distance is solid ocean blue; distance still ahead is faint
// ink, the same "muted, not gone" treatment the chart gridlines use.
//
// The canoe's horizontal position is a direct 1:1 readout of scroll
// position -- not an independent animation -- so this doesn't need to
// respect prefers-reduced-motion any more than a native scrollbar
// thumb would.
const TILE_WIDTH = 20
const BASELINE_Y = 12
const CREST_Y = 4
const BAR_HEIGHT = 44
const CANOE_SCALE = 0.55
const INK = '#24333A'
const OCEAN = '#5B8FA3'

// Hull: shallow crescent, a small hook at the stern (left) and a
// taller sweeping curl at the bow (right) -- based on the reference
// canoe photo, simplified to a silhouette that survives this scale.
const HULL_PATH =
  'M -24,-1 C -23.00,-0.33 -20.67,2.08 -18.00,3.00 C -15.33,3.92 -11.67,4.20 -8.00,4.50 C -4.33,4.80 0.33,4.88 4.00,4.80 C 7.67,4.72 11.33,4.55 14.00,4.00 C 16.67,3.45 18.50,2.50 20.00,1.50 C 21.50,0.50 22.50,-1.42 23.00,-2.00 C 23.42,-2.83 25.33,-5.33 25.50,-7.00 C 25.67,-8.67 24.67,-10.75 24.00,-12.00 C 23.33,-13.25 22.25,-14.33 21.50,-14.50 C 20.75,-14.67 19.83,-13.25 19.50,-13.00 C 18.58,-12.33 16.25,-10.08 14.00,-9.00 C 11.75,-7.92 9.00,-7.08 6.00,-6.50 C 3.00,-5.92 -1.00,-5.75 -4.00,-5.50 C -7.00,-5.25 -9.67,-5.33 -12.00,-5.00 C -14.33,-4.67 -17.00,-3.75 -18.00,-3.50 C -18.42,-3.83 -19.83,-4.92 -20.50,-5.50 C -21.17,-6.08 -21.42,-7.75 -22.00,-7.00 C -22.58,-6.25 -23.67,-2.00 -24.00,-1.00 Z'

// Paddle crossing diagonally through the hull: grip + shaft + blade,
// built vertically then rotated into place, so the three pieces stay
// simple shapes instead of one fragile hand-curled path.
const PADDLE_BLADE_PATH =
  'M -3.6,10 C -4.2,13 -4.2,16.5 -2.6,19.5 C -1.4,21.7 1.4,21.7 2.6,19.5 C 4.2,16.5 4.2,13 3.6,10 C 2.4,7.5 -2.4,7.5 -3.6,10 Z'

function buildWavePoints(width) {
  const tileCount = Math.ceil(width / TILE_WIDTH) + 2
  const points = [[0, BASELINE_Y]]
  for (let i = 0; i < tileCount; i++) {
    const x0 = i * TILE_WIDTH
    points.push([x0 + 5, CREST_Y], [x0 + 10, BASELINE_Y], [x0 + 15, CREST_Y], [x0 + 20, BASELINE_Y])
  }
  return points
}

export default function ScrollProgress() {
  const wrapperRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [progress, setProgress] = useState(0) // 0..1
  const rafRef = useRef(null)

  // Measures the wrapper's own rendered width via ResizeObserver,
  // rather than window.innerWidth. innerWidth includes the vertical
  // scrollbar's own width whenever one is present, but this element
  // sits inside a `position: fixed` header, which is laid out against
  // the narrower scrollbar-excluded viewport -- so an SVG explicitly
  // sized to innerWidth ended up a few pixels wider than the header
  // actually renders at, and that overhang was pushing the whole page
  // into horizontal overflow on every screen size. Measuring the
  // wrapper directly can never drift from the space actually
  // available, scrollbar or not, and updates on resize the same way
  // Header.jsx already measures its own height.
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const report = () => setWidth(el.offsetWidth)
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function computeProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const pct = scrollable > 0 ? window.scrollY / scrollable : 0
      setProgress(Math.min(1, Math.max(0, pct)))
      rafRef.current = null
    }
    function handleScroll() {
      // Coalesce to one update per frame rather than one per scroll
      // event, which can fire far more often than the page repaints.
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(computeProgress)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    computeProgress()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // The wrapper always renders (its ref is what the ResizeObserver
  // above needs to attach to), but the SVG itself waits for the first
  // real measurement -- avoids a one-frame flash of a wave sized for
  // width 0 on first mount.
  const wavePoints = width ? buildWavePoints(width) : []
  const waveStr = wavePoints.map(([x, y]) => `${x},${y}`).join(' ')
  const progressX = progress * width
  const waveGroupY = BAR_HEIGHT - 16 // the wave's own local coords are 0..16 tall
  // Aligns the hull's keel (local y ~= +5) to the wave's baseline
  // rather than the canoe's (0,0) origin, so it reads as floating on
  // the line instead of hovering above or sinking below it.
  const canoeY = BAR_HEIGHT - 4 - 5 * CANOE_SCALE

  return (
    <div ref={wrapperRef} className="w-full">
      {width > 0 && (
        <svg aria-hidden="true" width={width} height={BAR_HEIGHT} viewBox={`0 0 ${width} ${BAR_HEIGHT}`} className="block">
          <clipPath id="scroll-progress-ahead">
            <rect x={progressX} y="0" width={Math.max(width - progressX, 0)} height={BAR_HEIGHT} />
          </clipPath>
          <clipPath id="scroll-progress-behind">
            <rect x="0" y="0" width={progressX} height={BAR_HEIGHT} />
          </clipPath>

          <g transform={`translate(0,${waveGroupY})`}>
            <polyline
              points={waveStr}
              fill="none"
              stroke={INK}
              strokeOpacity="0.18"
              strokeWidth="1.5"
              clipPath="url(#scroll-progress-ahead)"
            />
            <polyline
              points={waveStr}
              fill="none"
              stroke={OCEAN}
              strokeWidth="2"
              clipPath="url(#scroll-progress-behind)"
            />
          </g>

          <g transform={`translate(${progressX},${canoeY}) scale(${CANOE_SCALE})`}>
            <path d={HULL_PATH} fill={INK} />
            <g transform="translate(-1,-4) rotate(-32)">
              <ellipse cx="0" cy="-21" rx="1.9" ry="3" fill={INK} />
              <rect x="-1.1" y="-20" width="2.2" height="31" fill={INK} />
              <path d={PADDLE_BLADE_PATH} fill={INK} />
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}
