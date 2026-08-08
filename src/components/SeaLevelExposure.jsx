import { useMemo } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { METRICS, REFERENCE_YEAR } from '../utils/seaLevelExposureMetrics.js'
import { formatNationList } from '../utils/formatNationList.js'

// Regional snapshot of who actually lives within reach of sea level --
// complements SeaLevelSnapshot.jsx's mm/year trend with a different
// real question: not how fast the ocean is rising, but how many
// people already live low enough for it to matter. Real Pacific
// Community population-grid and elevation modelling (see
// clean_sea_level_exposure_data.py), not the tide-gauge data the rest
// of this page uses -- a second, independent dataset, not a derived
// number.
//
// Props:
//   data -- { series, notes }, from useSeaLevelExposureData()
//   nations -- the page's own nation list (array of { name, ... }),
//     read here only for display order
//   style -- forwarded to the underlying Section
export default function SeaLevelExposure({ data, nations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const snapshots = useMemo(() => computeSnapshots(data?.series, nations), [data, nations])

  if (!data) {
    return (
      <Section tone="panel" style={style}>
        <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">
          Population exposure -- waiting on data.
        </p>
      </Section>
    )
  }

  const insightItems = data.notes.map((n) => ({ key: n.nation, text: n.note }))

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-1 text-xl font-semibold">Who's in the water's way — {REFERENCE_YEAR}</h2>
        <p className="mb-6 max-w-2xl text-sm opacity-70">
          Share of each nation's population living within 10 and 20 metres of current sea level, from the Pacific
          Community's own population-grid and elevation modelling. This is a snapshot of exposure today, not a
          trend — the underlying estimates are periodically revised rather than continuously measured, so a
          year-by-year line here would overstate how precisely this changes year to year.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {METRICS.map((m, i) => {
            const rows = snapshots[m.key]
            const nationsMissing = nations.map((n) => n.name).filter((n) => !rows.some((d) => d.nation === n))
            return (
              <MetricSnapshotChart
                key={m.key}
                label={m.label}
                ariaLabel={`${m.label}, ${REFERENCE_YEAR}, by nation`}
                rows={rows}
                nationsMissing={nationsMissing}
                missingNote={`No ${REFERENCE_YEAR} estimate available for ${formatNationList(nationsMissing)}.`}
                emptyNote={`Data not available for ${REFERENCE_YEAR}.`}
                format={m.format}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                index={i}
              />
            )
          })}
        </div>

        {insightItems.length > 0 && <InsightsPanel title="Worth knowing about this data" items={insightItems} />}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

// One row per nation that has a REFERENCE_YEAR figure for this metric
// -- same reasoning as every other snapshot on this site: a missing
// nation is shown as missing, not quietly backfilled from a different
// year.
function computeSnapshots(series, nations) {
  if (!series) return null
  const order = nations.map((n) => n.name)
  const result = {}
  for (const m of METRICS) {
    result[m.key] = (series[m.key] ?? [])
      .filter((d) => d.year === REFERENCE_YEAR)
      .map((d) => ({ nation: d.nation, value: d[m.field] }))
      .sort((a, b) => order.indexOf(a.nation) - order.indexOf(b.nation))
  }
  return result
}
