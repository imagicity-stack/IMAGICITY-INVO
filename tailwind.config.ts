import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#b31217",
          yellow: "#f7c325",
          white: "#ffffff",
          charcoal: "#1f2937"
        }
      },
      boxShadow: {
        neon: "0 10px 40px rgba(179, 18, 23, 0.15)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
