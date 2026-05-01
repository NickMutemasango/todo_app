/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7dc4fb',
          400: '#38a6f6',
          500: '#0e8de7',
          600: '#026fc5',
          700: '#0358a0',
          800: '#074b84',
          900: '#0c3f6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
