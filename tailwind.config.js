/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: "#0f172a", // dark blue
          800: "#0c0a28", // darker blue
        },
        teal: {
          300: "#5fbeaa", // lighter teal
          400: "#2dd4bf", // lighter teal
          500: "#14b8a6", // medium teal
          600: "#0891b2", // teal accent
          700: "#0e7a6d", // darker teal
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}