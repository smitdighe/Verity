/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cobalt: {
          DEFAULT: '#1D6EE0',
          hover: '#1558B0',
        },
        verdict: {
          scam: '#E53E3E',
          legit: '#10B981',
        },
        warning: '#F59E0B',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulseDot: 'pulseDot 1.5s infinite',
        fadeSlideUp: 'fadeSlideUp 0.4s ease-out forwards',
        barGrow: 'barGrow 0.6s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
    },
  },
  plugins: [],
};
