/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        soop: {
          forest: '#26422E',
          canopy: '#2D5016',
          ink: '#2E2E2E',
          mist: '#5E5E5E',
          leaf: '#D4C9A9'
        }
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)']
      }
    }
  },
  plugins: []
};
