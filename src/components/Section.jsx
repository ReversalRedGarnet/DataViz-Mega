// Shared section wrapper: semantic <section>, consistent padding, a
// max-width reading column, and the site's one entrance animation
// (see .animate-pop-in in index.css) -- baked in here so every section
// pops in consistently without each caller remembering to add it.
//
// `tone` is deliberately just two values, not the four different
// pastel backgrounds this used to carry: 'plain' is the page's own
// sand background (i.e. no visible section box at all -- most
// sections use this), and 'panel' is a single restrained neutral used
// for the two sections that read as an editorial aside rather than
// the interactive canvas (BigPicture, Compare recovery). Colour is
// not used to tell every section apart anymore -- the PacificBorder
// divider between sections does that job now (see App.jsx), and does
// it precisely: each divider is told the exact tone on both sides via
// SECTION_COLORS, so a panel's background starts and ends exactly at
// the wave seam instead of needing a flat, abrupt cut.
const TONES = {
  plain: 'bg-sand',
  panel: 'bg-panel',
}

export default function Section({ tone = 'plain', className = '', style, children, ...rest }) {
  return (
    <section
      className={`animate-pop-in px-6 py-12 md:py-16 ${TONES[tone] ?? TONES.plain} ${className}`}
      style={style}
      {...rest}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  )
}
