// Shared section wrapper: semantic <section>, consistent padding, a
// max-width reading column, and the site's one entrance animation
// (see .animate-pop-in in index.css).
//
// `tone`: 'plain' is the page's own sand background (most sections),
// 'panel' is a restrained neutral for the two editorial-aside sections
// (BigPicture, Compare recovery), 'ink' is Home's hero -- the same
// dark/light inversion CitationPanel's footer uses, not a new hue.
// Colour otherwise doesn't tell sections apart -- the PacificBorder
// divider between them does that (see sectionColorsFor(theme)), so a
// panel/ink section's background starts and ends exactly at the wave
// seam rather than a flat cut.
const TONES = {
  plain: 'bg-sand',
  panel: 'bg-panel',
  ink: 'bg-ink text-sand',
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
