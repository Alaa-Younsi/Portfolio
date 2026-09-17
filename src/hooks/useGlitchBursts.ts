import { useEffect } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

const MIN_GAP_MS = 700;
const MAX_GAP_MS = 2200;
const BURST_MS = 560;
const CLASS = "is-glitching";

/**
 * Signal interference. Every couple of seconds one or two `.glitch` elements
 * tear for ~400ms, chosen at random. Nothing animates between bursts, so the
 * effect is free at idle instead of costing a repaint per element per frame.
 */
export function useGlitchBursts(enabled: boolean): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const burst = () => {
      const candidates = document.querySelectorAll<HTMLElement>(`.glitch:not(.${CLASS})`);
      const count = candidates.length;
      if (count > 0 && !document.hidden) {
        const hits = Math.random() < 0.45 ? 3 : 2;
        for (let i = 0; i < hits; i++) {
          const el = candidates[Math.floor(Math.random() * count)];
          if (!el) continue;
          el.classList.add(CLASS);
          setTimeout(() => el.classList.remove(CLASS), BURST_MS);
        }
      }
      schedule();
    };

    const schedule = () => {
      if (cancelled) return;
      const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
      timer = setTimeout(burst, gap);
    };

    schedule();

    return () => {
      cancelled = true;
      if (timer !== null) clearTimeout(timer);
    };
  }, [enabled, reducedMotion]);
}
