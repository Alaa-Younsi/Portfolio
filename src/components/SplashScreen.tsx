import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/** Total curtain time; the fade-out is baked into `animate-splashOut`. */
const SPLASH_MS = 2200;
/** When the first letter starts shedding bits. */
const DECODE_START_MS = 150;
/** Gap between consecutive letters starting to decode. */
const LETTER_STAGGER_MS = 60;
/** Time to drop a single bit. */
const BIT_MS = 42;
const BITS = 8;

/** Each character of the name with its 8-bit ASCII code, built once. */
const GLYPHS = Array.from(site.name, (char, index) => ({
  id: `glyph-${index}`,
  char: char === " " ? " " : char,
  bits: char.charCodeAt(0).toString(2).padStart(BITS, "0"),
  start: DECODE_START_MS + index * LETTER_STAGGER_MS,
}));

const DECODE_END_MS = (GLYPHS.at(-1)?.start ?? 0) + BITS * BIT_MS;

/** Milliseconds since mount, ticking every frame until `until` has passed. */
function useElapsed(until: number, enabled: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const origin = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const value = now - origin;
      setElapsed(value);
      if (value < until) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [until, enabled]);
  return elapsed;
}

type SplashScreenProps = {
  /** Fires once the curtain has lifted, so the page can start typing. */
  onDone: () => void;
};

/**
 * Intro curtain: the name arrives as raw ASCII — eight bits per letter — and
 * each code is consumed bit by bit until the glyph it encodes lands in its
 * place. The word PORTFOLIO surfaces beneath it and a single hairline charges
 * across, then the curtain fades and the frame draws itself in behind it.
 */
export function SplashScreen({ onDone }: SplashScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const elapsed = useElapsed(DECODE_END_MS, !reducedMotion);

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

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex animate-splashOut items-center justify-center bg-bg"
    >
      <div className="text-center">
        <p className="whitespace-nowrap font-display text-[clamp(1.6rem,5vw,3.2rem)] font-bold tracking-tight text-fg">
          <span aria-hidden="true">
            {GLYPHS.map((glyph) => {
              const dropped = Math.max(0, Math.floor((elapsed - glyph.start) / BIT_MS));
              return dropped >= BITS ? (
                <span key={glyph.id} className="inline-block animate-bitLand">
                  {glyph.char}
                </span>
              ) : (
                <span
                  key={glyph.id}
                  className="mx-[0.12em] inline-block align-middle font-mono text-[0.24em] font-normal tracking-normal opacity-60"
                >
                  {glyph.bits.slice(dropped)}
                </span>
              );
            })}
          </span>
          <span className="sr-only">{site.name}</span>
        </p>
        <p
          className="mt-3 animate-summon text-[0.65rem] uppercase tracking-[0.5em] text-fg opacity-70 [animation-delay:350ms] sm:text-xs"
          aria-hidden="true"
        >
          Portfolio
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-7 h-px w-[min(60vw,18rem)] overflow-hidden bg-fg/15"
        >
          <div className="h-full origin-left animate-splashLine bg-fg" />
        </div>
      </div>
    </div>
  );
}
