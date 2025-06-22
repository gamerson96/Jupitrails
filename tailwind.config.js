/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jupiter: {
          primary: '#9945FF',
          secondary: '#14F195',
          dark: '#0F0B1D',
          darkSecondary: '#1A1B23',
          purple: {
            50: '#F5F3FF',
            100: '#EDE9FE',
            500: '#9945FF',
            600: '#7C3AED',
            700: '#6D28D9',
          },
          green: {
            400: '#34D399',
            500: '#14F195',
            600: '#10B981',
          }
        }
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-jupiter': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateX(-10px)', opacity: '0.5' },
          '50%': { transform: 'translateX(10px)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};