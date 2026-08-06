// A smooth curling wave-and-spiral motif -- an original design (not a
// reproduction of any specific traditional Pacific textile or art
// pattern; those belong to specific communities and shouldn't be
// lifted generically), built from the person's own hand-drawn sketch:
// waves that are also spirals, breaking at the crest. Replaces the
// earlier straight zigzag with an actual smooth curve plus a small
// hand-parametrised curl at each crest.
//
// Still a genuine two-tone divider between sections, exactly as
// before: `colorAbove` fills the whole strip, then `colorBelow` is
// painted over just the region below the wave line -- so the wave
// itself is the seam between one section's background and the next's,
// rather than a separate border element that would need to line up
// pixel-perfectly with a flat colour cut.
const TILE_WIDTH = 40
const TILE_COUNT = 10 // 40 * 10 = 400, matching the original total width
const BASELINE_Y = 16
const CREST_Y = 7
const VIEW_WIDTH = TILE_WIDTH * TILE_COUNT
const VIEW_HEIGHT = 20
const WAVE_STROKE = '#5B8FA3' // same ocean blue as the map markers and storm-profile points

// The wave line itself as a sequence of cubic-bezier "swells" -- a
// smooth curve rather than the old sharp zigzag, so it reads as water
// rising and falling instead of a saw-tooth. Returns just the C
// commands (no leading M), since both the visible stroke and the fill
// region below it need to start from the same point but are used
// slightly differently (see WAVE_LINE_PATH / BOTTOM_REGION_PATH).
function buildWaveCommands() {
  let d = ''
  for (let i = 0; i < TILE_COUNT; i++) {
    const x0 = i * TILE_WIDTH
    const cx1 = x0 + TILE_WIDTH * 0.25
    const xMid = x0 + TILE_WIDTH * 0.5
    const cx2 = x0 + TILE_WIDTH * 0.75
    const x1 = x0 + TILE_WIDTH
    d += `C ${cx1},${BASELINE_Y} ${cx1},${CREST_Y} ${xMid},${CREST_Y} `
    d += `C ${cx2},${CREST_Y} ${cx2},${BASELINE_Y} ${x1},${BASELINE_Y} `
  }
  return d
}

// A small curl sitting right at each wave crest -- the "waves that are
// also spirals, breaking" detail from the original sketch. A genuine
// hand-parametrised spiral (radius growing with angle from the crest
// point outward), not a fixed decorative shape, so one function draws
// all ten identically. Radius and turn count were tuned by actually
// rendering this to an image and checking it stayed within the
// viewBox -- an earlier draft's curl poked out above y=0, which would
// have bled into the section above it.
function buildCurlPath(cx, cy) {
  const turns = 1.15
  const rMax = 3.2
  const steps = 28
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const theta = t * turns * 2 * Math.PI
    const r = rMax * t
    const x = cx + r * Math.cos(theta)
    const y = cy - r * Math.sin(theta)
    d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)} ` : `L ${x.toFixed(2)},${y.toFixed(2)} `
  }
  return d
}

const WAVE_LINE_PATH = `M 0,${BASELINE_Y} ${buildWaveCommands()}`
const BOTTOM_REGION_PATH = `${WAVE_LINE_PATH} L ${VIEW_WIDTH},${VIEW_HEIGHT} L 0,${VIEW_HEIGHT} Z`
const CURL_PATHS = Array.from({ length: TILE_COUNT }, (_, i) =>
  buildCurlPath(i * TILE_WIDTH + TILE_WIDTH * 0.5, CREST_Y)
)

// Props:
//   colorAbove / colorBelow -- real hex values (see theme.js
//     SECTION_COLORS) matching whatever the sections immediately above
//     and below this divider are using, so colour never has a visible
//     seam anywhere except along the wave itself.
export default function PacificBorder({ colorAbove = '#FAF7F0', colorBelow = '#FAF7F0' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-4 w-full"
    >
      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={colorAbove} />
      <path d={BOTTOM_REGION_PATH} fill={colorBelow} />
      <path d={WAVE_LINE_PATH} fill="none" stroke={WAVE_STROKE} strokeWidth="1.6" strokeLinecap="round" />
      {CURL_PATHS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={WAVE_STROKE} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
