import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'
import { METRICS } from '../utils/metrics.js'

// Loads and combines every metric dataset into one { [metricKey]: rows }
// object. Pulled out of App.jsx so the loading concern lives alongside
// useSelection instead of inline in the component.
export function useRippleData() {
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
      .catch((err) => console.error('Failed to load datasets:', err))
  }, [])

  return data
}
