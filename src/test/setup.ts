import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * jsdom has no canvas implementation. The simulations are verified by eye in a
 * real browser; here we only need them not to throw while components mount.
 */
const gradient = { addColorStop: () => {} } as unknown as CanvasGradient;
const noop = () => {};

const context = {
  canvas: undefined,
  globalAlpha: 1,
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  lineCap: "butt",
  arc: noop,
  beginPath: noop,
  clearRect: noop,
  clip: noop,
  fill: noop,
  fillRect: noop,
  lineTo: noop,
  moveTo: noop,
  rect: noop,
  restore: noop,
  save: noop,
  scale: noop,
  stroke: noop,
  createRadialGradient: () => gradient,
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = vi.fn(
  () => context,
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
