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
//
// ink's dark:bg-panel/dark:text-ink pair (not a plain ink/sand flip)
// matches CitationPanel.jsx's footer fix -- see that file's comment
// for why an un-overridden bg-ink goes too bright in dark mode. PageHero's
// own text (kicker/body/cta) uses plain opacity-NN rather than an
// explicit text-sand/NN, so it inherits this correctly without needing
// its own dark: overrides.
const TONES = {
  plain: 'bg-sand',
  panel: 'bg-panel',
  ink: 'bg-ink text-sand dark:bg-panel dark:text-ink',
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
