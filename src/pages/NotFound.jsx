import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'

// Catch-all route. Kept in the site's own voice (plain, matter-of-fact,
// no dead-end) rather than a generic framework default -- see
// "Treat failure and emptiness as moments for direction, not mood" in
// the design notes: says what happened, offers the one useful next
// step, nothing more.
export default function NotFound() {
  return (
    <Section className="text-center">
      <p className="mx-auto max-w-2xl text-sm font-semibold uppercase tracking-wide opacity-70">404</p>
      <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight">This page doesn't exist.</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg opacity-80">
        The link may be out of date, or the page may not have been built yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full border border-ink/15 bg-white/60 px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Back to the homepage
      </Link>
    </Section>
  )
}
