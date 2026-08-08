import { useMemo } from 'react'
import { METRICS } from '../utils/metrics.js'
import { buildComparativeInsights } from '../utils/insights.js'
import { rowsByMetricForNations } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import TrendChart from './TrendChart.jsx'
import InsightsPanel from './InsightsPanel.jsx'
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

  // Memoised deliberately -- see rowsByMetricForNations' own note: the
  // tooltip state above lives in this component, so an unmemoised
  // filter would redraw every chart on every hover.
  const filteredByMetric = useMemo(
    () => rowsByMetricForNations(data, METRICS, selectedNations),
    [data, selectedNations]
  )

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
            <TrendChart
              key={m.key}
              label={m.label}
              allRows={filteredByMetric[m.key]}
              nations={selectedNations}
              valueField={m.field}
              chartType={m.chartType}
              format={m.format}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
              className={i === METRICS.length - 1 && METRICS.length % 2 !== 0 ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>

        {insights && (
          <InsightsPanel
            title={`${selectedNations[0]} vs. ${selectedNations[1]}: similarities and differences`}
            items={insights}
            staggerItems
          />
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
