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

// Copy for each page's aria-live region -- the charts below it update
// silently otherwise. `singleNote` is an optional extra sentence for
// the one-nation case (Cyclones points at its ripple chain).
export function selectionAnnouncement(selected, singleNote = '') {
  if (selected.length === 0) return ''
  if (selected.length === 1) return `${selected[0]} selected.${singleNote ? ` ${singleNote}` : ''}`
  return `Comparing ${selected[0]} and ${selected[1]}.`
}
