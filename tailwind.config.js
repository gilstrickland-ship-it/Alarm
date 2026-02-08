/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Design system from professional workspace inspiration
        primary: "#1A1A1A",
        "primary-dark": "#2C2C2E",
        accent: "#E57373",
        "accent-light": "#FF99AA",
        success: "#3B82F6",
        danger: "#EF4444",
        kid: "#EC4899",
        "kid-light": "#FBCFE8",
        surface: "#FDFDFD",
        "surface-dark": "#2C2C2E",
      },
      fontFamily: {
        // Friendly rounded fonts for kids
      },
    },
  },
  plugins: [],
}

