/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e4ede4',
          200: '#c8dbc8',
          300: '#9fbf9f',
          400: '#6f9e6f',
          500: '#4d7d4d',
          600: '#3a6339',
          700: '#2f502e',
          800: '#274027',
          900: '#1f351f',
        },
        cream: {
          50: '#fdfcf8',
          100: '#f9f6ed',
          200: '#f2ecd9',
          300: '#e8ddc0',
          400: '#d9c99a',
        },
        terracotta: {
          400: '#d4835a',
          500: '#c4693e',
          600: '#a8522e',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
