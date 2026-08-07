// Site footer: data sources, plus copyright and a plain-language data
// disclaimer. One <footer>, not two, so screen readers see a single
// "contentinfo" landmark.
//
// bg-ink/text-sand rather than a lighter panel with low-opacity text
// (a common way small print quietly drops below WCAG's contrast
// minimum): reads as a clear, intentional close to the page. Also
// what makes this flip automatically in dark mode without a dark:
// variant -- ink/sand swap which raw color they resolve to (see
// index.css's :root/.dark blocks), so the footer stays the one panel
// that contrasts with whatever the surrounding page currently is.
//
// Props:
//   sources -- array of { label, url }
//   aboutTitle -- heading for the disclaimer block, default "About this data"
//   children -- optional; replaces the default Cyclone-specific
//     disclaimer paragraphs so a page with different data gaps/caveats
//     can say so accurately. Cyclones passes no children.
//   style -- forwarded onto the <footer>
const YEAR = new Date().getFullYear()

export default function CitationPanel({ sources = [], aboutTitle = 'About this data', children, style }) {
  return (
    <footer className="animate-pop-in px-6 py-8 md:py-10 bg-ink text-sand" style={style}>
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
