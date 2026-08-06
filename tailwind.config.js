/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soft ocean blue + soft sun yellow, per the design brief.
        ocean: '#5B8FA3',
        'ocean-light': '#DCEEF2',
        sun: '#F0C868',
        'sun-light': '#FBF1DC',
        ink: '#24333A',
        sand: '#FAF7F0',
        // A single, restrained extra neutral -- used sparingly (see
        // Section.jsx) for the two sections that read as an editorial
        // "panel" (BigPicture, Compare recovery) rather than the
        // interactive canvas (Hero/Map/RippleChain stay on plain
        // sand). Deliberately not a new hue, just a slightly deeper
        // warm neutral in the same family as sand.
        panel: '#F1EADC',
      },
    },
  },
  plugins: [],
}
