/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        primaryText: "#0F172A",
        secondaryText: "#475569",
        border: "#E2E8F0",
        muted: "#F1F5F9",

        darkBackground: "#0B1120",
        darkSurface: "#111827",
        darkPrimaryText: "#F8FAFC",
        darkSecondaryText: "#94A3B8",
        darkBorder: "#1F2937",

        accent: "#4F46E5",
        accentHover: "#4338CA",
        accentFocus: "#6366F1",

        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.05)",
        softLg: "0 10px 25px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
}