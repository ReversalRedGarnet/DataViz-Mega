# Comment-trim pass, round 2 -- 6 files

Apply on top of `Simplify` (with both dedup passes + round 1 already
in place).

## Files and line counts

    Header.jsx        121 -> 88  (-27%)
    CyclonesPage.jsx   127 -> 115 (-9%)
    PageHero.jsx        55 -> 35  (-36%)
    Section.jsx         38 -> 29  (-24%)
    useTooltip.js       62 -> 60  (-3%, already fairly lean -- most of
                                    its comments document real, non-
                                    obvious behavior, so there wasn't
                                    much to cut without losing content)
    FishBorder.jsx      82 -> 79  (small trim, see below)

## One thing worth flagging: FishBorder.jsx's comment was wrong, not just long

Its original comment claimed it's "used only at the two boundaries
that matter most" (Hero and the footer). I checked the actual pages --
`FishBorder` isn't imported by any of them. `PacificBorder` (the wave/
spiral motif) is the only divider actually wired in anywhere.
`FishBorder` is a complete, working component that's just never been
called. Rewrote the comment to say that plainly instead of describing
usage that doesn't exist -- a stale comment claiming something untrue
is worse than a verbose one, so this got a correction, not just a
trim. Left the component itself alone (still fully functional if you
want to use it somewhere).

## What I checked

- Same content-scan gotcha as round 1: swept all 6 files for English
  words that happen to match real Tailwind utility names (`fixed`,
  `container`, `uppercase`, `visible`, etc. all show up as ordinary
  prose in these files' comments). Checked each one against the
  compiled CSS before AND after this round's edits -- none were new;
  everything that compiled was already being generated from real
  className usage elsewhere, confirmed by diffing against the round-1
  baseline CSS.
- **CSS bundle kept shrinking**: 20.41 kB (end of round 1) -> 19.75 kB.
- **JS bundle byte-identical** (347.04 kB) -- expected, comments don't
  ship.
- `npm install && npx vite build`: clean.

## Where this leaves things

Two rounds in: `MapView.jsx`, `ScrollProgress.jsx`, `theme.js`,
`CitationPanel.jsx`, `PacificBorder.jsx`, `Header.jsx`,
`CyclonesPage.jsx`, `PageHero.jsx`, `Section.jsx`, `useTooltip.js`,
`FishBorder.jsx` -- 11 files done. What's left (`chartRenderers.jsx`,
`SectionNav.jsx`, `useTheme.jsx`, `ComparisonView.jsx`, the individual
hazard pages) is either already reasonably lean (files I wrote fresh
during the dark-mode/nav work already used tighter comments from the
start) or, like `chartRenderers.jsx`, has a low comment-to-code ratio
where most of what's there documents a real bug fix rather than
narrating a design choice. Diminishing returns from here -- I'd call
the comment-trim effort essentially done unless you spot a specific
file that still reads bloated to you.
