import { SELECTION_COLORS } from '../utils/theme.js'

// Small color key so it's obvious which chart line / card border
// corresponds to which map pin -- shared by RippleChain and
// ComparisonView so the two stay visually in sync.
export default function SelectionLegend({ selected }) {
  if (!selected || selected.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-4 text-sm mb-4">
      {selected.map((name, i) => (
        <li key={name} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: SELECTION_COLORS[i] }}
            aria-hidden="true"
          />
          {name}
        </li>
      ))}
    </ul>
  )
}
