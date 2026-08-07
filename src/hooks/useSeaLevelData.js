import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'
import { useMetricData } from './useMetricData.js'
import { METRICS, TREND_METRIC } from '../utils/seaLevelMetrics.js'

// TREND_METRIC isn't a year-by-year series, so it's fetched separately
// and kept out of the flat { [key]: rows } shape useMetricData returns.
export function useSeaLevelData() {
  const series = useMetricData(METRICS)
  const [trend, setTrend] = useState(null)

  useEffect(() => {
    loadDataset(TREND_METRIC.file)
      .then(setTrend)
      .catch((err) => console.error('Failed to load sea level trend:', err))
  }, [])

  if (!series || !trend) return null

  return { series, trend }
}
