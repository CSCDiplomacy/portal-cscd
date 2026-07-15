import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        // CSCD brand colors
        signal: 'rgb(var(--signal) / <alpha-value>)',
        'signal-rgb': 'var(--signal)',
        brass: 'rgb(var(--brass) / <alpha-value>)',
        'brass-rgb': 'var(--brass)',
        surface: 'var(--surface)',
        'on-surface': 'var(--on-surface)',
        'on-surface-2': 'rgb(var(--on-surface-2-rgb) / <alpha-value>)',
        'on-surface-2-rgb': 'var(--on-surface-2-rgb)',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        accent: ['Cormorant Garamond', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      maxWidth: {
        shell: '65ch',
      },
    },
  },
  plugins: [],
} satisfies Config;
