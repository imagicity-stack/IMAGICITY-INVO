import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D81E1E",
          dark: "#8A0E0E",
        },
        accent: {
          yellow: "#F5C400",
          black: "#0F0F0F",
        },
        background: {
          light: "#FFF7E6",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(216, 30, 30, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
