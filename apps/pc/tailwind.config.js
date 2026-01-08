/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#354F52", // Slate Deep
        secondary: "#84A98C", // Sage Green
        accent: "#E29578", // Muted Coral
        bg: "#FDFCF8", // Alabaster Paper
        surface: "#F4F1EA", // Sand Surface
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Lora", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
