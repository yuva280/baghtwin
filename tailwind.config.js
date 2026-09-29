/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0E11',
          panel: '#14181D',
          inset: '#0F1318',
        },
        border: {
          DEFAULT: '#1F2630',
          highlight: '#303A46',
        },
        text: {
          primary: '#E6EAF0',
          secondary: '#8B94A3',
          muted: '#5F6875',
        },
        status: {
          healthy: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          cyan: '#22D3EE',
          blue: '#3B82F6',
          violet: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
