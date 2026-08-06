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
export const SECTION_COLORS = {
  plain: '#FAF7F0', // == tailwind 'sand', the page's base background
  panel: '#F1EADC', // a slightly deeper, warm neutral -- used sparingly for the two "editorial" sections (BigPicture, Compare recovery) so they read as a distinct panel without introducing a new hue
  ink: '#24333A', // == tailwind 'ink', the footer's background
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
