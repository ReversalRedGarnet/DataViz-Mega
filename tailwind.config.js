/** @type {import('tailwindcss').Config} */

export default {
  // Use class-based dark mode so users can override and persist
  // their preferred theme independently of the OS setting.
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {
      colors: {
        // Fixed brand colors used across both themes.
        ocean: '#5B8FA3',
        'ocean-light': '#DCEEF2',
        sun: '#F0C868',
        'sun-light': '#FBF1DC',

        // Theme-aware colors defined in index.css.
        // Using rgb(var(...)/) preserves Tailwind opacity modifiers.
        ink: 'rgb(var(--color-ink) / )',
        sand: 'rgb(var(--color-sand) / )',
        panel: 'rgb(var(--color-panel) / )',
        surface: 'rgb(var(--color-surface) / )',
      },
    },
  },

  plugins: [],
};
