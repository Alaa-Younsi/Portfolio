import { useEffect, useRef } from "react";
import { useIsCompact, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { type BlackHoleHandle, createBlackHole } from "@/lib/blackhole";

/**
 * Canvas edge in CSS pixels. The design is identical on every device; only
 * the number of pixels rendered behind it changes (see `blackhole-gl.ts`).
 */
const SIZE_DESKTOP = 600;
const SIZE_COMPACT = 340;

type BlackHoleProps = {
  exploding: boolean;
  onExplode: () => void;
};

export function BlackHole({ exploding, onExplode }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BlackHoleHandle | null>(null);
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();
  const size = compact ? SIZE_COMPACT : SIZE_DESKTOP;

  // Mirrored into refs so a canvas rebuilt at a new size can restore its state.
  const explodingRef = useRef(exploding);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    explodingRef.current = exploding;
    handleRef.current?.setExploding(exploding);
  }, [exploding]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    handleRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = createBlackHole(canvas, size, { compact });
    handle.setReducedMotion(reducedMotionRef.current);
    handle.setExploding(explodingRef.current);
    handleRef.current = handle;

    return () => {
      handle.destroy();
      handleRef.current = null;
    };
  }, [size, compact]);

  const setHovered = (value: boolean) => handleRef.current?.setHovered(value);

  return (
    <button
      type="button"
      onClick={onExplode}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label="Collapse the black hole"
      disabled={exploding}
      className="fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-fadeIn cursor-pointer rounded-full transition-transform duration-500 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%) scale(${exploding ? 1.06 : 1})`,
      }}
    >
      <canvas key={size} ref={canvasRef} className="pointer-events-none block" />
    </button>
  );
}
