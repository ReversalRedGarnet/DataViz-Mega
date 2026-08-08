import Section from './Section.jsx'

// The site's one hero pattern, shared by every page. Hero.jsx is this with
// Cyclone Harold's copy hardcoded.
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
      {/* text-center repeated on each <p>: index.css's `p { text-align:
          justify }` beats an alignment inherited from Section, so without it
          these paragraphs silently left-align. */}
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
