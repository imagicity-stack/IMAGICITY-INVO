/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        brandPrimary: '#2563eb',
        brandSecondary: '#7c3aed',
        brandAccent: '#0ea5e9',
        brandCharcoal: '#0f172a',
        brandMuted: '#f8fafc',
      },
      boxShadow: {
        glass: '0 10px 45px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
