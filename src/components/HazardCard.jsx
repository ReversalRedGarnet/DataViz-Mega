import { Link } from 'react-router-dom'

// One hazard story as a homepage card. Deliberately louder than the quiet card
// vocabulary used elsewhere -- Home should read as more "in your face" than the
// pages it introduces -- but the accent alternates between the site's existing
// two accent colours rather than introducing a third.
//
// Props:
//   hazard -- one entry from src/content/hazards.js
//   index -- grid position; drives both the entrance stagger and the accent
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
