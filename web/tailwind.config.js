/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        coral: {
          50: '#fff5f4',
          100: '#ffe8e5',
          200: '#ffd4ce',
          300: '#ffb3a7',
          400: '#ff8471',
          500: '#f85838', // Vibrant Coral Primary
          600: '#e53e1f',
          700: '#c02e13',
          800: '#9f2914',
          900: '#832717',
          950: '#471007',
        },
        primary: {
          50: '#fff5f4',
          100: '#ffe8e5',
          200: '#ffd4ce',
          300: '#ffb3a7',
          400: '#ff8471',
          500: '#f85838',
          600: '#e53e1f',
          700: '#c02e13',
          800: '#9f2914',
          900: '#832717',
          950: '#471007',
        },
      },
    },
  },
  plugins: [],
}
