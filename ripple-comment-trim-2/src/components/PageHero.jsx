import Section from './Section.jsx'

// The site's one hero pattern -- every story page (and Home) shares
// this instead of three near-identical copies drifting apart. Hero.jsx
// is a thin wrapper around this with Cyclone Harold's copy hardcoded.
//
// Props:
//   kicker -- short uppercase framing line above the headline
//   headline -- the page's one real <h1>
//   body -- lead paragraph(s); a string or any React node
//   cta -- optional closing line; omitted entirely when not passed
//   tone -- forwarded to Section, default 'plain'. Only Home.jsx
//     overrides this (to 'ink') -- see Home.jsx's own note.
//   headlineClassName -- replaces the default h1 sizing when passed;
//     Home.jsx uses this for a bigger display size.
//   style -- forwarded to Section
export default function PageHero({ kicker, headline, body, cta, tone = 'plain', headlineClassName, style }) {
  return (
    <Section tone={tone} className="text-center" style={style}>
      {/* text-center repeated directly on each <p>, not just relied on
          via Section's inherited value -- index.css's `p { text-align:
          justify }` rule beats an inherited alignment even at low
          specificity, so without this these single-line paragraphs
          would silently left-align instead of staying centered. */}
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
