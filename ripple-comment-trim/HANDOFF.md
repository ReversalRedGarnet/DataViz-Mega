# Comment-trim pass, round 1 -- 5 files

Apply on top of `Simplify` (with both dedup passes already in place).
This is the top 5 by comment volume, not the whole remaining set --
the other ~15 files are lower priority per the original assessment
(polish, not duplication) and can follow the same treatment later if
you want it.

## Files and line counts

    theme.js             83 -> 62  (-25%)
    PacificBorder.jsx     94 -> 80  (-15%)
    CitationPanel.jsx    104 -> 77  (-26%)
    ScrollProgress.jsx   184 -> 154 (-16%)
    MapView.jsx          411 -> 375 (-9%, mostly D3 code, less comment to cut)

Same standard as the pipeline/metrics trim from earlier: kept every
comment that documents a real, non-obvious decision (the WCAG contrast
numbers in theme.js, the antimeridian rotation in MapView, the
floor-vs-round fix in ScrollProgress, the overflow-hidden bug fix),
cut narration and repetition.

## What I checked

- **JS bundle byte-identical** (347.04 kB, same as before this pass) --
  expected, since comments never ship in the minified bundle. This
  pass only changes source readability, not runtime behavior.
- **A real, if harmless, thing I caught mid-pass**: my first draft of
  the trimmed `CitationPanel.jsx` used the word "invert" in a comment
  ("...makes this invert automatically in dark mode..."). Tailwind's
  content scanner does a plain text scan for anything that looks like
  a utility class name -- it doesn't distinguish a comment from a
  className -- so it generated an unused `.invert{}` rule into the
  compiled CSS from that one word. Zero visual effect (nothing has
  `className="invert"`), but it's dead CSS, which is exactly the kind
  of thing this whole pass is about removing. Reworded to "flip" and
  reran a full source-wide scan for other Tailwind-utility-shaped
  words appearing in prose comments across all 5 files -- one other
  hit (`overflow-hidden` in a MapView.jsx comment), which is the real,
  already-in-use class it's describing, not a phantom.
- **CSS bundle actually shrank slightly** (20.61 kB -> 20.41 kB) once
  that was fixed -- smaller than even the pre-this-pass baseline.
- `npm install && npx vite build`: clean.

## Not touched, in case it's useful to know

By comment-line count, the next tier down is `Header.jsx` (29
comment lines), `useTooltip.js` (22), `PageHero.jsx`/`Section.jsx`/
`SectionNav.jsx` (~21 each), `FishBorder.jsx`/`useTheme.jsx` (~20
each) -- meaningfully less dense than this round's 5, so lower
priority, but there if you want a round 2.
