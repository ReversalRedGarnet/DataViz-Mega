import { useMetricDataWith } from './useMetricData.js'
import { METRICS, TREND_METRIC } from '../utils/seaLevelMetrics.js'

const EXTRAS = { trend: { file: TREND_METRIC.file } }

export function useSeaLevelData() {
  return useMetricDataWith(METRICS, EXTRAS)
}
