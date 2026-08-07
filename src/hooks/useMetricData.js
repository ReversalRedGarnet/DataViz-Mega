import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'

// Loads a list of { key, file } metrics and combines them into one
// { [key]: rows } object. Shared by every hazard page's data hook --
// useRippleData/useDroughtData are now one-line wrappers around this;
// useSeaLevelData layers its extra trend dataset on top.
export function useMetricData(metrics) {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all(metrics.map((m) => loadDataset(m.file)))
      .then((results) => {
        const combined = {}
        metrics.forEach((m, i) => {
          combined[m.key] = results[i]
        })
        setData(combined)
      })
      .catch((err) => console.error('Failed to load datasets:', err))
  }, [metrics])

  return data
}
