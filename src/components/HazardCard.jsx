import { Link } from 'react-router-dom'

// One hazard story, as a card on the homepage grid. Deliberately
// louder than a StatTile/MetricChart card elsewhere on the site (a
// thick coloured top border, a bigger heading) rather than the exact
// same quiet vocabulary those use -- per direct feedback that Home
// should read as more "in your face" than the hazard pages it
// introduces. The accent colour alternates ocean/sun by position
// rather than introducing a new hue -- both are already the site's
// only two accent colours (see tailwind.config.js), just given more
// visual weight here than either gets anywhere else on the site.
//
// Props:
//   hazard -- one entry from src/content/hazards.js
//   index -- position in the grid, both for the shared .animate-pop-in
//     stagger AND for which of the two accent colours this card gets
const ACCENTS = ['border-t-ocean', 'border-t-sun']

export default function HazardCard({ hazard, index = 0 }) {
  return (
    <Link
      to={hazard.path}
      className={`animate-pop-in group block rounded-xl border border-t-4 border-ink/10 bg-surface/60 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${ACCENTS[index % ACCENTS.length]}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{hazard.timescale}</p>
      <h3 className="mt-1 text-xl font-bold tracking-tight text-ink group-hover:underline">{hazard.title}</h3>
      <p className="mt-2 text-sm opacity-80">{hazard.cardBlurb}</p>
      {hazard.status === 'shell' && (
        <p className="mt-3 text-xs italic opacity-60">Layout and framing are in place; the data pipeline is next.</p>
      )}
    </Link>
  )
}
