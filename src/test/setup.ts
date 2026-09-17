import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * jsdom has no canvas implementation. The simulations are verified by eye in a
 * real browser; here we only need them not to throw while components mount.
 */
const gradient = { addColorStop: () => {} } as unknown as CanvasGradient;
const noop = () => {};

/**
 * A permissive 2D context: any method is a no-op, any gradient factory returns
 * a stub, and assigned properties read back. The renderers touch a lot of
 * surface (transforms, ellipses, offscreen bitmaps) that jsdom does not have.
 */
const store: Record<string | symbol, unknown> = {};
const context = new Proxy(store, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop === "canvas") return undefined;
    if (typeof prop === "string" && prop.startsWith("create") && prop.endsWith("Gradient")) {
      return () => gradient;
    }
    if (prop === "measureText") return () => ({ width: 0 });
    if (prop === "createImageData") {
      return (w: number, h: number) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      });
    }
    if (prop === "getImageData") return () => ({ data: new Uint8ClampedArray(4) });
    return noop;
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
}) as unknown as CanvasRenderingContext2D;

// WebGL is reported as unavailable so the black hole takes its 2D fallback.
HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) =>
  kind === "2d" ? context : null,
) as unknown as HTMLCanvasElement["getContext"];

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
});
