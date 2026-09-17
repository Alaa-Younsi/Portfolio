import { useEffect, useRef } from "react";
import { useIsCompact, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { type BlackHoleHandle, createBlackHole } from "@/lib/blackhole";

const SIZE_DESKTOP = 300;
const SIZE_COMPACT = 240;

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

    const handle = createBlackHole(canvas, size);
    handle.setReducedMotion(reducedMotionRef.current);
    handle.setExploding(explodingRef.current);
    handleRef.current = handle;

    return () => {
      handle.destroy();
      handleRef.current = null;
    };
  }, [size]);

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
      className="fixed left-1/2 top-1/2 z-10 cursor-pointer"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%) scale(${exploding ? 1.15 : 1})`,
        transition: "transform 300ms ease-out",
        willChange: "transform",
      }}
    >
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </button>
  );
}
