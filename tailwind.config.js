/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF7A00', // Principal Laranja Neon
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          glow: '#ff881a',
        },
        dark: {
          bg: '#08090C',
          card: 'rgba(18, 20, 26, 0.72)',
          surface: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 122, 0, 0.35), 0 0 30px rgba(255, 122, 0, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 122, 0, 0.75), 0 0 50px rgba(255, 122, 0, 0.45)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
