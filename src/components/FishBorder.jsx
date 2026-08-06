import { PEWTER } from '../utils/theme.js'

// Interlocking geometric fish motif -- an original design based on the
// person's own hand-drawn sketch (a diamond body, cross-hatch fin
// lines, an eye), not a reproduction of a specific traditional
// pattern. Used only at the two boundaries that matter most -- Hero
// (the page's "header") into the first body section, and the last
// body section into CitationPanel (the "footer") -- everywhere else on
// the page keeps using the wave/spiral PacificBorder instead. Giving
// this motif only those two spots, rather than every section split,
// is what lets it read as "here's where the content starts / ends"
// instead of competing with the wave for the same job.
//
// Body fill is deliberately `none`, not a fixed colour: this divider
// sits across a colour transition (colorAbove above the seam,
// colorBelow below it), so a fish half-above/half-below the seam needs
// to show whatever's actually behind it rather than a fill colour that
// would mismatch one side or the other.
const TILE_WIDTH = 22
const BODY_LEN = 22
const BODY_H = 9
const TAIL = 5
const TILE_COUNT = 18
const VIEW_WIDTH = TILE_WIDTH * TILE_COUNT
const VIEW_HEIGHT = 20
const CY = VIEW_HEIGHT / 2

function buildFish(cx, cy, facingRight) {
  const half = BODY_LEN / 2
  const sign = facingRight ? 1 : -1
  const front = [cx + half * sign, cy]
  const back = [cx - half * sign, cy]
  const top = [cx, cy - BODY_H / 2]
  const bot = [cx, cy + BODY_H / 2]
  const tailTip = [back[0] - TAIL * sign, cy]
  const tailTop = [top[0] - (top[0] - back[0]) * 0.35, cy - BODY_H * 0.32]
  const tailBot = [bot[0] - (bot[0] - back[0]) * 0.35, cy + BODY_H * 0.32]

  return {
    body: `M ${front[0]},${front[1]} L ${top[0]},${top[1]} L ${back[0]},${back[1]} L ${bot[0]},${bot[1]} Z`,
    tail: `M ${tailTop[0]},${tailTop[1]} L ${tailTip[0]},${tailTip[1]} L ${tailBot[0]},${tailBot[1]}`,
    crosses: [
      `M ${top[0]},${top[1]} L ${bot[0]},${bot[1]}`,
      `M ${cx - half * 0.4},${cy - BODY_H * 0.3} L ${cx + half * 0.4},${cy + BODY_H * 0.3}`,
      `M ${cx - half * 0.4},${cy + BODY_H * 0.3} L ${cx + half * 0.4},${cy - BODY_H * 0.3}`,
    ],
    eye: [front[0] - half * 0.35 * sign, cy],
  }
}

// Props:
//   colorAbove / colorBelow -- same real hex values as PacificBorder,
//     filling the region above/below this divider's seam
//   direction -- 'right' | 'left', which way the row of fish faces
export default function FishBorder({ colorAbove = '#FAF7F0', colorBelow = '#FAF7F0', direction = 'right' }) {
  const fish = Array.from({ length: TILE_COUNT }, (_, i) =>
    buildFish(i * TILE_WIDTH + TILE_WIDTH / 2, CY, direction === 'right')
  )

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-5 w-full"
    >
      <rect x="0" y="0" width={VIEW_WIDTH} height={CY} fill={colorAbove} />
      <rect x="0" y={CY} width={VIEW_WIDTH} height={VIEW_HEIGHT - CY} fill={colorBelow} />
      {fish.map((f, i) => (
        <g key={i}>
          <path d={f.body} fill="none" stroke={PEWTER} strokeWidth="1" />
          <path d={f.tail} fill="none" stroke={PEWTER} strokeWidth="1" strokeLinejoin="round" />
          {f.crosses.map((c, j) => (
            <path key={j} d={c} fill="none" stroke={PEWTER} strokeWidth="0.6" />
          ))}
          <circle cx={f.eye[0]} cy={f.eye[1]} r="1" fill={PEWTER} />
        </g>
      ))}
    </svg>
  )
}
