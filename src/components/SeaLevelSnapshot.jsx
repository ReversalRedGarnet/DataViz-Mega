import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderSnapshotChart, CHART_WIDTH, CHART_HEIGHT } from '../utils/chartRenderers.jsx'
import { TREND_METRIC } from '../utils/seaLevelMetrics.js'

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
  const ref = useRef(null)

  const rows = useMemo(() => {
    if (!data) return []
    const order = nations.map((n) => n.name)
    return (data.trend ?? [])
      .map((d) => ({ nation: d.nation, value: d[TREND_METRIC.field] }))
      .sort((a, b) => order.indexOf(a.nation) - order.indexOf(b.nation))
  }, [data, nations])

  const nationsMissing = data ? nations.map((n) => n.name).filter((n) => !rows.some((d) => d.nation === n)) : []

  useEffect(() => {
    if (!rows || rows.length === 0 || !ref.current) return
    const svg = resetSvg(ref, CHART_WIDTH, CHART_HEIGHT)
    // mm/year trends are small numbers (single digits here) -- same
    // reasoning as DroughtSnapshot.jsx for overriding the default
    // SI-prefix axis format.
    renderSnapshotChart(svg, {
      rows,
      format: TREND_METRIC.format,
      showTooltip,
      hideTooltip,
      yTickFormat: d3.format('.1f'),
    })
  }, [rows, showTooltip, hideTooltip])

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
        <div className="animate-pop-in rounded-xl border border-ink/10 bg-white/60 p-3">
          {rows.length > 0 ? (
            <svg
              ref={ref}
              role="img"
              aria-label="Long-term sea level trend in millimetres per year, by nation"
              className="h-auto w-full"
            />
          ) : (
            <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="block py-6 text-center text-sm italic opacity-70">
              Trend data not available.
            </NoDataNote>
          )}
          {rows.length > 0 && nationsMissing.length > 0 && (
            <NoDataNote showTooltip={showTooltip} hideTooltip={hideTooltip} className="mt-1 inline-block text-xs italic opacity-70">
              Not enough years of reliable data to compute a trend for {formatNationList(nationsMissing)}.
            </NoDataNote>
          )}
          <table className="sr-only whitespace-normal">
            <caption>Long-term sea level trend (mm/year), by nation</caption>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Trend (mm/year)</th>
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
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

// Same small helper as DroughtSnapshot.jsx/BigPicture.jsx -- see the
// comment there for why this stays a local copy rather than a shared
// import.
function formatNationList(names) {
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}
