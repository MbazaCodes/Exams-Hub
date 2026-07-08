/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1628",
          mid: "#0F1F3D",
          card: "#111E35",
        },
        brand: {
          indigo: "#4F46E5",
          gold:   "#F59E0B",
          teal:   "#14B8A6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
