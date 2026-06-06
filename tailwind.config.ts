import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#0f1117",
          800: "#161922",
          700: "#1f2330",
          600: "#2b3142",
        },
        accent: {
          DEFAULT: "#6366f1",
          soft: "#818cf8",
          glow: "#a5b4fc",
        },
        signal: {
          green: "#34d399",
          amber: "#fbbf24",
          red: "#f87171",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(99,102,241,0.3), 0 8px 30px rgba(99,102,241,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
