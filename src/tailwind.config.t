import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: "#F25F5C", dark: "#D94A47" },
        burgundy: { DEFAULT: "#7A263A", dark: "#5E1D2C" },
        gold: "#D9A441",
        warm: "#FFF9F7",
        border: "#F0E3DE",
        ink: "#2B2B2B",
        muted: "#707070",
      },
      borderRadius: {
        card: "24px",
        control: "16px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)",
        "soft-lg": "0 16px 40px rgba(0,0,0,0.10)",
        glow: "0 0 0 4px rgba(242,95,92,0.12)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      maxWidth: {
        content: "1100px",
        form: "520px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out both",
        "slide-in": "slideIn 250ms ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;