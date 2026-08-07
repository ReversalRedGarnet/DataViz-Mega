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
        // <alpha-value> lets Tailwind's opacity modifiers (e.g. text-ink/70)
        // substitute the real opacity value in place of this placeholder --
        // without it, every /NN utility built on these four colors silently
        // stops generating any rule at all.
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
    },
  },

  plugins: [],
};
