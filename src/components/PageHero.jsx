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
//   tone -- forwarded to the underlying Section, default 'plain'. Only
//     Home.jsx overrides this (to 'ink') -- see Home.jsx's own note on
//     why its hero is a deliberate exception to the shared look.
//   headlineClassName -- replaces the default h1 sizing when passed,
//     rather than appending to it -- Home.jsx uses this for a bigger
//     display size than every hazard page's headline, a second half
//     of that same deliberate exception.
//   style -- forwarded to the underlying Section, used by each page to
//     stagger its own sections' entrance on first load
export default function PageHero({
  kicker,
  headline,
  body,
  cta,
  tone = 'plain',
  headlineClassName,
  style,
}) {
  return (
    <Section tone={tone} className="text-center" style={style}>
      {/* text-center repeated directly on each <p>, not just relied on
          via inheritance from the Section above -- index.css's global
          `p { text-align: justify }` rule (see "Justify the texts"
          feedback) sits at base-layer specificity, which loses to a
          Tailwind utility class on the same element but NOT to a
          merely-inherited value on a child with no rule of its own.
          Without this, these short single-line paragraphs would
          silently left-align instead of staying centered, since a
          justified block's one-and-only line defaults to start-
          aligned per the CSS spec. */}
      <p className="mx-auto max-w-2xl text-center text-sm font-semibold uppercase tracking-wide opacity-70">
        {kicker}
      </p>
      <h1 className={`mx-auto mt-3 max-w-3xl ${headlineClassName ?? 'text-3xl font-bold tracking-tight md:text-5xl'}`}>
        {headline}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-center text-lg opacity-80">{body}</p>
      {cta && <p className="mx-auto mt-4 max-w-2xl text-center text-lg font-medium opacity-80">{cta}</p>}
    </Section>
  )
}
