/**
 * Pointer-reactive star field, framed to the white border of the layout.
 *
 * Kept deliberately free of React: the simulation owns its canvas, its
 * listeners and its animation frame, and exposes a tiny imperative handle.
 * That keeps per-frame work out of the React render path entirely.
 */

import { type Bounds, createCosmos, type Scene } from "./cosmos";

type Star = {
  x: number;
  y: number;
  z: number;
  alpha: number;
  /** 0 = white, 1 = blue-white, 2 = warm. */
  tint: number;
  /** Twinkle phase; bright stars also get a glow sprite. */
  phase: number;
  bright: boolean;
};

type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const TINTS = ["#ffffff", "#cfe1ff", "#ffe8c8"] as const;
/** A soft glow with faint diffraction spikes, painted once and blitted. */
function paintStarSprite(dpr: number): HTMLCanvasElement {
  const size = Math.ceil(28 * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const c = size / 2;
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, "rgba(255,255,255,0.9)");
  glow.addColorStop(0.18, "rgba(255,255,255,0.35)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(1, dpr * 0.7);
  ctx.beginPath();
  ctx.moveTo(c, 0);
  ctx.lineTo(c, size);
  ctx.moveTo(0, c);
  ctx.lineTo(size, c);
  ctx.stroke();
  return canvas;
}

const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
/** Rendering above 2x is invisible to the eye and costs 2.25x the fill rate. */
const MAX_DPR = 2;
const FRICTION = 0.96;
const EASE = 0.8;
const DRIFT = 0.0005;
const STAR_DENSITY_DIVISOR = 8;

export type StarFieldHandle = {
  setFullScreen: (value: boolean) => void;
  setScene: (scene: Scene) => void;
  setReducedMotion: (value: boolean) => void;
  destroy: () => void;
};

/** Mirrors `--frame-x` / `--frame-y` from `src/index.css`. */
function frameInset(): { x: number; y: number } {
  return {
    x: Math.max(12, Math.min(window.innerWidth * 0.025, 32)),
    y: Math.max(16, Math.min(window.innerHeight * 0.05, 48)),
  };
}

export function createStarField(canvas: HTMLCanvasElement, scene: Scene = "home"): StarFieldHandle {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("StarField: 2D context unavailable");

  let width = 0;
  let height = 0;
  let scale = 1;
  let fullScreen = false;
  let reducedMotion = false;
  let frameId: number | null = null;
  let resizeId: number | null = null;
  let stars: Star[] = [];
  let touchInput = false;
  let lastFrame = 0;
  let time = 0;
  let sprite: HTMLCanvasElement | null = null;
  let nextMeteor = 4 + Math.random() * 6;
  const meteors: Meteor[] = [];
  const cosmos = createCosmos(scene);

  const bounds = { top: 0, bottom: 1, left: 0, right: 1 };
  const velocity = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointer: { x: number | null; y: number | null } = { x: null, y: null };

  const edges = () => ({
    left: width * bounds.left,
    right: width * bounds.right,
    top: height * bounds.top,
    bottom: height * bounds.bottom,
  });

  const placeStar = (star: Star): void => {
    const { left, right, top, bottom } = edges();
    star.x = left + Math.random() * (right - left);
    star.y = top + Math.random() * (bottom - top);
  };

  const generateStars = (): void => {
    const visibleWidth = window.innerWidth * (bounds.right - bounds.left);
    const visibleHeight = window.innerHeight * (bounds.bottom - bounds.top);
    const count = Math.round((visibleWidth + visibleHeight) / STAR_DENSITY_DIVISOR);

    stars = Array.from({ length: count }, () => {
      const roll = Math.random();
      return {
        x: 0,
        y: 0,
        z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        alpha: 0.5 + 0.5 * Math.random(),
        tint: roll < 0.2 ? 1 : roll < 0.32 ? 2 : 0,
        phase: Math.random() * Math.PI * 2,
        bright: Math.random() < 0.05,
      };
    });
  };

  /** Re-enters a star from whichever edge the pointer is travelling away from. */
  const recycleStar = (star: Star): void => {
    const vx = Math.abs(velocity.x);
    const vy = Math.abs(velocity.y);
    let direction: "z" | "l" | "r" | "t" | "b" = "z";

    if (vx > 1 || vy > 1) {
      const horizontal =
        vx > vy ? Math.random() < vx / (vx + vy) : !(Math.random() < vy / (vx + vy));
      direction = horizontal ? (velocity.x > 0 ? "l" : "r") : velocity.y > 0 ? "t" : "b";
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);
    star.alpha = 0.5 + 0.5 * Math.random();

    const { left, right, top, bottom } = edges();
    const frameWidth = right - left;
    const frameHeight = bottom - top;

    switch (direction) {
      case "z":
        star.z = 0.1;
        star.x = left + Math.random() * frameWidth;
        star.y = top + Math.random() * frameHeight;
        break;
      case "l":
        star.x = left - OVERFLOW_THRESHOLD;
        star.y = top + Math.random() * frameHeight;
        break;
      case "r":
        star.x = right + OVERFLOW_THRESHOLD;
        star.y = top + Math.random() * frameHeight;
        break;
      case "t":
        star.x = left + Math.random() * frameWidth;
        star.y = top - OVERFLOW_THRESHOLD;
        break;
      case "b":
        star.x = left + Math.random() * frameWidth;
        star.y = bottom + OVERFLOW_THRESHOLD;
        break;
    }
  };

  const resize = (): void => {
    if (fullScreen) {
      bounds.top = 0;
      bounds.bottom = 1;
      bounds.left = 0;
      bounds.right = 1;
    } else {
      const inset = frameInset();
      bounds.top = inset.y / window.innerHeight;
      bounds.bottom = (window.innerHeight - inset.y) / window.innerHeight;
      bounds.left = inset.x / window.innerWidth;
      bounds.right = (window.innerWidth - inset.x) / window.innerWidth;
    }

    const nextScale = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (nextScale !== scale || !sprite) sprite = paintStarSprite(nextScale);
    scale = nextScale;
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;
    canvas.width = width;
    canvas.height = height;

    for (const star of stars) placeStar(star);
  };

  const update = (): void => {
    velocity.tx *= FRICTION;
    velocity.ty *= FRICTION;
    velocity.x += (velocity.tx - velocity.x) * EASE;
    velocity.y += (velocity.ty - velocity.y) * EASE;

    const { left, right, top, bottom } = edges();
    const centerX = left + (right - left) / 2;
    const centerY = top + (bottom - top) / 2;

    for (const star of stars) {
      star.x += velocity.x * star.z;
      star.y += velocity.y * star.z;
      star.x += (star.x - centerX) * DRIFT * star.z;
      star.y += (star.y - centerY) * DRIFT * star.z;
      star.z += DRIFT;

      if (
        star.x < left - OVERFLOW_THRESHOLD ||
        star.x > right + OVERFLOW_THRESHOLD ||
        star.y < top - OVERFLOW_THRESHOLD ||
        star.y > bottom + OVERFLOW_THRESHOLD
      ) {
        recycleStar(star);
      }
    }
  };

  const render = (): void => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    // Inset by one CSS pixel so no star bleeds over the frame line.
    const { left, right, top, bottom } = edges();
    const inset = scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left + inset, top + inset, right - left - inset * 2, bottom - top - inset * 2);
    ctx.clip();

    // Planets and nebulae sit behind the stars; ships fly in front of them.
    const cssBounds: Bounds = {
      left: left / scale,
      top: top / scale,
      right: right / scale,
      bottom: bottom / scale,
    };
    ctx.save();
    ctx.scale(scale, scale);
    cosmos.drawBack(ctx, cssBounds, scale);
    ctx.restore();

    ctx.lineCap = "round";

    let tailX = velocity.x * 2;
    let tailY = velocity.y * 2;
    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    for (const star of stars) {
      const twinkle = 0.78 + 0.22 * Math.sin(time * (1.4 + star.z * 2.2) + star.phase);
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.strokeStyle = TINTS[star.tint] ?? "#fff";
      ctx.lineWidth = STAR_SIZE * star.z * scale;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x + tailX, star.y + tailY);
      ctx.stroke();
      if (star.bright && sprite) {
        const size = (10 + 18 * star.z) * scale;
        ctx.globalAlpha = star.alpha * twinkle * 0.9;
        ctx.drawImage(sprite, star.x - size / 2, star.y - size / 2, size, size);
      }
    }

    // Meteors: a bright head with a fading streak behind it.
    for (const m of meteors) {
      const t = m.life / m.max;
      const fade = Math.sin(t * Math.PI);
      const length = 90 * scale;
      const nx = -m.vx / Math.hypot(m.vx, m.vy);
      const ny = -m.vy / Math.hypot(m.vx, m.vy);
      const gradient = ctx.createLinearGradient(m.x, m.y, m.x + nx * length, m.y + ny * length);
      gradient.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6 * scale;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + nx * length, m.y + ny * length);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.save();
    ctx.scale(scale, scale);
    cosmos.drawFront(ctx, cssBounds, scale);
    ctx.restore();

    ctx.restore();
    ctx.globalAlpha = 1;
  };

  const tick = (now: number): void => {
    const dt = lastFrame === 0 ? 0 : Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    time += dt;
    const { left, right, top, bottom } = edges();

    if (!reducedMotion) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        nextMeteor = 7 + Math.random() * 12;
        const angle = Math.PI * (0.15 + Math.random() * 0.25);
        const speed = (900 + Math.random() * 500) * scale;
        meteors.push({
          x: left + Math.random() * (right - left) * 0.8,
          y: top + Math.random() * (bottom - top) * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 0.5 + Math.random() * 0.3,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m) continue;
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life >= m.max) meteors.splice(i, 1);
      }
    }
    cosmos.update(
      dt,
      { left: left / scale, top: top / scale, right: right / scale, bottom: bottom / scale },
      velocity.x / scale,
      velocity.y / scale,
    );
  };

  let faulted = false;
  const step = (now: number): void => {
    try {
      tick(now);
      update();
      render();
    } catch (error) {
      // One bad frame must not leave the sky blank; report once and carry on.
      if (!faulted) {
        faulted = true;
        console.warn("StarField frame failed", error);
      }
    }
    frameId = requestAnimationFrame(step);
  };

  const play = (): void => {
    if (frameId !== null) return;
    lastFrame = 0;
    if (reducedMotion) {
      tick(performance.now());
      render();
      return;
    }
    frameId = requestAnimationFrame(step);
  };

  const pause = (): void => {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  const movePointer = (x: number, y: number): void => {
    if (pointer.x !== null && pointer.y !== null) {
      const sign = touchInput ? 1 : -1;
      velocity.tx += ((x - pointer.x) / 8) * scale * sign;
      velocity.ty += ((y - pointer.y) / 8) * scale * sign;
    }
    pointer.x = x;
    pointer.y = y;
  };

  const onMouseMove = (event: MouseEvent): void => {
    touchInput = false;
    movePointer(event.clientX, event.clientY);
  };

  const onTouchMove = (event: TouchEvent): void => {
    const touch = event.touches[0];
    if (!touch) return;
    touchInput = true;
    // Never preventDefault here: a non-passive touchmove on document kills
    // native scrolling inside every child container on mobile browsers.
    movePointer(touch.clientX, touch.clientY);
  };

  const onPointerLeave = (): void => {
    pointer.x = null;
    pointer.y = null;
  };

  const onResize = (): void => {
    if (resizeId !== null) cancelAnimationFrame(resizeId);
    resizeId = requestAnimationFrame(() => {
      resizeId = null;
      // Star count follows the visible area, so a narrow window is not
      // left with a desktop's worth of stars crammed into it.
      rebuild();
      if (reducedMotion) {
        tick(performance.now());
        render();
      }
    });
  };

  /** A hidden tab must not burn a frame budget it cannot paint. */
  const onVisibilityChange = (): void => {
    if (document.hidden) pause();
    else play();
  };

  /** Bounds first, then a star count sized to the area they enclose. */
  const rebuild = (): void => {
    resize();
    generateStars();
    for (const star of stars) placeStar(star);
  };

  rebuild();
  play();

  window.addEventListener("resize", onResize);
  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: true });
  document.addEventListener("touchend", onPointerLeave, { passive: true });
  document.addEventListener("mouseleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    setFullScreen(value) {
      if (fullScreen === value) return;
      fullScreen = value;
      rebuild();
      if (reducedMotion) render();
    },
    setReducedMotion(value) {
      if (reducedMotion === value) return;
      reducedMotion = value;
      cosmos.setReducedMotion(value);
      pause();
      play();
    },
    setScene(next) {
      cosmos.setScene(next);
      if (reducedMotion) {
        tick(performance.now());
        render();
      }
    },
    destroy() {
      pause();
      if (resizeId !== null) cancelAnimationFrame(resizeId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onPointerLeave);
      document.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    },
  };
}
