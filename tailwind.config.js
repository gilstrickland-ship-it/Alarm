/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        "primary-dark": "#4F46E5",
        accent: "#F59E0B",
        success: "#10B981",
        danger: "#EF4444",
        kid: "#EC4899",
        "kid-light": "#FBCFE8",
      },
      fontFamily: {
        // Friendly rounded fonts for kids
      },
    },
  },
  plugins: [],
}

