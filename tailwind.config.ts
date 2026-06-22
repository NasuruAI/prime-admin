import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Soft, modern radius scale (matches the storefront).
    borderRadius: {
      none: "0",
      sm: "0.25rem",
      DEFAULT: "0.375rem",
      md: "0.5rem",
      lg: "0.625rem",
      xl: "0.875rem",
      "2xl": "1.125rem",
      "3xl": "1.5rem",
      full: "9999px",
    },
    extend: {
      colors: {
        // Brand palette — CSS-variable driven so the admin can set the brand
        // colour at runtime. Shades derived from the base with color-mix.
        primary: {
          DEFAULT: "rgb(var(--brand-primary) / <alpha-value>)",
          50: "color-mix(in srgb, rgb(var(--brand-primary)) 8%, white)",
          100: "color-mix(in srgb, rgb(var(--brand-primary)) 14%, white)",
          600: "color-mix(in srgb, rgb(var(--brand-primary)) 88%, white)",
          700: "rgb(var(--brand-primary))",
          800: "color-mix(in srgb, rgb(var(--brand-primary)) 86%, black)",
          900: "color-mix(in srgb, rgb(var(--brand-primary)) 72%, black)",
        },
        accent: {
          DEFAULT: "rgb(var(--brand-accent) / <alpha-value>)",
          hover: "color-mix(in srgb, rgb(var(--brand-accent)) 86%, black)",
          50: "color-mix(in srgb, rgb(var(--brand-accent)) 10%, white)",
        },
        ink: {
          DEFAULT: "#1A1A2E", // text / sidebar (kept neutral-dark)
          800: "#222238",
          700: "#2C2C45",
        },
        blush: "color-mix(in srgb, rgb(var(--brand-primary)) 6%, white)",
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
