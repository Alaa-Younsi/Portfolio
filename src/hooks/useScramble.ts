import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

const NOISE = "!<>-_\\/[]{}=+*^?#%@01";

type Options = {
  /** Total time for the last character to settle, in ms. */
  duration?: number;
  /** Start decoding as soon as the hook mounts. */
  autoplay?: boolean;
};

/**
 * "Decode" text: every character cycles through noise glyphs and settles on
 * its real value, left to right. Runs on requestAnimationFrame and only while
 * playing, so an idle element costs nothing.
 */
export function useScramble(text: string, { duration = 600, autoplay = false }: Options = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(autoplay && !reducedMotion ? "" : text);
  const frameRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }
    stop();
    const start = performance.now();
    const length = text.length;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      let out = "";
      for (let i = 0; i < length; i++) {
        const char = text[i] ?? "";
        // Each character settles at a staggered point along the timeline.
        const settleAt = ((i + 1) / length) * 0.85;
        if (char === " " || progress >= settleAt) {
          out += char;
        } else {
          out += NOISE[Math.floor(Math.random() * NOISE.length)];
        }
      }
      setDisplay(out);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
        setDisplay(text);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [text, duration, reducedMotion, stop]);

  useEffect(() => {
    if (autoplay) play();
    return stop;
  }, [autoplay, play, stop]);

  useEffect(() => {
    if (frameRef.current === null) setDisplay(text);
  }, [text]);

  return { display, play, stop } as const;
}
