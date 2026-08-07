// The bordered "here's what changed" panel below a hazard's trend
// charts -- identical card markup in RippleChain/DroughtTrends/
// SeaLevelTrends; only the heading text and each hazard's own
// comparison logic (insights.js's buildComparativeInsights, or the
// local buildDroughtYearComparison/buildTrendNote functions) differ.
//
// Props:
//   title -- panel heading
//   items -- [{ key, text }]
//   staggerItems -- RippleChain's bullets individually pop in with a
//     staggered delay; DroughtTrends/SeaLevelTrends' don't. A real,
//     pre-existing inconsistency between the three -- preserved as an
//     opt-in flag here rather than silently unified one way or the
//     other during the merge.
export default function InsightsPanel({ title, items, staggerItems = false }) {
  return (
    <div
      className="animate-pop-in mt-8 rounded-xl border border-ink/10 bg-surface/60 p-5"
      style={{ animationDelay: '120ms' }}
    >
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm opacity-85">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={staggerItems ? 'animate-pop-in flex gap-2' : 'flex gap-2'}
            style={staggerItems ? { animationDelay: `${160 + i * 70}ms` } : undefined}
          >
            <span aria-hidden="true" className="opacity-50">
              •
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
