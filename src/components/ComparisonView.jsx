import { METRICS, EVENT_YEAR } from '../utils/metrics.js'
import { SELECTION_COLORS } from '../utils/theme.js'
import { pctChange } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import EmptyState from './EmptyState.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'

// The selected nations side by side across each stage of the ripple chain,
// event year against the latest year on record.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   selectedNations -- ordered; order drives colour
//   style -- forwarded to Section (entrance stagger)
export default function ComparisonView({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  if (!data) return <EmptyState tone="panel" style={style}>Comparison -- waiting on data.</EmptyState>
  if (!selectedNations || selectedNations.length < 2) {
    return (
      <EmptyState tone="panel" style={style}>
        Select a second country on the map to compare.
      </EmptyState>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-1 text-xl font-semibold">Compare recovery</h2>
        <p className="mb-6 text-sm opacity-70">Event year ({EVENT_YEAR}) versus the latest year on record.</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {selectedNations.map((nation, i) => (
            <NationSummary
              key={nation}
              nation={nation}
              data={data}
              color={SELECTION_COLORS[i]}
              index={i}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
          ))}
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}


function NationSummary({ nation, data, color, index, showTooltip, hideTooltip }) {
  return (
    <div
      className="animate-pop-in rounded-2xl border-t-4 bg-surface/80 p-6 shadow-sm"
      style={{ borderColor: color, animationDelay: `${index * 100}ms` }}
    >
      <h3 className="text-lg font-semibold">{nation}</h3>
      <p className="mb-4 text-xs uppercase tracking-wide opacity-70">Since {EVENT_YEAR}</p>
      <ul className="divide-y divide-ink/10 text-sm">
        {METRICS.map((m) => {
          const rows = (data[m.key] ?? [])
            .filter((d) => d.nation === nation)
            .sort((a, b) => a.year - b.year)
          const eventRow = rows.find((r) => r.year === EVENT_YEAR)
          const latestRow = rows[rows.length - 1]

          return (
            <li key={m.key} className="flex items-center justify-between gap-4 py-2.5">
              <span className="opacity-70">{m.label}</span>
              {eventRow && latestRow ? (
                <Delta metric={m} eventRow={eventRow} latestRow={latestRow} />
              ) : (
                <NoDataNote
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  className="text-xs italic opacity-70"
                >
                  No data available
                </NoDataNote>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Before/after figures plus a direction and magnitude badge. Ink-only, with a
// glyph carrying the direction rather than red/green, so this doesn't layer a
// second colour scheme on top of the one used for nation selection.
function Delta({ metric, eventRow, latestRow }) {
  const from = eventRow[metric.field]
  const to = latestRow[metric.field]
  const pct = pctChange(from, to)

  return (
    <span className="flex flex-col items-end">
      <span className="font-medium tabular-nums">
        {metric.format(from)} <span className="opacity-40">→</span> {metric.format(to)}
      </span>
      {pct !== null && (
        <span className="mt-0.5 flex items-center gap-1 text-xs font-medium opacity-70">
          <span aria-hidden="true">{pct >= 0 ? '▲' : '▼'}</span>
          {Math.abs(pct).toFixed(0)}%
        </span>
      )}
    </span>
  )
}
