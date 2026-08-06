import { Link } from 'react-router-dom'

// One hazard story, as a card on the homepage grid. Deliberately the
// same visual vocabulary as a StatTile/MetricChart card elsewhere on
// the site (rounded-xl border-ink/10 bg-white/60) rather than a new
// "homepage card" style -- the grid should read as one more section
// of the same site, not a landing-page template bolted on front.
//
// Props:
//   hazard -- one entry from src/content/hazards.js
//   index -- position in the grid, only used to stagger the shared
//     .animate-pop-in entrance so cards don't all pop in on the same
//     frame
export default function HazardCard({ hazard, index = 0 }) {
  return (
    <Link
      to={hazard.path}
      className="animate-pop-in group block rounded-xl border border-ink/10 bg-white/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{hazard.timescale}</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink group-hover:underline">
        {hazard.title}
      </h3>
      <p className="mt-2 text-sm opacity-80">{hazard.cardBlurb}</p>
      {hazard.status === 'shell' && (
        <p className="mt-3 text-xs italic opacity-60">Layout and framing are in place; the data pipeline is next.</p>
      )}
    </Link>
  )
}
