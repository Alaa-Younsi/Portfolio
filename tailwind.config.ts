import type { Config } from "tailwindcss";

/**
 * Single source of truth for the design system.
 * Colours resolve to CSS custom properties declared in `src/index.css`,
 * so the whole palette can be re-themed without touching a component.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      // The whole site is monospace by design — make it the default stack so
      // Tailwind's preflight applies it to <body> without extra CSS.
      sans: [
        "JetBrains Mono Variable",
        "JetBrains Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "monospace",
      ],
      mono: [
        "JetBrains Mono Variable",
        "JetBrains Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "monospace",
      ],
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        line: "var(--border)",
      },
      fontSize: {
        "2xs": "0.625rem",
      },
      spacing: {
        "frame-x": "var(--frame-x)",
        "frame-y": "var(--frame-y)",
        "content-x": "var(--content-x)",
        "content-y": "var(--content-y)",
        "section-top": "var(--section-top)",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out forwards",
        fadeOut: "fadeOut 2s forwards",
        fadeOutSlow: "fadeOut 2.35s forwards",
        glitch: "glitch 3s infinite",
        glitchFast: "glitch2 0.3s infinite",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          to: { opacity: "0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        glitch: {
          "0%, 14%": { textShadow: "0.05em 0 0 #f0f, -0.05em -0.025em 0 #0ff" },
          "15%, 49%": { textShadow: "-0.05em -0.025em 0 #f0f, 0.025em 0.025em 0 #0ff" },
          "50%, 99%": { textShadow: "0.025em 0.05em 0 #f0f, 0.05em 0 0 #0ff" },
          "100%": { textShadow: "-0.025em 0 0 #f0f, -0.025em -0.025em 0 #0ff" },
        },
        glitch2: {
          "0%": { textShadow: "0.05em 0 0 #f0f, -0.05em -0.025em 0 #0ff" },
          "33%": { textShadow: "0.025em 0.05em 0 #f0f, 0.05em 0 0 #0ff" },
          "66%": { textShadow: "-0.05em -0.025em 0 #f0f, 0.025em 0.025em 0 #0ff" },
          "100%": { textShadow: "0.025em 0.05em 0 #f0f, 0.05em 0 0 #0ff" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
