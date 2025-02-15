
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Deep space colors
        space: {
          DEFAULT: "#0F1729",
          dark: "#0D1117",
          light: "#1E0B38",
        },
        // Neon accents
        neon: {
          blue: "#00F5FF",
          pink: "#FF00E5",
          green: "#00FF9D",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "stars": "stars 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        stars: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2000px)" },
        },
      },
      backgroundImage: {
        "space-gradient": "radial-gradient(circle at center, #1E0B38 0%, #0D1117 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
