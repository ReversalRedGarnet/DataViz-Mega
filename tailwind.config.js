/** @type {import('tailwindcss').Config} */
export default {
  // Class-based, not media-query-based: a person's OS-level preference
  // still picks the initial theme (see useTheme.jsx), but the toggle
  // in Header.jsx needs to be able to override it and have that
  // override persist -- `darkMode: 'media'` can't do either, since it
  // only ever reflects the OS setting live with no way to pin a
  // manual choice.
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soft ocean blue + soft sun yellow, per the design brief.
        // Left as fixed hex (not theme-variable) in both modes,
        // deliberately: these are the site's accent/brand colors --
        // map markers, the wave motif's stroke, chart marks -- and
        // both read clearly against a light OR a dark background
        // already, the same way a logo's accent color usually
        // doesn't itself change between a site's light/dark modes.
        ocean: '#5B8FA3',
        'ocean-light': '#DCEEF2',
        sun: '#F0C868',
        'sun-light': '#FBF1DC',
        // ink/sand/panel/surface are CSS-variable-driven (see the
        // :root / .dark blocks in index.css) rather than fixed hex,
        // so every existing bg-ink, text-ink/70, border-ink/10 etc.
        // usage across the site automatically tracks the current
        // theme -- including the ink/opacity combinations already
        // used everywhere for borders and hover states -- without
        // needing a dark: variant added at each of those call sites.
        // The rgb(var(...) / <alpha-value>) form is what makes
        // Tailwind's /NN opacity modifiers keep working on top of a
        // CSS variable.
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        // A single, restrained extra neutral -- used sparingly (see
        // Section.jsx) for the two sections that read as an editorial
        // "panel" (BigPicture, Compare recovery) rather than the
        // interactive canvas (Hero/Map/RippleChain stay on plain
        // sand). Deliberately not a new hue, just a slightly deeper
        // warm neutral in the same family as sand -- same relationship
        // kept in dark mode via its own CSS variable.
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        // NEW: the token every "card floating on top of a section"
        // (RippleChain/ComparisonView/BigPicture/HazardCard/etc.) now
        // uses instead of a literal `white`. In light mode this
        // resolves to white, same as before -- in dark mode it
        // resolves to a neutral a little LIGHTER than the page
        // background, keeping the same "card sits above the page"
        // relationship inverted rather than leaving literal white
        // cards floating on a dark page.
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
