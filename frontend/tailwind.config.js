/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0A14',
        surface: '#1A1423',
        surfaceLight: '#2D223B',
        royal: {
          50:  '#F5F0FF',
          100: '#EDE5FF',
          200: '#D4BFFA',  // Was missing — used in badges/text
          300: '#B794F6',
          400: '#A475F9',  // Light accent
          500: '#8B5CF6',  // Primary royal purple
          600: '#7C3AED',  // Deep interactive
          700: '#6D28D9',  // Active states
          800: '#5B21B6',  // Was missing — used in gradients/glows
          900: '#4C1D95',  // Deep shadows
        },
        gold: {
          400: '#FBBF24',  // Accent gold for highlights
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 8s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 4s ease-in-out infinite',
        'fade-in-up':  'fadeInUp 0.8s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.8s ease-out 0.2s forwards',
        'shimmer':     'shimmer 2s linear infinite',
        'pop-in':      'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'scale-in':    'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
