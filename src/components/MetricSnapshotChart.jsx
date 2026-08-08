import { useEffect, useRef } from 'react'
import NoDataNote from './NoDataNote.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { resetSvg } from '../utils/d3helpers.js'
import { renderSnapshotChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'

// One "all nations, one moment" bar chart card: heading, chart or placeholder,
// a missing-nations note, and the matching sr-only table. Every snapshot
// section renders these; only the copy and the rows differ.
//
// Props:
//   label -- heading and sr-only caption; omit where the section's own <h2>
//     already names the single chart
//   ariaLabel -- label plus which moment is being compared, since the label
//     alone doesn't say when
//   rows -- [{ nation, value }]
//   nationsMissing -- nation names with no row here
//   missingNote, emptyNote -- copy for the two NoDataNote states
//   format, yTickFormat -- forwarded to renderSnapshotChart
//   showTooltip, hideTooltip
//   index -- entrance stagger
//   className -- layout hook (e.g. sm:col-span-2 for an odd one out)
export default function MetricSnapshotChart({
  label,
  ariaLabel,
  rows,
  nationsMissing,
  missingNote,
  emptyNote,
  format,
  yTickFormat,
  showTooltip,
  hideTooltip,
  index = 0,
  className = '',
}) {
  const ref = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!rows || rows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    renderSnapshotChart(svg, { rows, format, showTooltip, hideTooltip, yTickFormat, theme })
  }, [rows, format, yTickFormat, showTooltip, hideTooltip, theme])

  return (
    <div
      className={`animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-3 ${className}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {label && <h3 className="mb-1 text-sm font-medium">{label}</h3>}
      {rows.length > 0 ? (
        <svg ref={ref} role="img" aria-label={ariaLabel} className="h-auto w-full" />
      ) : (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="block py-6 text-center text-sm italic opacity-70"
        >
          {emptyNote}
        </NoDataNote>
      )}
      {rows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="mt-1 inline-block text-xs italic opacity-70"
        >
          {missingNote}
        </NoDataNote>
      )}
      <table className="sr-only whitespace-normal">
        <caption>{ariaLabel}</caption>
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
