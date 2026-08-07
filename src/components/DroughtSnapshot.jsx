import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { resetSvg } from '../utils/d3helpers.js'
import { renderSnapshotChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'
import { METRICS, REFERENCE_YEAR } from '../utils/droughtMetrics.js'

// Regional snapshot for the El Nino & Drought page -- same job
// BigPicture's snapshot half plays for Cyclones (all nations, one
// fixed moment, side by side), kept as its own small component
// instead of extending BigPicture.jsx because there's no equivalent
// here to that component's stat-tile half: Cyclone Harold has a
// single "what happened" event to summarise in numbers; a recurring
// 64-year climate cycle doesn't reduce to four tiles the same way.
//
// Props:
//   data -- { [metricKey]: rows }, from useDroughtData()
//   nations -- the page's own nation list (array of { name, ... }),
//     read here only for display order, matching how MapView already
//     receives its own nations prop from the same page
//   style -- forwarded to the underlying Section
export default function DroughtSnapshot({ data, nations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const snapshots = useMemo(() => computeSnapshots(data, nations), [data, nations])

  if (!data) {
    return (
      <Section tone="panel" style={style}>
        <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">Regional snapshot -- waiting on data.</p>
      </Section>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-1 text-xl font-semibold">Regional Snapshot -- {REFERENCE_YEAR}</h2>
        <p className="mb-6 max-w-2xl text-sm opacity-70">
          The {REFERENCE_YEAR} El Nino was among the strongest on record in the Pacific, and is what pushed
          Marshall Islands and Federated States of Micronesia to declare drought emergencies that year (see above).
          These charts read each nation's own drought index for December {REFERENCE_YEAR} side by side --
          a single moment, not a trend. Positive is wetter than that nation's own 1958-2021 average; negative is
          drier. -1 or below is conventionally read as moderate drought.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {METRICS.map((m, i) => (
            <DroughtMetricSnapshot
              key={m.key}
              metric={m}
              rows={snapshots[m.key]}
              nations={nations}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
            />
          ))}
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

function DroughtMetricSnapshot({ metric, rows, nations, showTooltip, hideTooltip, index }) {
  const { label, format } = metric
  const ref = useRef(null)
  const { theme } = useTheme()
  const nationsMissing = nations.map((n) => n.name).filter((n) => !rows.some((d) => d.nation === n))

  useEffect(() => {
    if (!rows || rows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    // SPI/SPEI run roughly -2..2 -- the chart's default axis format
    // (SI-prefix, tuned for the Cyclone metrics' much larger numbers)
    // would render 0.57 as "570m" here, so this passes a plain
    // fixed-decimal formatter instead. See chartRenderers.jsx.
    renderSnapshotChart(svg, { rows, format, showTooltip, hideTooltip, yTickFormat: d3.format('.2f'), theme })
  }, [rows, format, showTooltip, hideTooltip, theme])

  return (
    <div
      className="animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h3 className="mb-1 text-sm font-medium">{label}</h3>
      {rows.length > 0 ? (
        <svg ref={ref} role="img" aria-label={`${label}, December ${REFERENCE_YEAR}, by nation`} className="h-auto w-full" />
      ) : (
        <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="block py-6 text-center text-sm italic opacity-70">
          Data not available for {REFERENCE_YEAR}.
        </NoDataNote>
      )}
      {rows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="mt-1 inline-block text-xs italic opacity-70">
          No {REFERENCE_YEAR} data available for {formatNationList(nationsMissing)}.
        </NoDataNote>
      )}
      {/* Screen-reader-only data table, same pattern as every other
          chart on the site -- see the matching comment in
          RippleChain.jsx for why whitespace-normal matters here. */}
      <table className="sr-only whitespace-normal">
        <caption>
          {label}, December {REFERENCE_YEAR}, by nation
        </caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.nation}>
              <td>{d.nation}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Same Oxford-comma list grammar as BigPicture.jsx's formatNationList
// -- kept as a local copy rather than a shared import since it's a
// three-line pure function and importing across a components/utils
// boundary for something this small isn't worth the indirection.
function formatNationList(names) {
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

// One row per nation that has a REFERENCE_YEAR figure for this metric
// -- deliberately not falling back to a nearby year for a nation
// that's missing REFERENCE_YEAR, same reasoning as BigPicture.jsx's
// computeSnapshots: the whole point is a same-moment comparison, so a
// missing nation is shown as missing rather than quietly backfilled.
function computeSnapshots(data, nations) {
  if (!data) return null
  const order = nations.map((n) => n.name)
  const result = {}
  for (const m of METRICS) {
    result[m.key] = (data[m.key] ?? [])
      .filter((d) => d.year === REFERENCE_YEAR)
      .map((d) => ({ nation: d.nation, value: d[m.field] }))
      .sort((a, b) => order.indexOf(a.nation) - order.indexOf(b.nation))
  }
  return result
}
