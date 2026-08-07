import { useMetricData } from './useMetricData.js'
import { METRICS } from '../utils/droughtMetrics.js'

export function useDroughtData() {
  return useMetricData(METRICS)
}
