import { useEffect, useRef, useState } from "react";
import { useIsCompact, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { type BlackHoleHandle, createBlackHole } from "@/lib/blackhole";

/**
 * Canvas edge in CSS pixels. The design is identical on every device; only
 * the number of pixels rendered behind it changes (see `blackhole-gl.ts`).
 */
const SIZE_DESKTOP = 600;
const SIZE_COMPACT = 340;
/** How long to wait for `webglcontextrestored` before rebuilding anyway. */
const CONTEXT_RETRY_MS = 1500;

type BlackHoleProps = {
  /**
   * Hidden instead of unmounted: the GPU context, compiled shader and tuned
   * resolution survive a trip to another section, so the return is instant.
   */
  visible: boolean;
  exploding: boolean;
  onExplode: () => void;
};

export function BlackHole({ visible, exploding, onExplode }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BlackHoleHandle | null>(null);
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();
  const size = compact ? SIZE_COMPACT : SIZE_DESKTOP;
  /** Bumped to rebuild the renderer on a fresh canvas after a lost GPU context. */
  const [generation, setGeneration] = useState(0);

  // Mirrored into refs so a canvas rebuilt at a new size can restore its state.
  const visibleRef = useRef(visible);
  const explodingRef = useRef(exploding);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    visibleRef.current = visible;
    handleRef.current?.setActive(visible);
  }, [visible]);

  useEffect(() => {
    explodingRef.current = exploding;
    handleRef.current?.setExploding(exploding);
  }, [exploding]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    handleRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `generation` swaps in a fresh canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = createBlackHole(canvas, size, { compact });
    handle.setReducedMotion(reducedMotionRef.current);
    handle.setExploding(explodingRef.current);
    handle.setActive(visibleRef.current);
    handleRef.current = handle;

    // A lost GPU context (driver reset, sleep, too many tabs) leaves the canvas
    // blank for good. Rebuild on a fresh canvas once the GPU is back — or after
    // a grace period if the browser never announces it.
    let retry: ReturnType<typeof setTimeout> | undefined;
    const rebuild = () => setGeneration((value) => value + 1);
    const onLost = () => {
      retry = setTimeout(rebuild, CONTEXT_RETRY_MS);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", rebuild);

    return () => {
      // Detach first: destroy() releases the context, which fires `webglcontextlost`.
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", rebuild);
      clearTimeout(retry);
      handle.destroy();
      handleRef.current = null;
    };
  }, [size, compact, generation]);

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
      aria-hidden={!visible}
      className={`fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-transform duration-500 ease-out ${
        visible ? "animate-fadeIn" : "invisible pointer-events-none opacity-0"
      }`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%) scale(${exploding ? 1.06 : 1})`,
      }}
    >
      <canvas key={`${size}-${generation}`} ref={canvasRef} className="pointer-events-none block" />
    </button>
  );
}
