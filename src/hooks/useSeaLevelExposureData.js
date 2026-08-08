import { useMetricDataWith } from './useMetricData.js'
import { METRICS, NOTES_FILE } from '../utils/seaLevelExposureMetrics.js'

// Notes fall back to an empty list rather than blocking the page: the
// charts are the point here, the caveats are commentary on them.
const EXTRAS = { notes: { file: NOTES_FILE, fallback: [] } }

export function useSeaLevelExposureData() {
  return useMetricDataWith(METRICS, EXTRAS)
}
