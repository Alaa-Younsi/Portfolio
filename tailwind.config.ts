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
      // Body and UI: Geist Mono — the cleanest monospace at small sizes.
      sans: [
        "Geist Mono Variable",
        "Geist Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "monospace",
      ],
      mono: [
        "Geist Mono Variable",
        "Geist Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "monospace",
      ],
      // Display: Martian Mono — wide, technical, built for headlines.
      display: [
        "Martian Mono Variable",
        "Martian Mono",
        "Geist Mono Variable",
        "ui-monospace",
        "monospace",
      ],
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        line: "var(--border)",
        "glitch-a": "var(--glitch-a)",
        "glitch-b": "var(--glitch-b)",
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
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out forwards",
        fadeOut: "fadeOut 2s forwards",
        blink: "blink 1s step-end infinite",
        // Text materialising out of the void — the site's default entrance.
        summon: "summon 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        summonSlow: "summon 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        // The frame drawing itself in after the splash.
        drawX: "drawX 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        drawY: "drawY 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both",
        splashLine: "splashLine 1.7s cubic-bezier(0.65, 0, 0.35, 1) both",
        splashOut: "fadeOut 0.35s ease-in 1.85s both",
        // Signal-interference glitch, triggered in bursts by JS.
        glitchA: "glitchA 0.55s steps(1, end) both",
        glitchB: "glitchB 0.55s steps(1, end) both",
        glitchBase: "glitchBase 0.55s steps(1, end) both",
        glitchLoopA: "glitchA 0.6s steps(1, end) infinite",
        glitchLoopB: "glitchB 0.6s steps(1, end) infinite",
        glitchLoopBase: "glitchBase 0.6s steps(1, end) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeOut: { to: { opacity: "0" } },
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        summon: {
          from: { opacity: "0", transform: "translateY(0.45em)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        drawX: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        drawY: { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        splashLine: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        // Horizontal slices of the two colour layers tear away from the text
        // and snap back. The base layer twitches by a pixel or two.
        glitchA: {
          "0%": {
            clipPath: "inset(0 0 50% 0)",
            transform: "translate(-0.22em, 0) skewX(-8deg)",
            opacity: "1",
          },
          "15%": { clipPath: "inset(35% 0 30% 0)", transform: "translate(0.18em, 0)" },
          "30%": { clipPath: "inset(0 0 0 0)", transform: "translate(-0.12em, 0.04em)" },
          "45%": { clipPath: "inset(60% 0 0 0)", transform: "translate(0.26em, 0) skewX(6deg)" },
          "60%": { clipPath: "inset(15% 0 55% 0)", transform: "translate(-0.16em, 0)" },
          "75%": { clipPath: "inset(45% 0 15% 0)", transform: "translate(0.1em, -0.03em)" },
          "90%": { clipPath: "inset(0 0 70% 0)", transform: "translate(-0.06em, 0)" },
          "100%": { clipPath: "inset(0 0 70% 0)", transform: "translate(0, 0)", opacity: "0" },
        },
        glitchB: {
          "0%": {
            clipPath: "inset(50% 0 0 0)",
            transform: "translate(0.22em, 0) skewX(8deg)",
            opacity: "1",
          },
          "15%": { clipPath: "inset(5% 0 65% 0)", transform: "translate(-0.18em, 0)" },
          "30%": { clipPath: "inset(0 0 0 0)", transform: "translate(0.12em, -0.04em)" },
          "45%": { clipPath: "inset(0 0 60% 0)", transform: "translate(-0.26em, 0) skewX(-6deg)" },
          "60%": { clipPath: "inset(55% 0 15% 0)", transform: "translate(0.16em, 0)" },
          "75%": { clipPath: "inset(15% 0 45% 0)", transform: "translate(-0.1em, 0.03em)" },
          "90%": { clipPath: "inset(70% 0 0 0)", transform: "translate(0.06em, 0)" },
          "100%": { clipPath: "inset(70% 0 0 0)", transform: "translate(0, 0)", opacity: "0" },
        },
        glitchBase: {
          "0%, 100%": { transform: "translate(0, 0)", opacity: "1" },
          "15%": { transform: "translate(-0.06em, 0.02em)", opacity: "0.85" },
          "30%": { transform: "translate(0.06em, -0.02em)" },
          "45%": { transform: "translate(-0.03em, 0)", opacity: "0.6" },
          "60%": { transform: "translate(0.05em, 0.02em)", opacity: "1" },
          "75%": { transform: "translate(-0.02em, -0.02em)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
