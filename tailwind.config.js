/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bangers', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-bg': '#F3E9D2',
        'brand-panel': '#FAF5E9',
        'brand-primary': '#E55955',
        'brand-primary-dark': '#B23A36',
        'brand-secondary': '#5BC0DE',
        'brand-secondary-dark': '#31708F',
        'brand-accent': '#F0AD4E',
        'brand-accent-dark': '#C48834',
        'brand-text': '#4A3F35',
        'brand-border': '#4A3F35',
        'brand-success': '#63A375',
        'brand-success-dark': '#487B56',
        'brand-green': 'var(--tw-color-brand-success)',
        'brand-green-dark': 'var(--tw-color-brand-success-dark)',
      }
    },
  },
  plugins: [],
}