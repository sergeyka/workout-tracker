/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'border-blink': {
          '0%, 100%': {border: '2px solid transparent'},
          '50%': {border: '2px solid #10B981'}, // Green color
        }
      },
      animation: {
        'border-blink': 'border-blink 1s ease-in-out'
      }
    },
  },
  plugins: [],
}