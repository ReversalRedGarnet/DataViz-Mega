import { useMemo } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { METRICS, REFERENCE_YEAR } from '../utils/droughtMetrics.js'
import { formatNationList } from '../utils/formatNationList.js'
import { missingNations, snapshotRowsByMetric } from '../utils/rows.js'

// Computed once at module load, not inside the component -- d3.format
// returns a brand-new function object on every call, even with the
// same string. Calling it inline in JSX would hand MetricSnapshotChart
// a "changed" yTickFormat prop (by reference) on every re-render,
// including the ones triggered by hovering the chart's own tooltip --
// which would re-trigger its draw effect and replay the whole chart's
// entrance animation on every hover/touch.
const YTICK_FORMAT = d3.format('.2f')

// Regional snapshot for the El Nino & Drought page -- same job
// BigPicture's snapshot half plays for Cyclones (all nations, one
// fixed moment, side by side), kept as its own small component
// instead of extending BigPicture.jsx because there's no equivalent
// here to that component's stat-tile half: Cyclone Harold has a
// single "what happened" event to summarise in numbers; a recurring
// 64-year climate cycle doesn't reduce to four tiles the same way.
//
// Props:
//   data -- { [metricKey]: rows }, from useMetricData(METRICS)
//   nations -- the page's own nation list (array of { name, ... }),
//     read here only for display order, matching how MapView already
//     receives its own nations prop from the same page
//   style -- forwarded to the underlying Section
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

