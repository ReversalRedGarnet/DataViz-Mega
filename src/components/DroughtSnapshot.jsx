import { useMemo } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { METRICS, REFERENCE_YEAR } from '../utils/droughtMetrics.js'
import { formatNationList } from '../utils/formatNationList.js'
import { missingNations, snapshotRowsByMetric } from '../utils/rows.js'

// Module level, not inline in JSX: d3.format returns a new function object
// every call, so an inline one would look like a changed prop on every
// re-render -- including tooltip hovers -- and replay the entrance animation.
const YTICK_FORMAT = d3.format('.2f')

// Regional snapshot: all nations, one fixed moment, side by side. Separate
// from BigPicture's version because a recurring 64-year cycle has no equivalent
// of that component's "what happened" stat tiles.
//
// Props:
//   data -- { [metricKey]: rows }, from useMetricData(METRICS)
//   nations -- the page's nation list, read here only for display order
//   style -- forwarded to Section
export default function DroughtSnapshot({ data, nations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const nationNames = useMemo(() => nations.map((n) => n.name), [nations])
  const snapshots = useMemo(
    () => snapshotRowsByMetric(data, METRICS, REFERENCE_YEAR, nationNames),
    [data, nationNames]
  )

  if (!data) {
    return (
      <Section tone="panel" style={style}>
        <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">Regional snapshot -- waiting on data.</p>
      </Section>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-1 text-xl font-semibold">Regional Snapshot -- {REFERENCE_YEAR}</h2>
        <p className="mb-6 max-w-2xl text-sm opacity-70">
          The {REFERENCE_YEAR} El Nino was among the strongest on record in the Pacific, and is what pushed
          Marshall Islands and Federated States of Micronesia to declare drought emergencies that year (see above).
          These charts read each nation's own drought index for December {REFERENCE_YEAR} side by side --
          a single moment, not a trend. Positive is wetter than that nation's own 1958-2021 average; negative is
          drier. -1 or below is conventionally read as moderate drought.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {METRICS.map((m, i) => {
            const rows = snapshots[m.key]
            const nationsMissing = missingNations(nationNames, rows)
            return (
              <MetricSnapshotChart
                key={m.key}
                label={m.label}
                ariaLabel={`${m.label}, December ${REFERENCE_YEAR}, by nation`}
                rows={rows}
                nationsMissing={nationsMissing}
                missingNote={`No ${REFERENCE_YEAR} data available for ${formatNationList(nationsMissing)}.`}
                emptyNote={`Data not available for ${REFERENCE_YEAR}.`}
                format={m.format}
                yTickFormat={YTICK_FORMAT}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                index={i}
              />
            )
          })}
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

