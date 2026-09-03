/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F2F9F3',
          100: '#E8F5E9',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#2E7D32', // Primary Agricultural Green
          700: '#1B5E20', // Dark Green
          800: '#144617',
          900: '#0C2D0E',
          950: '#071F09',
        }
      }
    },
  },
  plugins: [],
}
