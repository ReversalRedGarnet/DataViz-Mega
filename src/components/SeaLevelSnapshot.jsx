import { useMemo } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { TREND_METRIC } from '../utils/seaLevelMetrics.js'
import { formatNationList } from '../utils/formatNationList.js'
import { byNationOrder, missingNations } from '../utils/rows.js'

// Module level -- see DroughtSnapshot.jsx.
const YTICK_FORMAT = d3.format('.1f')

// Regional snapshot for Sea Level Rise. No reference year to anchor to -- sea
// level rise has no event and no cycle -- so this shows the one figure that IS
// safe to compare across stations: each one's own mm/year trend. Raw metres
// aren't comparable; see clean_sea_level_data.py.
//
// Props:
//   data -- { series, trend }, from useSeaLevelData()
//   nations -- the page's nation list, read here only for display order
//   style -- forwarded to Section
export default function SeaLevelSnapshot({ data, nations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const nationNames = useMemo(() => nations.map((n) => n.name), [nations])

  const rows = useMemo(() => {
    if (!data) return []
    return (data.trend ?? [])
      .map((d) => ({ nation: d.nation, value: d[TREND_METRIC.field] }))
      .sort(byNationOrder(nationNames))
  }, [data, nationNames])

  const nationsMissing = data ? missingNations(nationNames, rows) : []

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
