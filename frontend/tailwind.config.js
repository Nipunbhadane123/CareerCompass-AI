/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: '#0A0D17',
          DEFAULT: '#0F172A',
          card: '#161F38',
          surface: '#1E293B',
          border: '#2A3655',
          subtle: '#334155'
        },
        brand: {
          indigo: '#6366F1',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          glow: 'rgba(99, 102, 241, 0.25)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
