import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import { METRICS, DROUGHT_THRESHOLD } from '../utils/droughtMetrics.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'

// The "compare" section for El Nino & Drought -- plays the role
// RippleChain.jsx plays for Cyclones, but shaped for a recurring cycle
// rather than a single event: a full 1958-2021 line per nation
// instead of a before/after snapshot, and a comparative note about how
// OFTEN each nation has crossed into drought rather than how much a
// single event changed things. Kept as its own component rather than
// generalising RippleChain.jsx to cover both shapes, since the two
// concepts (one event's before/after vs. a recurring cycle's
// frequency) don't actually share logic beyond the charting
// primitives both already pull from chartRenderers.jsx/d3helpers.js.
//
// Props:
//   data -- { [metricKey]: rows }, from useDroughtData()
//   selectedNations -- ordered array of nation names selected on the
//     map; order drives colour, kept in sync with the map's badges
//   style -- forwarded to the underlying Section
export default function DroughtTrends({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // Same memoisation reasoning as RippleChain.jsx: the tooltip state
  // above lives in this component, so a hover re-renders it, and
  // without memoising, every hover would hand each chart a brand new
  // array reference and replay its entrance animation.
  const filteredByMetric = useMemo(() => {
    if (!data) return null
    const result = {}
    for (const m of METRICS) {
      result[m.key] = data[m.key].filter((d) => selectedNations.includes(d.nation))
    }
    return result
  }, [data, selectedNations])

  const droughtYearCounts = useMemo(() => {
    if (!data || selectedNations.length !== 2) return null
    return buildDroughtYearComparison(data, selectedNations[0], selectedNations[1])
  }, [data, selectedNations])

  if (!data) return <EmptyState tone="panel" style={style}>Drought trends -- waiting on data.</EmptyState>
  if (!selectedNations || selectedNations.length === 0) {
    return (
      <EmptyState tone="panel" style={style}>
        Click a country on the map above to see its drought record.
      </EmptyState>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 text-xl font-semibold">Six decades of wet and dry</h2>
        <p className="mb-4 max-w-2xl text-sm opacity-70">
          Each line is that nation's own December SPI-12/SPEI-12 reading, year by year, back to 1958. Watch for the
          dips: most line up with a documented El Nino.
        </p>
        <SelectionLegend selected={selectedNations} />
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {METRICS.map((m, i) => (
            <DroughtMetricChart
              key={m.key}
              metric={m}
              allRows={filteredByMetric[m.key]}
              nations={selectedNations}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
            />
          ))}
        </div>

        {droughtYearCounts && (
          <div
            className="animate-pop-in mt-8 rounded-xl border border-ink/10 bg-white/60 p-5"
            style={{ animationDelay: '120ms' }}
          >
            <h3 className="mb-3 text-sm font-semibold">
              {selectedNations[0]} vs. {selectedNations[1]}: how often has each crossed into drought?
            </h3>
            <ul className="space-y-2 text-sm opacity-85">
              {droughtYearCounts.map((row) => (
                <li key={row.key} className="flex gap-2">
                  <span aria-hidden="true" className="opacity-50">
                    •
                  </span>
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

function DroughtMetricChart({ metric, allRows, nations, showTooltip, hideTooltip, index }) {
  const { key, label, field: valueField, chartType, format } = metric
  const ref = useRef(null)
  const nationsMissing = nations.filter((n) => !allRows.some((d) => d.nation === n))

  useEffect(() => {
    if (!allRows || allRows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    // Same reasoning as DroughtSnapshot.jsx -- SPI/SPEI are small
    // signed decimals, not the large non-negative counts/currency the
    // default SI-prefix axis format was tuned for.
    renderMetricChart(svg, {
      allRows,
      nations,
      valueField,
      chartType,
      format,
      showTooltip,
      hideTooltip,
      yTickFormat: d3.format('.2f'),
    })
  }, [allRows, nations, valueField, chartType, format, showTooltip, hideTooltip])

  return (
    <div
      key={key}
      className="animate-pop-in rounded-xl border border-ink/10 bg-white/60 p-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h3 className="mb-1 text-sm font-medium">{label}</h3>
      {allRows.length > 0 ? (
        <svg ref={ref} role="img" aria-label={label} className="h-auto w-full" />
      ) : (
        <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="block py-6 text-center text-sm italic opacity-70">
          Data not available for this metric.
        </NoDataNote>
      )}
      {allRows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="mt-1 inline-block text-xs italic opacity-70">
          No data available for {nationsMissing.join(' and ')}.
        </NoDataNote>
      )}
      <table className="sr-only whitespace-normal">
        <caption>{label} by year and country</caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Year</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((d) => (
            <tr key={`${d.nation}-${d.year}`}>
              <td>{d.nation}</td>
              <td>{d.year}</td>
              <td>{d[valueField]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Counts, for each nation, how many years in its own SPI-12 record hit
// DROUGHT_THRESHOLD (-1) or below -- a direct, real readout of the
// already-standard index (see droughtMetrics.js), not a new score.
// Mirrors insights.js's shape (one entry per relevant comparison) but
// isn't imported from there: insights.js is built entirely around
// EVENT_YEAR before/after, which has no equivalent for a cycle that
// repeats every few years across a 64-year record.
function buildDroughtYearComparison(data, nationA, nationB) {
  const spi = data.spi12 ?? []
  const rowsA = spi.filter((d) => d.nation === nationA)
  const rowsB = spi.filter((d) => d.nation === nationB)

  if (rowsA.length === 0 && rowsB.length === 0) {
    return [
      {
        key: 'none',
        text: `SPI-12 isn't reliably available for either ${nationA} or ${nationB} in this dataset.`,
      },
    ]
  }
  if (rowsA.length === 0 || rowsB.length === 0) {
    const missing = rowsA.length === 0 ? nationA : nationB
    const present = rowsA.length === 0 ? nationB : nationA
    return [{ key: 'missing', text: `SPI-12 is reported for ${present} but not for ${missing} in this dataset.` }]
  }

  const droughtYearsA = rowsA.filter((d) => d.spi12 <= DROUGHT_THRESHOLD)
  const droughtYearsB = rowsB.filter((d) => d.spi12 <= DROUGHT_THRESHOLD)
  const spanA = `${rowsA[0].year}-${rowsA[rowsA.length - 1].year}`
  const spanB = `${rowsB[0].year}-${rowsB[rowsB.length - 1].year}`

  const rows = [
    {
      key: 'count',
      text: `${nationA} has recorded ${droughtYearsA.length} moderate-or-worse drought year${
        droughtYearsA.length === 1 ? '' : 's'
      } (SPI-12 \u2264 ${DROUGHT_THRESHOLD}) across ${spanA}; ${nationB} has recorded ${droughtYearsB.length} across ${spanB}.`,
    },
  ]

  const mostRecentA = [...droughtYearsA].sort((a, b) => b.year - a.year)[0]
  const mostRecentB = [...droughtYearsB].sort((a, b) => b.year - a.year)[0]
  if (mostRecentA || mostRecentB) {
    const partsText = [
      mostRecentA ? `${nationA} most recently in ${mostRecentA.year}` : `${nationA} not in this record`,
      mostRecentB ? `${nationB} most recently in ${mostRecentB.year}` : `${nationB} not in this record`,
    ].join(', ')
    rows.push({ key: 'recent', text: `Most recent drought year -- ${partsText}.` })
  }

  return rows
}
