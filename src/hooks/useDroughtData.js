import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'
import { METRICS } from '../utils/droughtMetrics.js'

// Loads and combines every drought metric dataset into one
// { [metricKey]: rows } object -- same shape/role as useRippleData.js,
// kept separate because it reads droughtMetrics.js's METRICS rather
// than metrics.js's.
export function useDroughtData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all(METRICS.map((m) => loadDataset(m.file)))
      .then((results) => {
        const combined = {}
        METRICS.forEach((m, i) => {
          combined[m.key] = results[i]
        })
        setData(combined)
      })
      .catch((err) => console.error('Failed to load drought datasets:', err))
  }, [])

  return data
}
