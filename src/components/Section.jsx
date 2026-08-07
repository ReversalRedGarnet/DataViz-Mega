// Shared section wrapper: semantic <section>, consistent padding, a
// max-width reading column, and the site's one entrance animation
// (see .animate-pop-in in index.css) -- baked in here so every section
// pops in consistently without each caller remembering to add it.
//
// `tone` covers three values now, not the four different pastel
// backgrounds this used to carry: 'plain' is the page's own sand
// background (i.e. no visible section box at all -- most sections use
// this), 'panel' is a single restrained neutral used for the two
// sections that read as an editorial aside rather than the
// interactive canvas (BigPicture, Compare recovery), and 'ink' is a
// third, deliberately loud exception -- the same dark/light inversion
// CitationPanel's footer already uses, reused here (not a fourth new
// hue) specifically for Home's hero, per direct feedback that the
// homepage should read as more "in your face" than the quieter hazard
// pages it introduces. Colour otherwise doesn't tell every section
// apart -- the PacificBorder divider between sections does that job
// (see each page file), and does it precisely: each divider is told
// the exact tone on both sides via sectionColorsFor(theme), so a
// panel/ink section's background starts and ends exactly at the wave
// seam instead of needing a flat, abrupt cut.
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
