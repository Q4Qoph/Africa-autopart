/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          green: '#00C853',
          'green-dark': '#00933C',
          'green-deep': '#006B2B',
          'green-glow': 'rgba(0,200,83,0.18)',
          neon: '#39FF88',
          ink: '#07110A',
          'ink-2': '#0F1F13',
          card: '#111C14',
          'card-2': '#162019',
          text: '#E8F0E9',
          muted: '#7A9A80',
          dim: '#3D5942',
          amber: '#FFB300',
          red: '#FF4444',
          blue: '#2979FF',
        },
      },
    },
  },
  plugins: [],
}
