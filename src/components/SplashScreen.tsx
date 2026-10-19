import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { createLensRenderer, type LensRenderer } from "@/lib/lensing";

/** Total curtain time; the fade-out is baked into `animate-splashOut`. */
const SPLASH_MS = 2200;
/** The name's light fades up through the ring. */
const REVEAL_MS = 320;
/** The ring holds a beat before the mass starts to evaporate. */
const EVAPORATE_START_MS = 300;
const EVAPORATE_MS = 1150;
/** Einstein radius at the start, as a fraction of the shorter viewport side. */
const RING_RADIUS = 0.2;
/** How far off-axis the mass starts, in name heights, and how it circles. */
const DRIFT = 0.35;
const ORBIT_START = Math.PI * 0.5;
const ORBIT_SPEED = 2.4;
/** Faint background stars lensed along with the name. */
const STAR_COUNT = 90;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Small deterministic PRNG so the star field is the same on every visit. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paints the unlensed source plane: the name exactly where the (invisible)
 * DOM copy sits, plus a sparse scatter of stars, white on transparent.
 */
function paintSource(name: HTMLElement, width: number, height: number, dpr: number) {
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const ctx = source.getContext("2d");
  if (!ctx) return source;

  const random = mulberry32(0x5eed);
  ctx.fillStyle = "#fff";
  for (let i = 0; i < STAR_COUNT; i++) {
    ctx.globalAlpha = 0.15 + random() * 0.45;
    const size = (random() < 0.85 ? 1 : 1.6) * dpr;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
  ctx.globalAlpha = 1;

  const style = getComputedStyle(name);
  const rect = name.getBoundingClientRect();
  ctx.font = `${style.fontWeight} ${Number.parseFloat(style.fontSize) * dpr}px ${style.fontFamily}`;
  ctx.letterSpacing = `${Number.parseFloat(style.letterSpacing || "0") * dpr}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(site.name, (rect.left + rect.width / 2) * dpr, (rect.top + rect.height / 2) * dpr);
  return source;
}

type SplashScreenProps = {
  /** Fires once the curtain has lifted, so the page can start typing. */
  onDone: () => void;
};

/**
 * Intro curtain: the name sits behind an unseen mass, so its light first
 * reaches us bent into an Einstein ring around a dark shadow — the same
 * physics as the black hole the site is built around. The mass evaporates,
 * the ring tears into arcs, the arcs unwind, and the name lies flat. Then
 * PORTFOLIO surfaces beneath it and the curtain lifts.
 */
export function SplashScreen({ onDone }: SplashScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);
  // The DOM name stays invisible (it is the canvas's layout guide) unless
  // WebGL is missing, in which case it simply fades in unlensed.
  const [unlensed, setUnlensed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      onDoneRef.current();
      return;
    }
    const id = setTimeout(() => {
      setVisible(false);
      onDoneRef.current();
    }, SPLASH_MS);
    return () => clearTimeout(id);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const name = nameRef.current;
    if (reducedMotion || !canvas || !name) return;

    const origin = performance.now();
    let renderer: LensRenderer | null = null;
    let frame = 0;
    let cancelled = false;

    const start = async () => {
      // The display face is preloaded, but the canvas must not rasterise the
      // name in a fallback font if it is still in flight.
      const style = getComputedStyle(name);
      await document.fonts
        .load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`)
        .catch(() => undefined);
      if (cancelled) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(window.innerWidth * dpr);
      const height = Math.round(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      renderer = createLensRenderer(canvas, paintSource(name, width, height, dpr));
      if (!renderer) {
        setUnlensed(true);
        return;
      }

      const rect = name.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2) * dpr;
      const cy = (rect.top + rect.height / 2) * dpr;
      const ring = Math.min(width, height) * RING_RADIUS;
      // The mass sits just off the line of sight and circles onto it, so the
      // brightest arc sweeps around the ring and the ring tears open unevenly.
      const drift = rect.height * dpr * DRIFT;

      const tick = (now: number) => {
        const t = now - origin;
        const evaporated = easeInOutCubic(clamp01((t - EVAPORATE_START_MS) / EVAPORATE_MS));
        const remaining = 1 - evaporated;
        const angle = ORBIT_START + (t / 1000) * ORBIT_SPEED;
        renderer?.draw({
          x: cx + Math.cos(angle) * drift * remaining,
          y: cy + Math.sin(angle) * drift * remaining,
          einstein: ring * remaining,
          opacity: clamp01(t / REVEAL_MS),
        });
        if (evaporated < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
    };
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex animate-splashOut items-center justify-center bg-bg"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <div className="relative text-center">
        <p
          ref={nameRef}
          className={`whitespace-nowrap font-display text-[clamp(1.6rem,5vw,3.2rem)] font-bold tracking-tight text-fg ${unlensed ? "animate-summon" : "opacity-0"}`}
        >
          {site.name}
        </p>
        <p
          className="mt-3 animate-summon text-[0.65rem] uppercase tracking-[0.5em] text-fg opacity-70 [animation-delay:1350ms] sm:text-xs"
          aria-hidden="true"
        >
          Portfolio
        </p>
      </div>
    </div>
  );
}
