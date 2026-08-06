import { useState } from 'react'

// Selection state for "pick up to two nations to compare" -- shared by
// MapView, RippleChain, and ComparisonView via App.jsx. Pulled out into
// its own hook so App.jsx stays thin and this logic is testable on its
// own.
export function useSelection() {
  const [selected, setSelected] = useState([])

  function toggle(name) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (prev.length >= 2) return [prev[1], name] // drop the oldest, keep the newest pair
      return [...prev, name]
    })
  }

  function clear() {
    setSelected([])
  }

  return { selected, toggle, clear }
}
