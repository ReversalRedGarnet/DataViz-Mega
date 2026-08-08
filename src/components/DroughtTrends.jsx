import { useMemo } from 'react'
import * as d3 from 'd3'
import { METRICS, DROUGHT_THRESHOLD } from '../utils/droughtMetrics.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { rowsByMetricForNations } from '../utils/rows.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import TrendChart from './TrendChart.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import Tooltip from './Tooltip.jsx'

// Computed once at module load, not inline in JSX -- see
// DroughtSnapshot.jsx for why an inline d3.format() call would cause
// the chart to fully redraw on every hover/touch.
const YTICK_FORMAT = d3.format('.2f')

// The "compare" section for El Nino & Drought -- plays the role
// RippleChain.jsx plays for Cyclones, but shaped for a recurring cycle
// rather than a single event: a full 1958-2021 line per nation
// instead of a before/after snapshot, and a comparative note about how
// OFTEN each nation has crossed into drought rather than how much a
// single event changed things.
//
// Props:
//   data -- { [metricKey]: rows }, from useMetricData(METRICS)
//   selectedNations -- ordered array of nation names selected on the
//     map; order drives colour, kept in sync with the map's badges
//   style -- forwarded to the underlying Section
export default function DroughtTrends({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const filteredByMetric = useMemo(
    () => rowsByMetricForNations(data, METRICS, selectedNations),
    [data, selectedNations]
  )

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
            <TrendChart
              key={m.key}
              label={m.label}
              allRows={filteredByMetric[m.key]}
              nations={selectedNations}
              valueField={m.field}
              chartType={m.chartType}
              format={m.format}
              yTickFormat={YTICK_FORMAT}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
            />
          ))}
        </div>

        {droughtYearCounts && (
          <InsightsPanel
            title={`${selectedNations[0]} vs. ${selectedNations[1]}: how often has each crossed into drought?`}
            items={droughtYearCounts}
          />
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

// Counts, for each nation, how many years in its own SPI-12 record hit
// DROUGHT_THRESHOLD (-1) or below -- a direct, real readout of the
// already-standard index (see droughtMetrics.js), not a new score.
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
