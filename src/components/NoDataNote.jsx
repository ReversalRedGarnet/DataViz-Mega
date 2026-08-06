const EXPLANATION =
  "This metric isn't consistently reported by every country in the official Pacific Data Hub dataset -- smaller nations often have less capacity to compile detailed disaster statistics. As disasters grow more frequent, closing that reporting gap will matter too."

// Shared "no data available" inline note, used anywhere a metric is
// missing for a selected nation (RippleChain and ComparisonView both
// had their own copy of this explanation behind a native `title`
// attribute, which never appears on a touch device -- see
// useTooltip.js). Centralising it also means the explanation only
// needs to be worded once.
//
// Props:
//   showTooltip / hideTooltip -- from the nearest useTooltip() call
//   children -- the visible label, e.g. "No data available"
export default function NoDataNote({ showTooltip, hideTooltip, className = '', children }) {
  return (
    <span
      tabIndex={0}
      className={`data-note cursor-help underline decoration-dotted decoration-ink/40 ${className}`}
      onMouseEnter={(e) => showTooltip(e, EXPLANATION)}
      onMouseLeave={hideTooltip}
      onFocus={(e) => showTooltip(e, EXPLANATION)}
      onBlur={hideTooltip}
      onClick={(e) => showTooltip(e, EXPLANATION)}
    >
      {children}
    </span>
  )
}
