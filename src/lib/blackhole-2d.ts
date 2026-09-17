/**
 * Canvas 2D fallback for browsers without WebGL: a Keplerian accretion disk with
 * Doppler-shifted particle colour, a photon ring and a gravitational-lensing
 * halo — plus the collapse animation that blows it apart on click.
 *
 * Like the star field, this owns its canvas and animation frame so React never
 * re-renders at 60fps.
 */

const PARTICLE_COUNT = 400;
const EXPLOSION_PARTICLE_COUNT = 200;
const EXPLOSION_MS = 800;
const RESORT_EVERY = 10;
const MAX_DPR = 2;

/** Reference geometry, authored at a 300px canvas and scaled from there. */
const REFERENCE_SIZE = 300;
const EVENT_HORIZON = 34;
const INNER_DISK = 50;
const OUTER_DISK = 130;

type DiskParticle = {
  radius: number;
  angle: number;
  speed: number;
  brightness: number;
  r: number;
  g: number;
  b: number;
  /** Fixed vertical offset that fakes disk thickness. */
  verticalOffset: number;
};

type ExplosionParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  r: number;
  g: number;
  b: number;
};

export type BlackHoleHandle = {
  setHovered: (value: boolean) => void;
  setExploding: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  destroy: () => void;
};

function createDiskParticle(inner: number, outer: number): DiskParticle {
  // Weight the distribution towards the inner edge, where real disks are dense.
  const radius = inner + Math.random() ** 0.6 * (outer - inner);
  const angle = Math.random() * Math.PI * 2;
  const temp = 1 - (radius - inner) / (outer - inner);
  const doppler = Math.cos(angle);

  // Approaching material blue-shifts and brightens; receding material red-shifts.
  const [r, g, b] =
    doppler > 0
      ? [200 + temp * 55, 150 + temp * 80, 100 + doppler * 100]
      : [255, 100 + temp * 100, 50 - doppler * 30];

  return {
    radius,
    angle,
    speed: 0.8 / Math.sqrt(radius),
    brightness: 0.3 + temp * 0.7,
    r,
    g,
    b,
    verticalOffset: Math.sin(angle) * radius * 0.15,
  };
}

const projectY = (p: DiskParticle, centerY: number): number =>
  centerY + Math.sin(p.angle) * p.radius * 0.3 + p.verticalOffset;

