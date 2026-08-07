import { useMetricData } from './useMetricData.js'
import { METRICS } from '../utils/metrics.js'

export function useRippleData() {
  return useMetricData(METRICS)
}
