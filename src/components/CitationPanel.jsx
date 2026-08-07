// Site footer: data sources (required by the competition rules and
// likely checked by the judging panel's dataviz engineer), plus
// copyright and a plain-language data disclaimer. One <footer>, not
// two, so screen readers see a single "contentinfo" landmark rather
// than two competing ones.
//
// Dark background is a deliberate contrast choice, not just decoration:
// the previous version leaned on low text opacity (60-70%) over the
// same light page background as everything else, which is a common way
// small print quietly drops below WCAG's contrast minimum. Light text
// on ink clears that easily at every opacity used below, and reads as
// a clear, intentional close to the page instead of fading into it.
//
// bg-ink/text-sand is what makes that inversion work automatically in
// dark mode too, without a dark: variant here: dark mode swaps which
// raw colour ink/sand each resolve to (see index.css's :root/.dark
// blocks), so this footer stays the one deliberately-inverted panel
// relative to whatever the surrounding page currently is -- dark
// panel on a light page in light mode, light panel on a dark page in
// dark mode. Same "contrasts with the page, doesn't fade into it"
// property either way.
//
// Props:
//   sources -- array of { label, url }
//   aboutTitle -- heading text for the disclaimer block, defaults to
//     "About this data". Only worth overriding if a page's disclaimer
//     genuinely isn't about "data" in the same sense (unlikely).
//   children -- optional; replaces the default Harold-specific
//     disclaimer paragraphs below with whatever a given page passes
//     in, so a hazard whose dataset has different gaps/caveats can
//     say so accurately instead of inheriting cyclone-specific
//     wording that wouldn't be true for it. Cyclones itself passes no
//     children, so it keeps exactly the paragraphs it always had.
//   style -- forwarded onto the <footer>, used by each page to
//     stagger its own sections' entrance on first load
const YEAR = new Date().getFullYear()

export default function CitationPanel({ sources = [], aboutTitle = 'About this data', children, style }) {
  return (
    // py-8/10, down from py-12/16 -- a deliberately modest trim (not a
    // full redesign) per direct feedback that the footer felt taller
    // than it needed to. space-y-6 (from space-y-8) tightens the same
    // amount, proportionally, between the three blocks inside.
    <footer className="animate-pop-in px-6 py-8 md:py-10 bg-ink text-sand" style={style}>
      {/* Headings styled as the site's "meta label" role (uppercase,
          tracked, text-sm) rather than the text-xl section-heading
          role used above the fold -- that's a deliberate size step
          down for a footer, not the unstyled default an <h2> falls
          back to without an explicit size (which is what these
          rendered as before: 14px inherited from the wrapping div's
          text-sm, no weight distinction from body text). */}
      <div className="max-w-5xl mx-auto text-sm space-y-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Data sources</h2>
          {sources.length === 0 ? (
            <p className="text-sand/60">No data sources listed yet.</p>
          ) : (
            <ul className="space-y-1">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} className="underline decoration-sand/40 hover:decoration-sand">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">{aboutTitle}</h2>
          {children ?? (
            <>
              <p className="text-sand/85">
                Figures are drawn from official Pacific Data Hub statistics for Solomon Islands,
                Vanuatu, Fiji, and Tonga. Data coverage varies by country and metric — direct
                disaster economic loss in particular is patchy for Solomon Islands and Vanuatu in
                the official dataset, and is labelled as unavailable where that's the case rather
                than left blank without explanation.
              </p>
              <p className="text-sand/85 mt-3">
                Even the data about these disasters is unevenly distributed — some nations have the
                infrastructure to measure and report losses in detail, others don't. As disasters
                grow more frequent, that gap will matter almost as much as the disasters themselves.
              </p>
              <p className="text-sand/85 mt-3">
                This site is illustrative and isn't intended to inform policy, funding, or financial
                decisions.
              </p>
            </>
          )}
        </div>

        <div className="text-sand/60 text-xs">
          <p>
            © {YEAR} Aziel Douglas Orihao. Code licensed under MIT (see LICENSE in the repository).
            Underlying datasets belong to their original sources, listed above, under their own
            respective licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
