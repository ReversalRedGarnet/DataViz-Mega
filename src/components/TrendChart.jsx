import { useEffect, useRef } from 'react'
import NoDataNote from './NoDataNote.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { resetSvg } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'

// One "selected nations, over time" chart card: heading, chart or placeholder,
// a missing-nations note, and the matching sr-only table. Every trends section
// renders these; only the metric config and the rows differ.
//
// Props:
//   label -- heading, sr-only caption, and svg aria-label
//   allRows, nations, valueField, chartType, format, yTickFormat --
//     forwarded to renderMetricChart
//   emptyNote -- "no data at all" copy; every caller uses the default
//   showTooltip, hideTooltip
//   index -- entrance stagger
//   className -- layout hook (e.g. sm:col-span-2 for an odd one out)
export default function TrendChart({
  label,
  allRows,
  nations,
  valueField,
  chartType,
  format,
  yTickFormat,
  emptyNote = 'Data not available for this metric.',
  showTooltip,
  hideTooltip,
  index = 0,
  className = '',
}) {
  const ref = useRef(null)
  const { theme } = useTheme()
  const nationsMissing = nations.filter((n) => !allRows.some((d) => d.nation === n))

  useEffect(() => {
    if (!allRows || allRows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    renderMetricChart(svg, {
      allRows,
      nations,
      valueField,
      chartType,
      format,
      showTooltip,
      hideTooltip,
      yTickFormat,
      theme,
    })
  }, [allRows, nations, valueField, chartType, format, yTickFormat, showTooltip, hideTooltip, theme])

  return (
    <div
      className={`animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-3 ${className}`}
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
          {emptyNote}
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
