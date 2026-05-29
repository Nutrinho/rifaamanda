import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: "#fff1f4",
          100: "#ffe4ea",
          200: "#fecdd8",
          300: "#fda4b9",
          400: "#fb718f",
          500: "#e43f67",
          600: "#c2264e",
          700: "#9f1f42",
          800: "#831d3b",
          900: "#6f1b36"
        },
        cream: "#fff8ed",
        gold: "#d8a541",
        rosewood: "#4b1725"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(75, 23, 37, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
