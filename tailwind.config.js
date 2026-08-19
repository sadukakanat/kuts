/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        kutsDark: "#0b0f19",
        kutsPanel: "#131b2e",
        kutsGreen: "#10b981",
        kutsCyan: "#06b6d4",
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};