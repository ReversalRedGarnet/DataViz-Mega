// Real color values for places JS/D3 needs an actual string (Tailwind
// classes don't work inside D3's .attr('fill', ...) calls).
//
// These are deliberately DARKER than the decorative ocean/sun tokens in
// tailwind.config.js. A contrast check (WCAG 2.1) found the original
// soft pastel yellow measured ~1.5:1 as a chart line or badge fill
// against the page background -- badly under the 3:1 minimum for
// graphical objects, and white text on it came out under 2:1. These
// values keep the same ocean/gold hue family but darken enough to pass:
//   white text on ocean-data / gold-data: 5.8:1 / 5.4:1
//   line-on-page-background:              5.5:1 / 5.1:1
export const SELECTION_COLORS = ['#3D6B7D', '#8A6300'] // pick 1 (ocean-data), pick 2 (gold-data)

// Real hex values matching each Section `tone` (see Section.jsx) and
// the footer's ink background -- PacificBorder needs actual colour
// strings (not Tailwind class names) to fill the two regions on
// either side of the wave divider between sections.
//
// Split into light/dark to match dark mode's swapped ink/sand roles
// (see the :root / .dark blocks in index.css) -- these hex values
// MUST stay in sync with those CSS variables; there's no way for a
// literal SVG fill attribute to read a CSS custom property directly,
// so this is the one spot that duplicates them on purpose rather than
// computing them. Each page picks light or dark via sectionColorsFor()
// below, based on the current theme (see useTheme.jsx).
const SECTION_COLORS_BY_THEME = {
  light: {
    plain: '#FAF7F0', // == tailwind 'sand', the page's base background
    panel: '#F1EADC', // a slightly deeper, warm neutral -- used sparingly for the two "editorial" sections (BigPicture, Compare recovery) so they read as a distinct panel without introducing a new hue
    ink: '#24333A', // == tailwind 'ink', the footer's background
  },
  dark: {
    plain: '#181E21',
    panel: '#222A2E',
    ink: '#F0ECE3', // the footer's background is 'ink' in light mode -- in dark mode that becomes the light tone, so the footer flips to a warm off-white panel instead of disappearing into the same-colour page background
  },
}

export function sectionColorsFor(theme) {
  return SECTION_COLORS_BY_THEME[theme] ?? SECTION_COLORS_BY_THEME.light
}

// Kept for any call site that hasn't been made theme-aware -- resolves
// to the light palette, i.e. today's only palette before dark mode
// existed, so nothing regresses if a future addition forgets to pass
// a theme.
export const SECTION_COLORS = SECTION_COLORS_BY_THEME.light

// Ink/background pair for D3-drawn chart text, gridlines, and axis
// strokes (chartRenderers.jsx) -- the chart MARKS themselves (bars,
// lines, points) keep using SELECTION_COLORS/the fixed accent colours
// above regardless of theme, since those are already legible on both
// a light and a dark background. Axis text and gridlines are
// different: they're literally ink-coloured today, and ink-on-ink
// would be unreadable if the page went dark underneath them, so those
// specifically need to track the theme.
export const CHART_INK = {
  light: '#24333A',
  dark: '#F0ECE3',
}

// The thin halo stroke drawn around chart points/dots so an
// overlapping point or line reads as a distinct mark rather than a
// solid blob -- needs to match whatever's actually behind it, which
// is the chart's own card (tailwind 'surface', see tailwind.config.js
// and the :root/.dark blocks in index.css), not the page background
// one level further out. Kept in exact sync with --color-surface's
// two values the same way CHART_INK is kept in sync with --color-ink.
export const CHART_SURFACE = {
  light: '#FFFFFF',
  dark: '#293236',
}

// Decorative accent for the fish border motif (FishBorder.jsx) and the
// spear cursor's highlight edge -- deliberately NOT a new, unrelated
// hue. It's ink and sand blended at 60/40, i.e. literally made out of
// two colours already in the palette, which is why the same tone
// works for both: one accent shared across two decorative touches
// reads as one deliberate choice rather than each picking its own
// colour independently. Contrast against sand: ~3.7:1; against panel:
// ~3.3:1 -- visible as a pattern without needing WCAG text-contrast
// levels, since it's decorative rather than load-bearing information.
export const PEWTER = '#7A8183'
