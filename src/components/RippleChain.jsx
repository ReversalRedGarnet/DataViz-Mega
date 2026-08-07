import { useEffect, useMemo, useRef } from 'react'
import { METRICS } from '../utils/metrics.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'
import { buildComparativeInsights } from '../utils/insights.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'

// The connected sequence view: one small chart per stage of the chain,
// filtered to whichever nation(s) are selected on the map. Chart
// implementation: D3 only -- no Plotly / Observable Plot, per the
// locked stack in README.md. Which chart *type* each metric uses (bar/
// line/area) is decided in metrics.js, based on how complete each
// metric's data actually is.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   selectedNations -- ordered array of nation names selected in
//     MapView. Order matters here: it drives which colour each nation
//     gets, kept in sync with the map's numbered badges.
//   style -- forwarded to the underlying Section, used by App.jsx to
//     stagger each section's entrance on first load
export default function RippleChain({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // Filtering here (rather than inline in the METRICS.map below) and
  // memoizing on [data, selectedNations] matters more than it looks:
  // the tooltip state above lives in this component, so hovering a
  // chart point re-renders RippleChain. Without memoizing, every hover
  // would produce brand-new `allRows` arrays for all five charts,
  // which -- since each chart's draw effect depends on `allRows` --
  // would re-run every D3 draw and replay every entrance animation on
  // every single hover. Memoizing keeps those array references stable
  // across a tooltip-only re-render, so only an actual selection
  // change redraws the charts.
  const filteredByMetric = useMemo(() => {
    if (!data) return null
    const result = {}
    for (const m of METRICS) {
      result[m.key] = data[m.key].filter((d) => selectedNations.includes(d.nation))
    }
    return result
  }, [data, selectedNations])

  const insights = useMemo(() => {
    if (!data || selectedNations.length !== 2) return null
    return buildComparativeInsights(data, selectedNations[0], selectedNations[1])
  }, [data, selectedNations])

  if (!data) return <EmptyState style={style}>Ripple chain -- waiting on data.</EmptyState>
  if (!selectedNations || selectedNations.length === 0) {
    return <EmptyState style={style}>Click a country on the map above to see its ripple chain.</EmptyState>
  }

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 text-xl font-semibold">The ripple chain</h2>
        <SelectionLegend selected={selectedNations} />
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {METRICS.map((m, i) => (
            <MetricChart
              key={m.key}
              metric={m}
              allRows={filteredByMetric[m.key]}
              nations={selectedNations}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
              spanFull={i === METRICS.length - 1 && METRICS.length % 2 !== 0}
            />
          ))}
        </div>

        {insights && (
          <div
            className="animate-pop-in mt-8 rounded-xl border border-ink/10 bg-surface/60 p-5"
            style={{ animationDelay: '120ms' }}
          >
            <h3 className="mb-3 text-sm font-semibold">
              {selectedNations[0]} vs. {selectedNations[1]}: similarities and differences
            </h3>
            <ul className="space-y-2 text-sm opacity-85">
              {insights.map((insight, i) => (
                <li
                  key={insight.key}
                  className="animate-pop-in flex gap-2"
                  style={{ animationDelay: `${160 + i * 70}ms` }}
                >
                  <span aria-hidden="true" className="opacity-50">
                    •
                  </span>
                  <span>{insight.text}</span>
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

function MetricChart({ metric, allRows, nations, showTooltip, hideTooltip, index, spanFull }) {
  const { key, label, field: valueField, chartType, format } = metric
  const ref = useRef(null)
  const { theme } = useTheme()
  const nationsMissing = nations.filter((n) => !allRows.some((d) => d.nation === n))

  useEffect(() => {
    if (!allRows || allRows.length === 0 || !ref.current) return

    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    renderMetricChart(svg, { allRows, nations, valueField, chartType, format, showTooltip, hideTooltip, theme })
  }, [allRows, nations, valueField, chartType, format, showTooltip, hideTooltip, theme])

  return (
    <div
      key={key}
      className={`animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-3 ${spanFull ? 'sm:col-span-2' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h3 className="mb-1 text-sm font-medium">{label}</h3>
      {allRows.length > 0 ? (
        <svg ref={ref} role="img" aria-label={label} className="h-auto w-full" />
      ) : (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="block py-6 text-center text-sm italic opacity-70"
        >
          Data not available for this metric.
        </NoDataNote>
      )}
      {allRows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="mt-1 inline-block text-xs italic opacity-70"
        >
          No data available for {nationsMissing.join(' and ')}.
        </NoDataNote>
      )}
      {/* Screen-reader-only data table -- the chart above conveys shape
          and trend visually, this gives the same numbers as text.

          whitespace-normal overrides the nowrap .sr-only sets (and
          which inherits into every cell) -- see the matching comment
          in StormProfile.jsx for why an inherited nowrap on a table
          can silently blow out the whole page's width. Nothing here
          is long enough to trigger it today, but the mechanism is
          identical, so it gets the same defensive fix rather than
          waiting for a future data value to be the one that does. */}
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