export function createBlackHole2D(canvas: HTMLCanvasElement, size: number): BlackHoleHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("BlackHole: 2D context unavailable");

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);

  const center = size / 2;
  const scale = size / REFERENCE_SIZE;
  const horizonRadius = EVENT_HORIZON * scale;
  const inner = INNER_DISK * scale;
  const outer = OUTER_DISK * scale;

  const particles = Array.from({ length: PARTICLE_COUNT }, () => createDiskParticle(inner, outer));
  const sorted = [...particles].sort((a, b) => projectY(a, center) - projectY(b, center));
  let explosion: ExplosionParticle[] = [];

  let hovered = false;
  let exploding = false;
  let reducedMotion = false;
  let explosionStart = 0;
  let frame = 0;
  let frameId: number | null = null;

  // Radial gradients are expensive to build; they only change when hover does.
  const horizonGradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    horizonRadius,
  );
  horizonGradient.addColorStop(0, "rgba(10,5,5,1)");
  horizonGradient.addColorStop(1, "rgba(0,0,0,1)");

  let cached: { shimmer: CanvasGradient; photon: CanvasGradient; pulse: CanvasGradient } | null =
    null;

  const gradients = () => {
    if (cached) return cached;

    const shimmer = ctx.createRadialGradient(
      center,
      center,
      horizonRadius + 14,
      center,
      center,
      horizonRadius + 35,
    );
    shimmer.addColorStop(0, `rgba(180,100,30,${hovered ? 0.28 : 0.15})`);
    shimmer.addColorStop(1, "rgba(180,100,30,0)");

    const photon = ctx.createRadialGradient(
      center,
      center,
      horizonRadius + 2,
      center,
      center,
      horizonRadius + 14,
    );
    photon.addColorStop(0, `rgba(255,200,80,${hovered ? 1 : 0.9})`);
    photon.addColorStop(1, "rgba(255,80,0,0)");

    const pulse = ctx.createRadialGradient(
      center,
      center,
      horizonRadius,
      center,
      center,
      outer + 30,
    );
    pulse.addColorStop(0, "rgba(255,150,50,0.14)");
    pulse.addColorStop(0.35, "rgba(255,100,0,0.09)");
    pulse.addColorStop(1, "rgba(255,0,0,0)");

    cached = { shimmer, photon, pulse };
    return cached;
  };

  const fillCircle = (fill: CanvasGradient | string, radius: number): void => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawDisk = (): void => {
    // Painter's algorithm keeps the far half of the disk behind the horizon.
    // Re-sorting every frame costs more than a ten-frame-stale order is worth.
    if (frame % RESORT_EVERY === 0) {
      sorted.sort((a, b) => projectY(a, center) - projectY(b, center));
    }

    const speedMultiplier = hovered ? 1.4 : 1;

    for (const p of sorted) {
      if (!reducedMotion) {
        p.angle += p.speed * 0.01 * speedMultiplier;
        if (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;
      }

      const x = center + Math.cos(p.angle) * p.radius;
      const y = projectY(p, center);
      const particleSize = 1 + (1 - p.radius / (150 * scale)) * 1.5;
      const alpha = p.brightness * (0.4 + 0.6 * Math.abs(Math.cos(p.angle)));

      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCore = (): void => {
    const { shimmer, photon } = gradients();
    fillCircle(shimmer, horizonRadius + 35);
    fillCircle(photon, horizonRadius + 14);
    fillCircle(horizonGradient, horizonRadius);
  };

  const drawExplosion = (): void => {
    const progress = Math.min((Date.now() - explosionStart) / EXPLOSION_MS, 1);
    const eased = 1 - (1 - progress) ** 3;

    for (const p of explosion) {
      p.x += p.vx * (1 + eased * 2);
      p.y += p.vy * (1 + eased * 2);
      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${(1 - progress) * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + eased * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    const radius = horizonRadius * (1 + eased * 4);
    const shockwave = ctx.createRadialGradient(center, center, 0, center, center, radius);
    shockwave.addColorStop(0, `rgba(0, 0, 0, ${1 - progress})`);
    shockwave.addColorStop(0.7, `rgba(255, 100, 0, ${(1 - progress) * 0.5})`);
    shockwave.addColorStop(1, "rgba(255, 0, 0, 0)");
    fillCircle(shockwave, radius);
  };

  const draw = (): void => {
    ctx.clearRect(0, 0, size, size);

    if (exploding) {
      drawExplosion();
    } else {
      if (hovered) fillCircle(gradients().pulse, outer + 30);
      drawDisk();
      drawCore();
    }

    frame += 1;
  };

  const step = (): void => {
    draw();
    frameId = requestAnimationFrame(step);
  };

  const play = (): void => {
    if (frameId !== null) return;
    // A still black hole still needs one paint; it just never needs a second.
    if (reducedMotion && !exploding) {
      draw();
      return;
    }
    frameId = requestAnimationFrame(step);
  };

  const pause = (): void => {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  const restart = (): void => {
    pause();
    play();
  };

  const seedExplosion = (): void => {
    explosionStart = Date.now();
    explosion = Array.from({ length: EXPLOSION_PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      const roll = Math.random();
      // Hot plasma: white-gold core, orange body, red edges.
      const [r, g, b] =
        roll < 0.4
          ? [255, 150 + Math.random() * 100, 50]
          : roll < 0.7
            ? [255, 50 + Math.random() * 100, 50]
            : [255, 200, 100 + Math.random() * 155];

      return {
        x: center,
        y: center,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        r,
        g,
        b,
      };
    });
  };

  const onVisibilityChange = (): void => {
    if (document.hidden) pause();
    else play();
  };

  play();
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    setHovered(value) {
      if (hovered === value) return;
      hovered = value;
      cached = null;
    },
    setExploding(value) {
      if (exploding === value) return;
      exploding = value;
      if (value) seedExplosion();
      else explosion = [];
      restart();
    },
    setReducedMotion(value) {
      if (reducedMotion === value) return;
      reducedMotion = value;
      restart();
    },
    destroy() {
      pause();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    },
  };
}
