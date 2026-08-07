import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import { METRICS, TREND_METRIC } from '../utils/seaLevelMetrics.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'

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
  const ref = useRef(null)

  const allRows = useMemo(() => {
    if (!data) return []
    return (data.series[metric.key] ?? []).filter((d) => selectedNations.includes(d.nation))
  }, [data, selectedNations, metric.key])

  const trendNote = useMemo(() => {
    if (!data || selectedNations.length === 0) return null
    return buildTrendNote(data.trend ?? [], selectedNations)
  }, [data, selectedNations])

  const nationsMissing = data ? selectedNations.filter((n) => !allRows.some((d) => d.nation === n)) : []

  useEffect(() => {
    if (!allRows || allRows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    // Sea-level anomalies are small (single-digit centimetres, plotted
    // in metres) -- same reasoning as DroughtSnapshot.jsx for
    // overriding the default SI-prefix axis format.
    renderMetricChart(svg, {
      allRows,
      nations: selectedNations,
      valueField: metric.field,
      chartType: metric.chartType,
      format: metric.format,
      showTooltip,
      hideTooltip,
      yTickFormat: d3.format('.2f'),
    })
  }, [allRows, selectedNations, metric, showTooltip, hideTooltip])

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
        <div className="mt-2 animate-pop-in rounded-xl border border-ink/10 bg-white/60 p-3">
          {allRows.length > 0 ? (
            <svg ref={ref} role="img" aria-label={metric.label} className="h-auto w-full" />
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
            <caption>{metric.label} by year and country</caption>
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
                  <td>{d[metric.field]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trendNote && (
          <div
            className="animate-pop-in mt-8 rounded-xl border border-ink/10 bg-white/60 p-5"
            style={{ animationDelay: '120ms' }}
          >
            <h3 className="mb-3 text-sm font-semibold">Long-term trend</h3>
            <ul className="space-y-2 text-sm opacity-85">
              {trendNote.map((row) => (
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
