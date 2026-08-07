import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'
import { METRICS, TREND_METRIC } from '../utils/seaLevelMetrics.js'

// Loads the sea-level datasets. Returns { series, trend } rather than
// useRippleData.js/useDroughtData.js's flat { [metricKey]: rows } --
// TREND_METRIC isn't a year-by-year series (see seaLevelMetrics.js),
// so it doesn't belong filed under the same per-metric-key shape as
// `series`; keeping it as its own top-level field is more honest
// about it being a different kind of value than folding it in under a
// key that implies "just another yearly metric".
export function useSeaLevelData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([...METRICS.map((m) => loadDataset(m.file)), loadDataset(TREND_METRIC.file)])
      .then((results) => {
        const trend = results[results.length - 1]
        const series = {}
        METRICS.forEach((m, i) => {
          series[m.key] = results[i]
        })
        setData({ series, trend })
      })
      .catch((err) => console.error('Failed to load sea level datasets:', err))
  }, [])

  return data
}
