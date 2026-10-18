/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        colosseum: {
          black: '#0a0a0a',
          charcoal: '#121212',
          card: '#171717',
          surface: '#1f1f1f',
          gold: '#d4af37',
          'gold-muted': '#c5a059',
          'gold-bright': '#f3cf55',
          'gold-dark': '#8a6f20',
          crimson: '#ef4444',
          emerald: '#10b981'
        },
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        card: {
          DEFAULT: '#171717',
          foreground: '#f5f5f5'
        },
        primary: {
          DEFAULT: '#d4af37',
          foreground: '#0a0a0a'
        },
        secondary: {
          DEFAULT: '#1f1f1f',
          foreground: '#e5e5e5'
        },
        muted: {
          DEFAULT: '#171717',
          foreground: '#a3a3a3'
        },
        accent: {
          DEFAULT: '#c5a059',
          foreground: '#0a0a0a'
        },
        border: '#2e2614',
        input: '#262626',
        ring: '#d4af37'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Oswald', 'Impact', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        'gold-glow': '0 0 15px -3px rgba(212, 175, 55, 0.25)',
        'gold-sm': '0 2px 8px -2px rgba(212, 175, 55, 0.18)'
      }
    }
  },
  plugins: []
};
