/**
 * The furniture of space: planets, ships and a station, drawn behind and in
 * front of the star field. Two scenes share one renderer — "home" lives inside
 * the frame across every section, "chronicle" replaces it behind the biography
 * — and cross-fade when the scene changes.
 *
 * Planets are painted once into offscreen bitmaps and blitted; ships are a
 * few dozen line segments each. Everything works in CSS pixels; the caller
 * scales the context by the device pixel ratio.
 */

export type Scene = "home" | "chronicle";

export type Bounds = { left: number; top: number; right: number; bottom: number };

type PlanetStyle = {
  base: string;
  lit: string;
  bands?: number;
  ring?: { inner: number; outer: number; tilt: number; rotation: number; color: string };
  moons?: number;
};

type Planet = {
  /** Position as fractions of the current bounds. */
  fx: number;
  fy: number;
  /** Radius as a fraction of the shorter bound. */
  fr: number;
  depth: number;
  style: PlanetStyle;
  bitmap: HTMLCanvasElement | null;
  bitmapRadius: number;
  /** Bounded parallax offset, relaxes back to zero. */
  ox: number;
  oy: number;
};

type ShipDesign = "courier" | "dart" | "freighter" | "station";

type Ship = {
  design: ShipDesign;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  depth: number;
  phase: number;
  spin: number;
};

type Nebula = { fx: number; fy: number; fr: number; color: string; drift: number };

type SceneSet = {
  planets: Planet[];
  ships: Ship[];
  nebulae: Nebula[];
  alpha: number;
  target: number;
};

export type Cosmos = {
  setScene: (scene: Scene) => void;
  setReducedMotion: (value: boolean) => void;
  update: (dt: number, bounds: Bounds, velocityX: number, velocityY: number) => void;
  drawBack: (ctx: CanvasRenderingContext2D, bounds: Bounds, dpr: number) => void;
  drawFront: (ctx: CanvasRenderingContext2D, bounds: Bounds, dpr: number) => void;
};

const FADE_SECONDS = 0.9;
const PARALLAX = 0.06;
const RELAX = 0.6;

const planet = (fx: number, fy: number, fr: number, depth: number, style: PlanetStyle): Planet => ({
  fx,
  fy,
  fr,
  depth,
  style,
  bitmap: null,
  bitmapRadius: 0,
  ox: 0,
  oy: 0,
});

const ship = (
  design: ShipDesign,
  x: number,
  y: number,
  vx: number,
  vy: number,
  scale: number,
  depth: number,
): Ship => ({ design, x, y, vx, vy, scale, depth, phase: Math.random() * Math.PI * 2, spin: 0 });

/** Home: a quiet system. One ringed world, one small rocky planet, light traffic. */
function homeSet(): SceneSet {
  return {
    planets: [
      planet(0.86, 0.22, 0.075, 0.35, {
        base: "#2a2c33",
        lit: "#8e95a8",
        bands: 5,
        ring: { inner: 1.35, outer: 2.05, tilt: 0.28, rotation: -0.35, color: "#c9cfdc" },
      }),
      planet(0.13, 0.7, 0.032, 0.55, { base: "#332b27", lit: "#b59a7e", moons: 1 }),
    ],
    ships: [
      ship("courier", 0.2, 0.42, 9, -1.2, 0.85, 0.7),
      ship("dart", 0.7, 0.8, -22, -3, 0.6, 0.9),
      ship("courier", 0.9, 0.58, -6, 0.8, 0.55, 0.45),
    ],
    nebulae: [],
    alpha: 1,
    target: 1,
  };
}

/** Chronicle: a bigger neighbourhood. A gas giant off the edge, a station, freight. */
function chronicleSet(): SceneSet {
  return {
    planets: [
      planet(1.02, 0.78, 0.26, 0.2, {
        base: "#2b2620",
        lit: "#b8956a",
        bands: 9,
        ring: { inner: 1.25, outer: 1.9, tilt: 0.2, rotation: 0.18, color: "#d8c8ae" },
      }),
      planet(0.09, 0.18, 0.045, 0.5, { base: "#23292f", lit: "#8fb2bd", moons: 2 }),
    ],
    ships: [
      ship("station", 0.11, 0.6, 1.5, -0.4, 1, 0.3),
      ship("freighter", 0.85, 0.16, -7, 1.5, 0.8, 0.5),
      ship("dart", 0.1, 0.9, 26, -6, 0.5, 0.9),
      ship("courier", 0.55, 0.06, 11, 2, 0.6, 0.6),
    ],
    nebulae: [
      { fx: 0.3, fy: 0.3, fr: 0.55, color: "rgba(92, 96, 150, 0.16)", drift: 0.004 },
      { fx: 0.8, fy: 0.75, fr: 0.45, color: "rgba(150, 90, 110, 0.1)", drift: -0.003 },
    ],
    alpha: 0,
    target: 0,
  };
}

