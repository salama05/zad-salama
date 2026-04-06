/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zad: {
          bg: '#F9F4E8',
          text: '#2D2D2D',
          border: '#D4B595',
          darkBg: '#1a1a2e',
          darkText: '#E8D5B7',
          darkBorder: '#8B6914',
          goldBg: '#FFF8DC',
          goldText: '#1a0a00',
          goldBorder: '#C5A028',
          blueBg: '#E8F4FD',
          blueText: '#1a2a3a',
          blueBorder: '#4A7FA5',
        }
      },
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
