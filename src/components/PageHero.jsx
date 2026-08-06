import Section from './Section.jsx'

// The site's one hero pattern, extracted so every story page (and the
// homepage) shares the exact same treatment instead of three near-
// identical copies of the same markup drifting apart over time.
// Hero.jsx is now a thin wrapper around this with Cyclone Harold's
// copy hardcoded in, so CyclonesPage.jsx didn't need to change at all.
//
// Props:
//   kicker -- short uppercase framing line above the headline
//   headline -- the page's one real <h1>
//   body -- the lead paragraph(s); a string or any React node
//   cta -- optional closing line (e.g. "Scroll to..."); omitted
//     entirely, not just hidden, when not passed
//   style -- forwarded to the underlying Section, used by each page to
//     stagger its own sections' entrance on first load
export default function PageHero({ kicker, headline, body, cta, style }) {
  return (
    <Section className="text-center" style={style}>
      <p className="mx-auto max-w-2xl text-sm font-semibold uppercase tracking-wide opacity-70">{kicker}</p>
      <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{headline}</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg opacity-80">{body}</p>
      {cta && <p className="mx-auto mt-4 max-w-2xl text-lg font-medium opacity-80">{cta}</p>}
    </Section>
  )
}
