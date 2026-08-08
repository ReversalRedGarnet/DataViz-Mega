// Real color values for places JS/D3 needs an actual string (Tailwind
// classes don't work inside D3's .attr('fill', ...) calls).
//
// Darker than the decorative ocean/sun tokens in tailwind.config.js --
// same hue family, adjusted to clear WCAG 2.1's 3:1 minimum for
// graphical objects (white text on ocean-data/gold-data: 5.8:1/5.4:1).
export const SELECTION_COLORS = ['#3D6B7D', '#8A6300'] // pick 1 (ocean-data), pick 2 (gold-data)

// Fill colors per Section `tone`, for PacificBorder to paint the regions
// either side of its wave. An SVG fill attribute can't read a CSS custom
// property, so these deliberately duplicate the :root/.dark variables in
// index.css and must be kept in step with them.
const SECTION_COLORS_BY_THEME = {
  light: {
    plain: '#FAF7F0', // tailwind 'sand'
    panel: '#F1EADC', // deeper neutral, for editorial-aside sections
    ink: '#24333A', // tailwind 'ink', the footer's background
  },
  dark: {
    plain: '#181E21',
    panel: '#222A2E',
    // Same value as panel, by design: in dark mode the 'ink' tone renders as
    // dark:bg-panel rather than flipping to the light tone, which read as too
    // bright. The wave seam shows a colour mismatch if this drifts from it.
    ink: '#222A2E',
  },
}

export function sectionColorsFor(theme) {
  return SECTION_COLORS_BY_THEME[theme] ?? SECTION_COLORS_BY_THEME.light
}


// Axis text/gridlines for D3 charts. The marks themselves keep
// SELECTION_COLORS in both themes -- already legible on either -- but axis
// text is ink-coloured and would vanish on a dark background.
export const CHART_INK = {
  light: '#24333A',
  dark: '#F0ECE3',
}

// Halo around chart points, matching the card behind them so overlapping marks
// stay distinct. Kept in step with --color-surface.
export const CHART_SURFACE = {
  light: '#FFFFFF',
  dark: '#293236',
}

// Accent for the fish border motif and the cursor's highlight edge -- ink and
// sand blended 60/40, not a new hue. ~3.7:1 on sand, ~3.3:1 on panel: enough
// to read as a pattern, not enough for load-bearing text.
export const PEWTER = '#7A8183'

// Map ocean/land/coastline. A dimmed, desaturated dark-mode counterpart in the
// same hue family, rather than the map keeping its light colours the way an
// embedded Google Map does -- at full brightness it overwhelmed a dark page.
// Marker and selection colours are unchanged; both read fine on either.
export const MAP_COLORS = {
  light: { ocean: '#7FBFD9', land: '#FAF7F0', coastline: '#C9DCE2' },
  dark: { ocean: '#2E4A57', land: '#293236', coastline: '#3E4B50' },
}
