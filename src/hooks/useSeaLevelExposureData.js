import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'
import { useMetricData } from './useMetricData.js'
import { METRICS, NOTES_FILE } from '../utils/seaLevelExposureMetrics.js'

// Same shape as useSeaLevelData.js's { series, trend } split -- notes
// aren't a year-by-year series either, so they're kept out of the flat
// { [key]: rows } object useMetricData returns.
export function useSeaLevelExposureData() {
  const series = useMetricData(METRICS)
  const [notes, setNotes] = useState(null)

  useEffect(() => {
    loadDataset(NOTES_FILE)
      .then(setNotes)
      .catch((err) => {
        console.error('Failed to load sea level exposure notes:', err)
        setNotes([])
      })
  }, [])

  if (!series || notes === null) return null

  return { series, notes }
}
