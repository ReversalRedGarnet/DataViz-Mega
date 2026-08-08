import { METRICS, EVENT_YEAR } from './metrics.js'
import { pctChange } from './rows.js'

// One bullet per metric, comparing the two selected nations from the event year
// to the latest on record. Deliberately not a ranking of "most interesting"
// findings: every bullet traces back to a specific chart above it.
//
// Returns [{ key, text }], always exactly METRICS.length entries.


function formatPct(p) {
  if (p === null) return null
  const sign = p > 0 ? '+' : ''
  return `${sign}${p.toFixed(0)}%`
}

export function buildComparativeInsights(data, nationA, nationB) {
  if (!data) return []

  return METRICS.map((m) => {
    const rowsA = (data[m.key] ?? []).filter((d) => d.nation === nationA).sort((a, b) => a.year - b.year)
    const rowsB = (data[m.key] ?? []).filter((d) => d.nation === nationB).sort((a, b) => a.year - b.year)
    const eventA = rowsA.find((r) => r.year === EVENT_YEAR)
    const latestA = rowsA[rowsA.length - 1]
    const eventB = rowsB.find((r) => r.year === EVENT_YEAR)
    const latestB = rowsB[rowsB.length - 1]

    const hasA = Boolean(eventA && latestA)
    const hasB = Boolean(eventB && latestB)

    if (!hasA && !hasB) {
      return {
        key: m.key,
        text: `${m.label}: not reliably reported for either ${nationA} or ${nationB} in the official dataset.`,
      }
    }
    if (!hasA || !hasB) {
      const missing = hasA ? nationB : nationA
      const present = hasA ? nationA : nationB
      return {
        key: m.key,
        text: `${m.label}: reported for ${present} but not for ${missing} -- a gap in reporting capacity, not necessarily in impact.`,
      }
    }

    // The event year can also be the last year on record: no post-event data
    // at all, not a 0% change. "X went from N to N" would read as a result.
    const noNewDataA = latestA.year === EVENT_YEAR
    const noNewDataB = latestB.year === EVENT_YEAR
    if (noNewDataA && noNewDataB) {
      return {
        key: m.key,
        text: `${m.label}: neither ${nationA} nor ${nationB} has data beyond ${EVENT_YEAR} in the official dataset.`,
      }
    }
    if (noNewDataA || noNewDataB) {
      const stalled = noNewDataA ? nationA : nationB
      const tracked = noNewDataA ? nationB : nationA
      const trackedRow = noNewDataA ? latestB : latestA
      const trackedEvent = noNewDataA ? eventB : eventA
      return {
        key: m.key,
        text: `${m.label}: ${stalled} has no data beyond ${EVENT_YEAR}, while ${tracked} went from ${m.format(
          trackedEvent[m.field]
        )} to ${m.format(trackedRow[m.field])} by ${trackedRow.year}.`,
      }
    }

    const pctA = pctChange(eventA[m.field], latestA[m.field])
    const pctB = pctChange(eventB[m.field], latestB[m.field])
    const sameDirection = pctA !== null && pctB !== null && Math.sign(pctA) === Math.sign(pctB)
    const gap = pctA !== null && pctB !== null ? Math.abs(pctA - pctB) : null

    let comparison
    if (sameDirection && gap !== null && gap < 25) comparison = 'a similar trajectory'
    else if (sameDirection) comparison = 'the same direction, but at a very different pace'
    else comparison = 'opposite directions'

    const changeA = formatPct(pctA)
    const changeB = formatPct(pctB)

    return {
      key: m.key,
      text: `${m.label}: ${nationA} went from ${m.format(eventA[m.field])} to ${m.format(latestA[m.field])}${
        changeA ? ` (${changeA})` : ''
      }, ${nationB} from ${m.format(eventB[m.field])} to ${m.format(latestB[m.field])}${
        changeB ? ` (${changeB})` : ''
      } -- ${comparison} since ${EVENT_YEAR}.`,
    }
  })
}
