import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'

// Catch-all route: says what happened, offers the one useful next step.
export default function NotFound() {
  return (
    <Section className="text-center">
      {/* text-center repeated on the <p>s -- see PageHero.jsx. */}
      <p className="mx-auto max-w-2xl text-center text-sm font-semibold uppercase tracking-wide opacity-70">404</p>
      <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight">This page doesn't exist.</h1>
      <p className="mx-auto mt-5 max-w-xl text-center text-lg opacity-80">
        The link may be out of date, or the page may not have been built yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full border border-ink/15 bg-surface/60 px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-surface/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Back to the homepage
      </Link>
    </Section>
  )
}