// ---------------------------------------------------------------------------
// Planet painting (once per size)
// ---------------------------------------------------------------------------

function paintPlanet(
  p: Planet,
  radius: number,
  dpr: number,
  lightAngle: number,
): HTMLCanvasElement {
  const ringOuter = p.style.ring ? p.style.ring.outer : 1;
  const extent = Math.ceil(radius * Math.max(ringOuter, 1) + 4);
  const size = extent * 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(size * dpr);
  canvas.height = Math.ceil(size * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  ctx.translate(extent, extent);

  const lx = Math.cos(lightAngle);
  const ly = Math.sin(lightAngle);

  const drawRings = (front: boolean): void => {
    const ring = p.style.ring;
    if (!ring) return;
    ctx.save();
    ctx.rotate(ring.rotation);
    ctx.beginPath();
    // Front half sits below the ring's local x-axis; back half above.
    ctx.rect(-extent * 2, front ? 0 : -extent * 2, extent * 4, extent * 2);
    ctx.clip();
    const bandsCount = 7;
    for (let i = 0; i < bandsCount; i++) {
      const t = i / (bandsCount - 1);
      const rr = radius * (ring.inner + (ring.outer - ring.inner) * t);
      ctx.beginPath();
      ctx.ellipse(0, 0, rr, rr * ring.tilt, 0, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = 0.12 + 0.35 * Math.abs(Math.sin(t * 9.1 + 0.6));
      ctx.lineWidth = Math.max(0.6, radius * 0.035);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawRings(false);

  // Body: lit hemisphere fades into a deep shadow away from the light.
  const lit = ctx.createRadialGradient(
    lx * radius * 0.45,
    ly * radius * 0.45,
    radius * 0.05,
    0,
    0,
    radius,
  );
  lit.addColorStop(0, p.style.lit);
  lit.addColorStop(0.55, p.style.base);
  lit.addColorStop(1, "#050506");
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = lit;
  ctx.fill();

  // Latitude bands, clipped to the disc.
  if (p.style.bands) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.rotate(Math.atan2(ly, lx) * 0.15 + 0.35);
    for (let i = 0; i < p.style.bands; i++) {
      const y = -radius + ((i + 0.5) / p.style.bands) * radius * 2;
      const h = (radius * 2) / p.style.bands;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.12)";
      ctx.fillRect(-radius * 1.2, y - h * 0.5, radius * 2.4, h * 0.7);
    }
    ctx.restore();
  }

  // Terminator: a second shadow gradient from the dark side.
  const shade = ctx.createRadialGradient(
    -lx * radius * 0.6,
    -ly * radius * 0.6,
    radius * 0.2,
    -lx * radius * 0.2,
    -ly * radius * 0.2,
    radius * 1.15,
  );
  shade.addColorStop(0, "rgba(0,0,0,0.85)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = shade;
  ctx.fill();

  // Rim light on the lit edge.
  ctx.beginPath();
  ctx.arc(0, 0, radius - 0.5, lightAngle - 1.3, lightAngle + 1.3);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  drawRings(true);

  // Moons: tiny lit discs parked off to one side.
  if (p.style.moons) {
    for (let i = 0; i < p.style.moons; i++) {
      const a = 0.9 + i * 1.7;
      const d = radius * (1.6 + i * 0.5);
      const mr = Math.max(1.5, radius * (0.12 - i * 0.03));
      const mx = Math.cos(a) * d;
      const my = Math.sin(a) * d * 0.55;
      const g = ctx.createRadialGradient(mx + lx * mr * 0.4, my + ly * mr * 0.4, 0, mx, my, mr);
      g.addColorStop(0, "#c9c9cf");
      g.addColorStop(1, "#1a1a1e");
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Ships
// ---------------------------------------------------------------------------

function tracePath(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[]) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    if (i === 0) ctx.moveTo(point[0], point[1]);
    else ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
}

function drawShip(ctx: CanvasRenderingContext2D, s: Ship, time: number, alpha: number): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  const heading = Math.atan2(s.vy, s.vx);
  ctx.rotate(s.design === "station" ? s.spin : heading);
  ctx.scale(s.scale, s.scale);
  ctx.lineWidth = 1 / s.scale;
  ctx.lineJoin = "round";
  ctx.fillStyle = "#000";
  ctx.strokeStyle = `rgba(255,255,255,${(0.3 + 0.45 * s.depth) * alpha})`;
  const blink = (Math.sin(time * 4 + s.phase) > 0.85 ? 1 : 0) * alpha;

  if (s.design === "station") {
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9);
      ctx.lineTo(Math.cos(a) * 27, Math.sin(a) * 27);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Solar panels on the hub.
    ctx.strokeRect(-4, -58, 8, 20);
    ctx.strokeRect(-4, 38, 8, 20);
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, -9);
    ctx.moveTo(0, 9);
    ctx.lineTo(0, 38);
    ctx.stroke();
    ctx.fillStyle = `rgba(120,230,255,${blink})`;
    ctx.beginPath();
    ctx.arc(34, 0, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Engine trail, drawn first so the hull sits on top.
  const trail = ctx.createLinearGradient(-30, 0, -95, 0);
  trail.addColorStop(0, `rgba(160,220,255,${0.35 * alpha})`);
  trail.addColorStop(1, "rgba(160,220,255,0)");
  ctx.strokeStyle = trail;
  ctx.lineWidth = 2.2 / s.scale;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-95, 0);
  ctx.stroke();
  ctx.lineWidth = 1 / s.scale;
  ctx.strokeStyle = `rgba(255,255,255,${(0.3 + 0.45 * s.depth) * alpha})`;

  if (s.design === "courier") {
    tracePath(ctx, [
      [32, 0],
      [12, -6],
      [-24, -6],
      [-30, -3],
      [-30, 3],
      [-24, 6],
      [12, 6],
    ]);
    ctx.fill();
    ctx.stroke();
    // Fins and cockpit.
    tracePath(ctx, [
      [-14, -6],
      [-26, -15],
      [-30, -6],
    ]);
    ctx.fill();
    ctx.stroke();
    tracePath(ctx, [
      [-14, 6],
      [-26, 15],
      [-30, 6],
    ]);
    ctx.fill();
    ctx.stroke();
    tracePath(ctx, [
      [14, -3],
      [22, -1],
      [22, 1],
      [14, 3],
    ]);
    ctx.stroke();
  } else if (s.design === "dart") {
    tracePath(ctx, [
      [26, 0],
      [-18, -10],
      [-12, 0],
      [-18, 10],
    ]);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.lineTo(-10, -6);
    ctx.moveTo(4, 3);
    ctx.lineTo(-10, 6);
    ctx.stroke();
  } else {
    // Freighter: bridge, spine, and a row of containers.
    ctx.strokeRect(-40, -5, 80, 10);
    ctx.fillRect(-40, -5, 80, 10);
    ctx.strokeRect(-40, -5, 80, 10);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-32 + i * 17, -13, 13, 8);
      ctx.strokeRect(-32 + i * 17, -13, 13, 8);
      ctx.fillRect(-32 + i * 17, 5, 13, 8);
      ctx.strokeRect(-32 + i * 17, 5, 13, 8);
    }
    tracePath(ctx, [
      [40, -5],
      [52, -2],
      [52, 2],
      [40, 5],
    ]);
    ctx.fill();
    ctx.stroke();
  }

  // Engine glow and a navigation light.
  const glow = ctx.createRadialGradient(-30, 0, 0, -30, 0, 6);
  glow.addColorStop(0, `rgba(200,235,255,${0.8 * alpha})`);
  glow.addColorStop(1, "rgba(200,235,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(-30, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${blink})`;
  ctx.beginPath();
  ctx.arc(s.design === "dart" ? 26 : 32, 0, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

export function createCosmos(initial: Scene): Cosmos {
  const sets: Record<Scene, SceneSet> = { home: homeSet(), chronicle: chronicleSet() };
  sets[initial].alpha = 1;
  sets[initial].target = 1;
  sets[initial === "home" ? "chronicle" : "home"].alpha = 0;
  sets[initial === "home" ? "chronicle" : "home"].target = 0;

  let reducedMotion = false;
  let time = 0;
  let placed = false;
  let lastWidth = 0;
  let lastHeight = 0;

  /** Ships start at fractional positions; convert once bounds are known. */
  const place = (bounds: Bounds): void => {
    const w = bounds.right - bounds.left;
    const h = bounds.bottom - bounds.top;
    for (const set of Object.values(sets)) {
      for (const s of set.ships) {
        s.x = bounds.left + s.x * w;
        s.y = bounds.top + s.y * h;
      }
    }
    placed = true;
  };

  const wrap = (s: Ship, bounds: Bounds, margin: number): void => {
    const w = bounds.right - bounds.left + margin * 2;
    const h = bounds.bottom - bounds.top + margin * 2;
    if (s.x < bounds.left - margin) s.x += w;
    if (s.x > bounds.right + margin) s.x -= w;
    if (s.y < bounds.top - margin) s.y += h;
    if (s.y > bounds.bottom + margin) s.y -= h;
  };

  return {
    setScene(scene) {
      for (const key of Object.keys(sets) as Scene[]) sets[key].target = key === scene ? 1 : 0;
    },

    setReducedMotion(value) {
      reducedMotion = value;
    },

    update(dt, bounds, velocityX, velocityY) {
      if (!placed) place(bounds);
      time += dt;
      const w = bounds.right - bounds.left;
      const h = bounds.bottom - bounds.top;

      // Invalidate cached planet bitmaps when the viewport changes size.
      if (w !== lastWidth || h !== lastHeight) {
        lastWidth = w;
        lastHeight = h;
        for (const set of Object.values(sets)) for (const p of set.planets) p.bitmap = null;
      }

      for (const set of Object.values(sets)) {
        const step = Math.min(1, dt / FADE_SECONDS);
        set.alpha += (set.target - set.alpha) * step;
        if (Math.abs(set.target - set.alpha) < 0.005) set.alpha = set.target;
        if (set.alpha === 0) continue;

        for (const p of set.planets) {
          // Pointer parallax, bounded and relaxing back to rest.
          p.ox += velocityX * p.depth * PARALLAX;
          p.oy += velocityY * p.depth * PARALLAX;
          p.ox -= p.ox * Math.min(1, dt * RELAX);
          p.oy -= p.oy * Math.min(1, dt * RELAX);
        }

        if (reducedMotion) continue;
        for (const s of set.ships) {
          s.x += (s.vx + velocityX * s.depth * 0.5) * dt;
          s.y += (s.vy + Math.sin(time * 0.7 + s.phase) * 2 + velocityY * s.depth * 0.5) * dt;
          s.spin += dt * 0.12;
          wrap(s, bounds, 120 * s.scale);
        }
      }
    },

    drawBack(ctx, bounds, dpr) {
      const w = bounds.right - bounds.left;
      const h = bounds.bottom - bounds.top;
      const short = Math.min(w, h);
      const cx = bounds.left + w / 2;
      const cy = bounds.top + h / 2;

      for (const set of Object.values(sets)) {
        if (set.alpha <= 0) continue;

        for (const n of set.nebulae) {
          const r = n.fr * short;
          const x = bounds.left + n.fx * w + Math.sin(time * n.drift * 40) * short * 0.03;
          const y = bounds.top + n.fy * h;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, n.color);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalAlpha = set.alpha;
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }

        for (const p of set.planets) {
          const radius = p.fr * short;
          const x = bounds.left + p.fx * w + p.ox;
          const y = bounds.top + p.fy * h + p.oy;
          if (!p.bitmap || p.bitmapRadius !== radius) {
            // The black hole is the light source; planets face the centre.
            p.bitmap = paintPlanet(p, radius, dpr, Math.atan2(cy - y, cx - x));
            p.bitmapRadius = radius;
          }
          const size = p.bitmap.width / dpr;
          ctx.globalAlpha = set.alpha;
          ctx.drawImage(p.bitmap, x - size / 2, y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    },

    drawFront(ctx, bounds, _dpr) {
      void bounds;
      for (const set of Object.values(sets)) {
        if (set.alpha <= 0) continue;
        for (const s of set.ships) drawShip(ctx, s, time, set.alpha);
      }
    },
  };
}
