import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#C1121F",
          yellow: "#F4D35E",
          white: "#FFFFFF"
        },
        surface: {
          base: "#fefefe",
          muted: "#f8f8f8",
          border: "#e5e7eb"
        },
        text: {
          primary: "#1f2937",
          secondary: "#4b5563"
        }
      },
      boxShadow: {
        card: "0 15px 40px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};
export default config;
