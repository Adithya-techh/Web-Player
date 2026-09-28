/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#a855f7', // Swapped to primary vibrant purple
          greenDark: '#7e22ce', // Swapped to deep purple
          black: '#121212',
          dark: '#181818',
          card: '#181818',
          cardHover: '#282828',
          subtext: '#a7a7a7',
          border: '#282828',
        },
        purple: {
          brand: '#a855f7',
          brandLight: '#c084fc',
          brandDark: '#7e22ce',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'CircularStd', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
