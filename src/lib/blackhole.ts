import { type BlackHoleHandle, createBlackHole2D } from "./blackhole-2d";
import { createBlackHoleGL } from "./blackhole-gl";

export type { BlackHoleHandle } from "./blackhole-2d";

export type BlackHoleOptions = {
  /** Phone-class device: lighter integration and a lower internal resolution. */
  compact: boolean;
};

/**
 * Ray-marched WebGL rendering when the GPU can do it, particle Canvas 2D when
 * it cannot. Both speak the same handle, so the component never knows which
 * one it got.
 */
export function createBlackHole(
  canvas: HTMLCanvasElement,
  size: number,
  options: BlackHoleOptions,
): BlackHoleHandle {
  return createBlackHoleGL(canvas, size, options) ?? createBlackHole2D(canvas, size);
}
