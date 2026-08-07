import { useMemo } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { TREND_METRIC } from '../utils/seaLevelMetrics.js'
import { formatNationList } from '../utils/formatNationList.js'

// Computed once at module load, not inline in JSX -- see
// DroughtSnapshot.jsx for why an inline d3.format() call would cause
// the chart to fully redraw on every hover/touch.
const YTICK_FORMAT = d3.format('.1f')

// Regional snapshot for Sea Level Rise -- one bar per nation, but
// unlike DroughtSnapshot.jsx/BigPicture.jsx there's no shared
// reference YEAR to anchor this to (sea level rise has no event and
// no cycle -- see README.md's framing for this page). The one number
// that IS safe to put side by side across nations is each station's
// own long-term trend in mm/year (see clean_sea_level_data.py for why
// raw metres aren't), so that's what this snapshot shows instead of a
// same-year comparison.
//
// Props:
//   data -- { series, trend }, from useSeaLevelData()
//   nations -- the page's own nation list (array of { name, ... }),
//     read here only for display order
//   style -- forwarded to the underlying Section
export default function SeaLevelSnapshot({ data, nations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const rows = useMemo(() => {
    if (!data) return []
    const order = nations.map((n) => n.name)
    return (data.trend ?? [])
      .map((d) => ({ nation: d.nation, value: d[TREND_METRIC.field] }))
      .sort((a, b) => order.indexOf(a.nation) - order.indexOf(b.nation))
  }, [data, nations])

  const nationsMissing = data ? nations.map((n) => n.name).filter((n) => !rows.some((d) => d.nation === n)) : []

  if (!data) {
    return (
      <Section tone="panel" style={style}>
        <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">Regional snapshot -- waiting on data.</p>
      </Section>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-2xl">
        <h2 className="mb-1 text-xl font-semibold">Regional Snapshot -- long-term trend</h2>
        <p className="mb-6 max-w-2xl text-sm opacity-70">
          Each bar is that station's own rate of sea level rise, in millimetres per year, fitted across its full
          tide-gauge record. Unlike raw sea-level readings, a rate like this IS comparable station to station -- see
          this page's footer for why raw readings aren't.
        </p>
        <MetricSnapshotChart
          ariaLabel="Long-term sea level trend in millimetres per year, by nation"
          rows={rows}
          nationsMissing={nationsMissing}
          missingNote={`Not enough years of reliable data to compute a trend for ${formatNationList(nationsMissing)}.`}
          emptyNote="Trend data not available."
          format={TREND_METRIC.format}
          yTickFormat={YTICK_FORMAT}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
