/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        textbg: {
          mahogany: "#331717",
          coffee: "#332217",
          khaki: "#292812",
          evergreen: "#0E1B0C",
          jet: "#172433",
          indigo: "#171733",
          dark: "#080809",
        },
        human: {
          1: "#ECFBFF",
          2: "#D8F8FF",
          3: "#037388",
          4: "#024250",
          5: "#022A31",
        },
      },
      fontFamily: {
        bellota: ["Bellota Text", "cursive"],
        besley: ["Besley", "serif"],
        tangerine: ["Tangerine", "cursive"],
        bebas: ["Bebas Neue", "cursive"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
