import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Sharp, editorial look — no border radius anywhere (matches the storefront).
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      colors: {
        // Brand palette
        primary: {
          DEFAULT: "#6E0D25", // deoxygenated burgundy
          50: "#FDF2F5",
          100: "#FBE3E9",
          600: "#8A1130",
          700: "#6E0D25",
          800: "#560A1D",
          900: "#3F0715",
        },
        accent: {
          DEFAULT: "#C9184A", // CTA crimson
          hover: "#A8123D",
          50: "#FFE9EF",
        },
        ink: {
          DEFAULT: "#1A1A2E", // text / sidebar
          800: "#222238",
          700: "#2C2C45",
        },
        blush: "#FFF0F3",
        // Neutral surface for the content area
        surface: "#F5F5F8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,46,0.04), 0 6px 18px rgba(26,26,46,0.05)",
        "card-hover": "0 2px 6px rgba(26,26,46,0.08), 0 14px 34px rgba(26,26,46,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
