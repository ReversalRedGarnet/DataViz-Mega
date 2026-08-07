import { useMemo } from 'react'
import * as d3 from 'd3'
import { METRICS, TREND_METRIC } from '../utils/seaLevelMetrics.js'
import { useTooltip } from '../hooks/useTooltip.js'
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

// The "compare" section for Sea Level Rise -- same role
// DroughtTrends.jsx/RippleChain.jsx play for their pages, shaped for a
// continuous long-term trend: one chart (there's only one real metric
// here -- see seaLevelMetrics.js), plus each selected nation's own
// mm/year trend restated in plain language underneath.
//
// Props:
//   data -- { series, trend }, from useSeaLevelData()
//   selectedNations -- ordered array of nation names selected on the
//     map; order drives colour, kept in sync with the map's badges
//   style -- forwarded to the underlying Section
export default function SeaLevelTrends({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const metric = METRICS[0]

  const allRows = useMemo(() => {
    if (!data) return []
    return (data.series[metric.key] ?? []).filter((d) => selectedNations.includes(d.nation))
  }, [data, selectedNations, metric.key])

  const trendNote = useMemo(() => {
    if (!data || selectedNations.length === 0) return null
    return buildTrendNote(data.trend ?? [], selectedNations)
  }, [data, selectedNations])

  if (!data) return <EmptyState tone="panel" style={style}>Sea level trend -- waiting on data.</EmptyState>
  if (!selectedNations || selectedNations.length === 0) {
    return (
      <EmptyState tone="panel" style={style}>
        Click a nation on the map above to see its sea level record.
      </EmptyState>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 text-xl font-semibold">Each station's own record</h2>
        <p className="mb-4 max-w-2xl text-sm opacity-70">
          Metres above or below that station's own long-term average -- see this page's footer for why the
          stations' raw readings aren't shown side by side directly.
        </p>
        <SelectionLegend selected={selectedNations} />
        <div className="mt-2">
          <TrendChart
            label={metric.label}
            allRows={allRows}
            nations={selectedNations}
            valueField={metric.field}
            chartType={metric.chartType}
            format={metric.format}
            yTickFormat={YTICK_FORMAT}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        </div>

        {trendNote && <InsightsPanel title="Long-term trend" items={trendNote} />}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

// Restates each selected nation's own mm/year trend (already computed
// in the pipeline via ordinary least squares -- see
// clean_sea_level_data.py) in plain language. Not a new calculation;
// this is the same TREND_METRIC data SeaLevelSnapshot.jsx charts,
// just read out for whichever 1-2 nations are currently selected.
function buildTrendNote(trendRows, selectedNations) {
  const rows = []
  for (const nation of selectedNations) {
    const row = trendRows.find((d) => d.nation === nation)
    if (row) {
      rows.push({
        key: nation,
        text: `${nation}'s sea level has risen at an average of ${TREND_METRIC.format(row.trend_mm_per_year)} over its own tide-gauge record.`,
      })
    } else {
      rows.push({
        key: nation,
        text: `${nation} doesn't yet have enough reliable years on record here to compute a trend.`,
      })
    }
  }
  return rows
}
