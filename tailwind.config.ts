import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep-green quant palette
        ink: {
          950: "#06110c",
          900: "#0a1a12",
          800: "#0f261a",
          700: "#163527",
        },
        moss: {
          50: "#eefbf3",
          100: "#d6f5e1",
          200: "#a8ecc6",
          300: "#74e0a5",
          400: "#38c97f",
          500: "#14b062",
          600: "#0a8d4e",
          700: "#0a6f40",
          800: "#0c5836",
          900: "#0b482e",
        },
        gold: {
          400: "#f0c869",
          500: "#e0af3f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,201,127,0.15), 0 8px 40px -12px rgba(20,176,98,0.35)",
        card: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
