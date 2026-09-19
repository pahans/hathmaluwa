const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      teal: colors.teal,
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      red: colors.red,
      orange: colors.orange,
      blue: colors.blue,
      transparent: colors.transparent,
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
