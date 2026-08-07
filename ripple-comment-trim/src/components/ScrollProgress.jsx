import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'
import { CHART_INK } from '../utils/theme.js'

// The scroll-linked wave + canoe, sitting at the bottom of Header.
// Reuses PacificBorder's tile geometry (TILE_WIDTH/BASELINE_Y/CREST_Y)
// so it reads as the same wave motif.
//
// Traveled distance is solid ocean blue; distance ahead is faint ink
// (same "muted, not gone" treatment as chart gridlines) -- tracks
// theme via CHART_INK since a fixed dark stroke would go invisible on
// a dark header.
//
// Canoe position is a direct readout of scroll position, not an
// independent animation, so it doesn't need to respect
// prefers-reduced-motion any more than a scrollbar thumb would.
const TILE_WIDTH = 20
const BASELINE_Y = 12
const CREST_Y = 4
const BAR_HEIGHT = 44
const CANOE_SCALE = 0.55
const OCEAN = '#5B8FA3'

// Hull: shallow crescent, small hook at the stern (left), taller curl
// at the bow (right) -- simplified from a reference canoe photo to a
// silhouette that survives this scale.
const HULL_PATH =
  'M -24,-1 C -23.00,-0.33 -20.67,2.08 -18.00,3.00 C -15.33,3.92 -11.67,4.20 -8.00,4.50 C -4.33,4.80 0.33,4.88 4.00,4.80 C 7.67,4.72 11.33,4.55 14.00,4.00 C 16.67,3.45 18.50,2.50 20.00,1.50 C 21.50,0.50 22.50,-1.42 23.00,-2.00 C 23.42,-2.83 25.33,-5.33 25.50,-7.00 C 25.67,-8.67 24.67,-10.75 24.00,-12.00 C 23.33,-13.25 22.25,-14.33 21.50,-14.50 C 20.75,-14.67 19.83,-13.25 19.50,-13.00 C 18.58,-12.33 16.25,-10.08 14.00,-9.00 C 11.75,-7.92 9.00,-7.08 6.00,-6.50 C 3.00,-5.92 -1.00,-5.75 -4.00,-5.50 C -7.00,-5.25 -9.67,-5.33 -12.00,-5.00 C -14.33,-4.67 -17.00,-3.75 -18.00,-3.50 C -18.42,-3.83 -19.83,-4.92 -20.50,-5.50 C -21.17,-6.08 -21.42,-7.75 -22.00,-7.00 C -22.58,-6.25 -23.67,-2.00 -24.00,-1.00 Z'

// Paddle crossing diagonally through the hull: grip + shaft + blade,
// built vertically then rotated into place.
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
  const { theme } = useTheme()
  const ink = CHART_INK[theme] ?? CHART_INK.light

  // Measures the wrapper's own rendered width via ResizeObserver
  // rather than window.innerWidth, which includes the scrollbar's
  // width -- this element sits in a fixed header laid out against the
  // narrower scrollbar-excluded viewport, so sizing off innerWidth
  // pushed the whole page into horizontal overflow.
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    // Floor rather than round: offsetWidth rounds to the nearest
    // integer, which can round up past the wrapper's true width on a
    // fractional layout and reintroduce a 1px overflow.
    const report = () => setWidth(Math.floor(el.getBoundingClientRect().width))
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

    // Content-height changes (e.g. selecting a second country to
    // compare) also change what "progress" means, without necessarily
    // firing a scroll event -- without this, the bar shows a stale
    // fraction until the next real scroll.
    const bodyObserver = new ResizeObserver(handleScroll)
    bodyObserver.observe(document.body)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      bodyObserver.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Wrapper always renders (ResizeObserver needs its ref); the SVG
  // waits for the first real measurement to avoid a flash of a wave
  // sized for width 0.
  const wavePoints = width ? buildWavePoints(width) : []
  const waveStr = wavePoints.map(([x, y]) => `${x},${y}`).join(' ')
  const progressX = progress * width
  const waveGroupY = BAR_HEIGHT - 16 // wave's own local coords are 0..16 tall
  // Aligns the hull's keel (local y ~= +5) to the wave's baseline
  // rather than the canoe's own (0,0) origin.
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
              stroke={ink}
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
            <path d={HULL_PATH} fill={ink} />
            <g transform="translate(-1,-4) rotate(-32)">
              <ellipse cx="0" cy="-21" rx="1.9" ry="3" fill={ink} />
              <rect x="-1.1" y="-20" width="2.2" height="31" fill={ink} />
              <path d={PADDLE_BLADE_PATH} fill={ink} />
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}
