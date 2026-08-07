// Real color values for places JS/D3 needs an actual string (Tailwind
// classes don't work inside D3's .attr('fill', ...) calls).
//
// Darker than the decorative ocean/sun tokens in tailwind.config.js --
// same hue family, adjusted to clear WCAG 2.1's 3:1 minimum for
// graphical objects (white text on ocean-data/gold-data: 5.8:1/5.4:1).
export const SELECTION_COLORS = ['#3D6B7D', '#8A6300'] // pick 1 (ocean-data), pick 2 (gold-data)

// Fill colors for each Section `tone` and the footer background --
// PacificBorder needs a real color string, not a Tailwind class, to
// paint the two regions on either side of the wave divider.
//
// Must stay in sync with the :root/.dark CSS variables in index.css --
// an SVG fill attribute can't read a CSS custom property directly, so
// these are a deliberate, documented duplicate rather than computed.
// sectionColorsFor(theme) is how each page picks light or dark.
const SECTION_COLORS_BY_THEME = {
  light: {
    plain: '#FAF7F0', // tailwind 'sand'
    panel: '#F1EADC', // slightly deeper neutral, used sparingly for editorial sections (BigPicture, Compare recovery)
    ink: '#24333A', // tailwind 'ink', the footer's background
  },
  dark: {
    plain: '#181E21',
    panel: '#222A2E',
    ink: '#F0ECE3', // footer flips to a light panel in dark mode, since 'ink' is the light tone there
  },
}

export function sectionColorsFor(theme) {
  return SECTION_COLORS_BY_THEME[theme] ?? SECTION_COLORS_BY_THEME.light
}

// Fallback for any call site not yet made theme-aware -- the light
// palette, i.e. the only palette that existed before dark mode.
export const SECTION_COLORS = SECTION_COLORS_BY_THEME.light

// Axis text/gridline color for D3-drawn charts (chartRenderers.jsx).
// Chart marks (bars/lines/points) keep SELECTION_COLORS regardless of
// theme -- already legible on light or dark. Axis text isn't: it's
// ink-colored, so it needs to track the theme or go unreadable on a
// dark background.
export const CHART_INK = {
  light: '#24333A',
  dark: '#F0ECE3',
}

// Halo stroke around chart points, matching the card background
// (tailwind 'surface') behind them so overlapping marks stay
// distinct. Kept in sync with --color-surface the same way CHART_INK
// is kept in sync with --color-ink.
export const CHART_SURFACE = {
  light: '#FFFFFF',
  dark: '#293236',
}

// Accent for the fish border motif (FishBorder.jsx) and the cursor's
// highlight edge -- ink and sand blended 60/40, not a new hue, so the
// same tone reads as one deliberate choice across both. Contrast
// against sand ~3.7:1, against panel ~3.3:1 -- visible as a pattern,
// not load-bearing text.
export const PEWTER = '#7A8183'
