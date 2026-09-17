import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { createStarField, type StarFieldHandle } from "@/lib/starfield";

type StarFieldProps = {
  /** During the collapse the field escapes the frame and fills the viewport. */
  fullScreen: boolean;
};

export function StarField({ fullScreen }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<StarFieldHandle | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = createStarField(canvas);
    fieldRef.current = field;
    return () => {
      field.destroy();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    fieldRef.current?.setFullScreen(fullScreen);
  }, [fullScreen]);

  useEffect(() => {
    fieldRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  const clip = fullScreen ? "none" : "inset(var(--frame-y) var(--frame-x))";

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full bg-black"
      style={{
        zIndex: fullScreen ? 5 : 0,
        // A CSS clip is what actually enforces the frame edge on mobile
        // compositors, where the canvas is promoted to its own GPU layer.
        clipPath: clip,
        WebkitClipPath: clip,
      }}
    />
  );
}
