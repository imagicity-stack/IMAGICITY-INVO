/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#c2132c',
        brandYellow: '#f7c948',
        brandCharcoal: '#0f172a',
        brandMuted: '#f9fafb',
      },
      boxShadow: {
        glass: '0 10px 45px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
