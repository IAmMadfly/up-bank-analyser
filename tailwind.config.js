/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,css}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}

