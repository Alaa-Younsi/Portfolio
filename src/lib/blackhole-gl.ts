/**
 * The centrepiece: a black hole rendered by marching light rays backwards
 * through the Schwarzschild metric, so the accretion disk is bent over and
 * under the shadow the way Gargantua's is in Interstellar. Doppler beaming
 * brightens the approaching side, gravitational redshift dims the inner edge,
 * and a photon ring wraps the shadow.
 *
 * The GPU does the physics; this file owns the canvas, the clock, the
 * uniforms and the frame budget. Resolution adapts to the device so a phone
 * renders the same design at a fraction of the pixels.
 */

import { FRAGMENT_SHADER, VERTEX_SHADER } from "./blackhole.glsl";
import type { BlackHoleHandle } from "./blackhole-2d";

export type BlackHoleGLOptions = {
  /** Phone-class device: fewer integration steps and a lower internal resolution. */
  compact: boolean;
};

const COLLAPSE_MS = 1100;
const HOVER_EASE = 6;
const BASE_SPEED = 0.85;

/**
 * Frame-interval targets that drive the adaptive resolution. GPU work is
 * asynchronous, so the honest cost signal is how often the browser manages to
 * present a frame, not how long our JavaScript took to submit it.
 */
const SLOW_MS = 24;
const FAST_MS = 17.5;
const MIN_SCALE = 0.3;
const ADJUST_EVERY = 24;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("BlackHole shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Returns null when WebGL (with highp fragment floats) is unavailable. */
export function createBlackHoleGL(
  canvas: HTMLCanvasElement,
  size: number,
  { compact }: BlackHoleGLOptions,
): BlackHoleHandle | null {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };
  const gl =
    (canvas.getContext("webgl2", attributes) as WebGL2RenderingContext | null) ??
    (canvas.getContext("webgl", attributes) as WebGLRenderingContext | null);
  if (!gl) return null;

  // The geodesic integration needs 32-bit floats; mediump-only GPUs get the 2D fallback.
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!precision || precision.precision === 0) return null;

  const steps = compact ? 64 : 88;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, `#define STEPS ${steps}\n${FRAGMENT_SHADER}`);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("BlackHole program:", gl.getProgramInfoLog(program));
    return null;
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
  gl.useProgram(program);

  // One triangle covers the clip-space square; no index buffer needed.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    phase: gl.getUniformLocation(program, "uPhase"),
    time: gl.getUniformLocation(program, "uTime"),
    hover: gl.getUniformLocation(program, "uHover"),
    collapse: gl.getUniformLocation(program, "uCollapse"),
  };

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  // --- resolution -----------------------------------------------------------
  // The ceiling is the device's own pixel density: a strong phone earns a
  // razor-sharp disk, a weak one settles wherever its frame rate holds.
  const dpr = window.devicePixelRatio || 1;
  const targetScale = compact ? clamp(dpr, 1, 2.5) : clamp(dpr, 1, 1.5);
  // Open below budget and climb: a stutter in the first second is what a
  // visitor remembers, a slightly soft first second is not.
  let scale = compact ? Math.max(0.7, targetScale * 0.45) : targetScale * 0.7;

  const applyScale = (): void => {
    const px = Math.max(64, Math.round(size * scale));
    if (canvas.width !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    gl.viewport(0, 0, px, px);
    gl.uniform2f(uniforms.resolution, px, px);
  };

  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  applyScale();

  // --- state ----------------------------------------------------------------
  let hovered = false;
  let hover = 0;
  let exploding = false;
  let collapseStart = 0;
  let reducedMotion = false;
  let phase = 0;
  let elapsed = 0;
  let last = 0;
  let frameId: number | null = null;
  let frameInterval = 0;
  let sinceAdjust = 0;
  let lost = false;

  const draw = (now: number): void => {
    const dt = last === 0 ? 0 : clamp((now - last) / 1000, 0, 0.05);
    last = now;
    elapsed += dt;

    hover += (Number(hovered) - hover) * clamp(dt * HOVER_EASE, 0, 1);
    // Linear clock; the shader shapes each phase with its own easing.
    const collapse = exploding ? clamp((now - collapseStart) / COLLAPSE_MS, 0, 1) : 0;
    const surge = easeOutCubic(clamp(collapse / 0.5, 0, 1));

    if (!reducedMotion) {
      phase += dt * BASE_SPEED * (1 + 0.8 * hover + 10 * surge);
    }

    gl.uniform1f(uniforms.phase, phase);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.hover, hover);
    gl.uniform1f(uniforms.collapse, collapse);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /**
   * Adaptive resolution: an exponential average of the presented frame
   * interval decides whether the next frames render fewer or more pixels.
   * The design never changes, only how many fragments pay for it.
   */
  const adapt = (interval: number): void => {
    if (interval <= 0) return;
    frameInterval = frameInterval === 0 ? interval : frameInterval * 0.85 + interval * 0.15;
    sinceAdjust += 1;
    if (sinceAdjust < ADJUST_EVERY) return;
    sinceAdjust = 0;

    if (frameInterval > SLOW_MS && scale > MIN_SCALE) {
      scale = Math.max(MIN_SCALE, scale * 0.8);
      applyScale();
    } else if (frameInterval < FAST_MS && scale < targetScale) {
      scale = Math.min(targetScale, scale * 1.2);
      applyScale();
    }
  };

  const step = (now: number): void => {
    const interval = last === 0 ? 0 : now - last;
    draw(now);
    adapt(interval);
    frameId = requestAnimationFrame(step);
  };

  const play = (): void => {
    if (frameId !== null || lost) return;
    last = 0;
    if (reducedMotion && !exploding) {
      draw(performance.now());
      return;
    }
    frameId = requestAnimationFrame(step);
  };

  const pause = (): void => {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  const onVisibilityChange = (): void => {
    if (document.hidden) pause();
    else play();
  };

  const onContextLost = (event: Event): void => {
    event.preventDefault();
    lost = true;
    pause();
  };

  canvas.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("visibilitychange", onVisibilityChange);
  play();

  return {
    setHovered(value) {
      hovered = value;
      if (reducedMotion && !exploding) draw(performance.now());
    },
    setExploding(value) {
      if (exploding === value) return;
      exploding = value;
      collapseStart = performance.now();
      pause();
      play();
    },
    setReducedMotion(value) {
      if (reducedMotion === value) return;
      reducedMotion = value;
      pause();
      play();
    },
    destroy() {
      pause();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
