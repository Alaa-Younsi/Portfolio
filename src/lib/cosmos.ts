/**
 * The furniture of space: planets, ships, a station and nebulae, drawn behind
 * and in front of the star field. Two scenes share one renderer — "home" lives
 * inside the frame across every section, "chronicle" replaces it behind the
 * biography — and cross-fade when the scene changes.
 *
 * Planets are shaded per pixel into offscreen bitmaps once (sphere normals,
 * procedural surfaces, wrap lighting, atmosphere, rings that receive the
 * planet's shadow) and blitted every frame. Ships are vector hulls with
 * panel lines, engine glow and trails. Everything works in CSS pixels; the
 * caller scales the context by the device pixel ratio.
 */

export type Scene = "home" | "chronicle";

export type Bounds = { left: number; top: number; right: number; bottom: number };

// ---------------------------------------------------------------------------
// Noise
// ---------------------------------------------------------------------------

const fract = (x: number): number => x - Math.floor(x);
const smooth = (t: number): number => t * t * (3 - 2 * t);
const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function hash2(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return mix(mix(a, b, fx), mix(c, d, fx), fy);
}

function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise(px, py);
    px = px * 2.03 + 17.3;
    py = py * 2.03 + 9.1;
    amplitude *= 0.5;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Scene data
// ---------------------------------------------------------------------------

type RGB = readonly [number, number, number];

type Surface =
  | {
      kind: "gas";
      bands: number;
      low: RGB;
      high: RGB;
      storm: RGB;
      stormLat: number;
      stormLon: number;
    }
  | { kind: "rock"; lowland: RGB; highland: RGB; craters: number }
  | { kind: "ice"; base: RGB; crack: RGB };

type Ring = {
  inner: number;
  outer: number;
  /** Apparent squash of the ring ellipse (1 = face on). */
  tilt: number;
  rotation: number;
  color: RGB;
};

type PlanetStyle = {
  surface: Surface;
  atmosphere: RGB;
  atmosphereStrength: number;
  /** Axial tilt of the surface texture, radians. */
  axis: number;
  ring?: Ring;
  moons?: number;
};

type Planet = {
  fx: number;
  fy: number;
  /** Radius as a fraction of the shorter viewport edge. */
  fr: number;
  depth: number;
  style: PlanetStyle;
  bitmap: HTMLCanvasElement | null;
  bitmapKey: string;
  /** Radius in CSS pixels the bitmap was painted for. */
  bitmapRadius: number;
  ox: number;
  oy: number;
};

type ShipDesign = "interceptor" | "hauler" | "corvette" | "station" | "probe";

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

type Nebula = { fx: number; fy: number; fr: number; color: RGB; alpha: number; seed: number };

type SceneSet = {
  planets: Planet[];
  ships: Ship[];
  nebulae: Nebula[];
  nebulaBitmaps: (HTMLCanvasElement | null)[];
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
/** Bitmap radius cap in device pixels; larger planets are upscaled from this. */
const MAX_BITMAP_RADIUS = 230;

const planet = (fx: number, fy: number, fr: number, depth: number, style: PlanetStyle): Planet => ({
  fx,
  fy,
  fr,
  depth,
  style,
  bitmap: null,
  bitmapKey: "",
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

/** Home: a quiet system. A banded, ringed giant; a cratered rock with a moon. */
function homeSet(): SceneSet {
  return {
    planets: [
      planet(0.86, 0.22, 0.078, 0.35, {
        surface: {
          kind: "gas",
          bands: 11,
          low: [0.2, 0.22, 0.29],
          high: [0.62, 0.64, 0.72],
          storm: [0.78, 0.7, 0.62],
          stormLat: -0.35,
          stormLon: 0.4,
        },
        atmosphere: [0.62, 0.7, 0.95],
        atmosphereStrength: 0.7,
        axis: -0.42,
        ring: { inner: 1.4, outer: 2.15, tilt: 0.3, rotation: -0.32, color: [0.8, 0.8, 0.86] },
      }),
      planet(0.13, 0.7, 0.034, 0.55, {
        surface: {
          kind: "rock",
          lowland: [0.3, 0.26, 0.23],
          highland: [0.56, 0.49, 0.42],
          craters: 7,
        },
        atmosphere: [0.75, 0.6, 0.45],
        atmosphereStrength: 0.25,
        axis: 0.3,
        moons: 1,
      }),
    ],
    ships: [
      ship("interceptor", 0.2, 0.42, 11, -1.4, 0.8, 0.75),
      ship("corvette", 0.72, 0.78, -14, -2.5, 0.62, 0.55),
      ship("probe", 0.9, 0.58, -4, 0.8, 0.55, 0.4),
    ],
    nebulae: [],
    nebulaBitmaps: [],
    alpha: 1,
    target: 1,
  };
}

/** Chronicle: a bigger neighbourhood. A gas giant off the edge, ice, a station, freight. */
function chronicleSet(): SceneSet {
  return {
    planets: [
      planet(1.03, 0.76, 0.27, 0.2, {
        surface: {
          kind: "gas",
          bands: 15,
          low: [0.32, 0.22, 0.14],
          high: [0.78, 0.64, 0.46],
          storm: [0.85, 0.5, 0.32],
          stormLat: 0.28,
          stormLon: -0.5,
        },
        atmosphere: [0.95, 0.75, 0.5],
        atmosphereStrength: 0.55,
        axis: 0.22,
        ring: { inner: 1.3, outer: 2.0, tilt: 0.22, rotation: 0.16, color: [0.86, 0.78, 0.66] },
      }),
      planet(0.1, 0.18, 0.05, 0.5, {
        surface: { kind: "ice", base: [0.72, 0.8, 0.86], crack: [0.3, 0.42, 0.52] },
        atmosphere: [0.6, 0.85, 1.0],
        atmosphereStrength: 0.6,
        axis: -0.2,
        moons: 2,
      }),
    ],
    ships: [
      ship("station", 0.11, 0.6, 1.5, -0.4, 1, 0.3),
      ship("hauler", 0.85, 0.16, -8, 1.6, 0.75, 0.5),
      ship("interceptor", 0.1, 0.9, 28, -6, 0.5, 0.9),
      ship("probe", 0.55, 0.06, 9, 2, 0.5, 0.6),
    ],
    nebulae: [
      { fx: 0.32, fy: 0.3, fr: 0.62, color: [0.42, 0.44, 0.8], alpha: 0.22, seed: 3.1 },
      { fx: 0.82, fy: 0.72, fr: 0.5, color: [0.75, 0.38, 0.5], alpha: 0.14, seed: 7.7 },
    ],
    nebulaBitmaps: [],
    alpha: 0,
    target: 0,
  };
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

const out: [number, number, number] = [0, 0, 0];

function sampleSurface(s: Surface, lat: number, lon: number): [number, number, number] {
  if (s.kind === "gas") {
    const turbulence = fbm(lon * 1.6 + 3.0, lat * 3.4, 4) - 0.5;
    const band = 0.5 + 0.5 * Math.sin(lat * s.bands + turbulence * 3.2);
    const detail = fbm(lon * 4.5, lat * 11 + 5.0, 3) - 0.5;
    const t = clamp01(band + detail * 0.45);
    const dlat = (lat - s.stormLat) * 3.2;
    const dlon = (lon - s.stormLon) * 1.6;
    const storm = Math.exp(-(dlat * dlat + dlon * dlon) * 9) * 0.9;
    out[0] = mix(mix(s.low[0], s.high[0], t), s.storm[0], storm);
    out[1] = mix(mix(s.low[1], s.high[1], t), s.storm[1], storm);
    out[2] = mix(mix(s.low[2], s.high[2], t), s.storm[2], storm);
    return out;
  }
  if (s.kind === "rock") {
    const elevation = fbm(lon * 2.4 + 1.0, lat * 2.4, 5);
    let t = smoothstep(0.42, 0.62, elevation);
    let shade = 0.85 + 0.3 * (fbm(lon * 9, lat * 9, 3) - 0.5);
    for (let i = 0; i < s.craters; i++) {
      const clat = (hash2(i, 1.7) - 0.5) * 2.4;
      const clon = (hash2(i, 4.2) - 0.5) * 3.6;
      const radius = 0.08 + hash2(i, 9.9) * 0.14;
      const d = Math.hypot((lat - clat) * 1.2, lon - clon);
      const bowl = 1 - smoothstep(radius * 0.45, radius, d);
      const rim = smoothstep(radius * 0.7, radius, d) * (1 - smoothstep(radius, radius * 1.25, d));
      shade *= 1 - bowl * 0.45 + rim * 0.5;
      t = mix(t, 0.2, bowl * 0.6);
    }
    out[0] = mix(s.lowland[0], s.highland[0], t) * shade;
    out[1] = mix(s.lowland[1], s.highland[1], t) * shade;
    out[2] = mix(s.lowland[2], s.highland[2], t) * shade;
    return out;
  }
  const n = fbm(lon * 3.6, lat * 3.6 + 2.0, 4);
  const crack = 1 - smoothstep(0.0, 0.035, Math.abs(n - 0.5) - 0.004);
  const frost = 0.9 + 0.2 * (fbm(lon * 12, lat * 12, 2) - 0.5);
  out[0] = mix(s.base[0] * frost, s.crack[0], crack * 0.85);
  out[1] = mix(s.base[1] * frost, s.crack[1], crack * 0.85);
  out[2] = mix(s.base[2] * frost, s.crack[2], crack * 0.85);
  return out;
}

/** Ring density along the radius, in planet radii: bands, a Cassini gap, fading edges. */
function ringDensity(rr: number, ring: Ring): number {
  const t = (rr - ring.inner) / (ring.outer - ring.inner);
  if (t <= 0 || t >= 1) return 0;
  const bands = fbm(rr * 7.5, 0.5, 3);
  const fine = fbm(rr * 31, 2.5, 2);
  const gap = 1 - smoothstep(0.48, 0.52, t) * (1 - smoothstep(0.55, 0.6, t));
  const edge = smoothstep(0, 0.06, t) * (1 - smoothstep(0.85, 1, t));
  return clamp01((bands - 0.28) * 1.7) * (0.65 + 0.35 * fine) * gap * edge;
}

// ---------------------------------------------------------------------------
// Planet painting (once per size)
// ---------------------------------------------------------------------------

function paintPlanet(p: Planet, radiusPx: number, lightAngle: number): HTMLCanvasElement {
  const R = radiusPx;
  const ring = p.style.ring;
  const reach = Math.max(ring ? ring.outer : 1, 1.18);
  const extent = Math.ceil(R * reach + 3);
  const size = extent * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const image = ctx.createImageData(size, size);
  const data = image.data;

  // Light from the black hole (screen centre), raised toward the viewer.
  const lz = 0.62;
  const lxy = Math.sqrt(1 - lz * lz);
  const lx = Math.cos(lightAngle) * lxy;
  const ly = Math.sin(lightAngle) * lxy;
  const axisCos = Math.cos(p.style.axis);
  const axisSin = Math.sin(p.style.axis);
  const ringCos = ring ? Math.cos(ring.rotation) : 1;
  const ringSin = ring ? Math.sin(ring.rotation) : 0;
  const atmo = p.style.atmosphere;
  const glowReach = 1.18;

  for (let y = 0; y < size; y++) {
    const py = (y - extent + 0.5) / R;
    for (let x = 0; x < size; x++) {
      const px = (x - extent + 0.5) / R;
      const d2 = px * px + py * py;
      const index = (y * size + x) * 4;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      // --- ring sample, in ring-local coordinates ---------------------------
      let ringDensityHere = 0;
      let ringFront = false;
      let ringLit = 1;
      if (ring) {
        const rx = px * ringCos + py * ringSin;
        const ry = -px * ringSin + py * ringCos;
        const rr = Math.sqrt(rx * rx + (ry * ry) / (ring.tilt * ring.tilt));
        ringDensityHere = ringDensity(rr, ring);
        ringFront = ry > 0;
        if (ringDensityHere > 0) {
          const dist = Math.sqrt(d2) || 1;
          const toward = (px * lx + py * ly) / dist;
          // The planet's shadow falls on the ring behind it, away from the light.
          const perpendicular = Math.abs(px * ly - py * lx);
          const behind = toward < 0 && !ringFront;
          const shadow = behind ? 1 - smoothstep(0.9, 1.08, perpendicular) : 0;
          ringLit = (0.45 + 0.55 * (0.5 + 0.5 * toward)) * (1 - shadow * 0.88);
        }
      }

      if (d2 <= 1) {
        // --- sphere -----------------------------------------------------------
        const nz = Math.sqrt(1 - d2);
        // Axial tilt: rotate the normal about the view axis before mapping.
        const tx = px * axisCos - py * axisSin;
        const ty = px * axisSin + py * axisCos;
        const lat = Math.asin(Math.max(-1, Math.min(1, ty)));
        const lon = Math.atan2(tx, nz);
        const base = sampleSurface(p.style.surface, lat, lon);

        const ndotl = px * lx + py * ly + nz * lz;
        const diffuse = smoothstep(-0.18, 0.45, ndotl);
        const fresnel = (1 - nz) ** 2.6;
        const light = 0.035 + diffuse * 1.05;
        const rim = fresnel * (0.25 + 0.75 * diffuse) * p.style.atmosphereStrength;

        r = base[0] * light + atmo[0] * rim;
        g = base[1] * light + atmo[1] * rim;
        b = base[2] * light + atmo[2] * rim;

        if (p.style.surface.kind === "ice") {
          // Glossy highlight on ice.
          const hx = lx;
          const hy = ly;
          const hz = lz + 1;
          const hl = Math.sqrt(hx * hx + hy * hy + hz * hz);
          const spec = Math.max(0, (px * hx + py * hy + nz * hz) / hl) ** 60 * 0.4;
          r += spec;
          g += spec;
          b += spec;
        }

        // Limb darkening keeps the edge from reading as a flat cut-out.
        const limb = 0.72 + 0.28 * nz;
        r *= limb;
        g *= limb;
        b *= limb;
        a = 1;

        // Front half of the ring crosses in front of the body.
        if (ring && ringFront && ringDensityHere > 0) {
          const k = ringDensityHere * 0.92;
          r = mix(r, ring.color[0] * ringLit, k);
          g = mix(g, ring.color[1] * ringLit, k);
          b = mix(b, ring.color[2] * ringLit, k);
        }
      } else if (ring && ringDensityHere > 0) {
        // --- ring outside the disc ------------------------------------------
        r = ring.color[0] * ringLit;
        g = ring.color[1] * ringLit;
        b = ring.color[2] * ringLit;
        a = ringDensityHere * 0.95;
      } else if (d2 < glowReach * glowReach) {
        // --- atmosphere halo ------------------------------------------------
        const dist = Math.sqrt(d2);
        const falloff = 1 - (dist - 1) / (glowReach - 1);
        const toward = (px * lx + py * ly) / dist;
        const lit = 0.25 + 0.75 * Math.max(0, toward * 0.6 + 0.4);
        a = falloff * falloff * 0.5 * lit * p.style.atmosphereStrength;
        r = atmo[0];
        g = atmo[1];
        b = atmo[2];
      }

      data[index] = Math.min(255, r * 255);
      data[index + 1] = Math.min(255, g * 255);
      data[index + 2] = Math.min(255, b * 255);
      data[index + 3] = Math.min(255, a * 255);
    }
  }

  ctx.putImageData(image, 0, 0);

  // Moons: small lit spheres parked off to one side, drawn over the image.
  if (p.style.moons) {
    ctx.translate(extent, extent);
    for (let i = 0; i < p.style.moons; i++) {
      const angle = 0.9 + i * 1.7;
      const distance = R * (1.55 + i * 0.5);
      const mr = Math.max(1.5, R * (0.13 - i * 0.03));
      const mx = Math.cos(angle) * distance;
      const my = Math.sin(angle) * distance * 0.6;
      const gradient = ctx.createRadialGradient(
        mx + lx * mr * 0.5,
        my + ly * mr * 0.5,
        0,
        mx,
        my,
        mr,
      );
      gradient.addColorStop(0, "#d6d6dc");
      gradient.addColorStop(0.6, "#6a6a72");
      gradient.addColorStop(1, "#111114");
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  return canvas;
}

/** Soft cloud texture for a nebula, rendered small and drawn scaled. */
function paintNebula(n: Nebula): HTMLCanvasElement {
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const image = ctx.createImageData(size, size);
  const data = image.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * 2 - 1;
      const v = (y / size) * 2 - 1;
      const d = Math.sqrt(u * u + v * v);
      const falloff = 1 - smoothstep(0.35, 1, d);
      const cloud = fbm(u * 2.4 + n.seed, v * 2.4 + n.seed * 1.3, 5);
      const density = clamp01((cloud - 0.38) * 2.2) * falloff;
      const index = (y * size + x) * 4;
      data[index] = n.color[0] * 255;
      data[index + 1] = n.color[1] * 255;
      data[index + 2] = n.color[2] * 255;
      data[index + 3] = density * n.alpha * 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// Ships
// ---------------------------------------------------------------------------

type Point = readonly [number, number];

function polygon(ctx: CanvasRenderingContext2D, points: readonly Point[]): void {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    if (i === 0) ctx.moveTo(point[0], point[1]);
    else ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
}

function polyline(ctx: CanvasRenderingContext2D, points: readonly Point[]): void {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    if (i === 0) ctx.moveTo(point[0], point[1]);
    else ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
}

const mirror = (points: readonly Point[]): Point[] => points.map(([x, y]) => [x, -y] as const);

function thruster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);
  glow.addColorStop(0, `rgba(215,240,255,${0.95 * alpha})`);
  glow.addColorStop(0.35, `rgba(120,190,255,${0.5 * alpha})`);
  glow.addColorStop(1, "rgba(120,190,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function trail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  width: number,
  alpha: number,
): void {
  const gradient = ctx.createLinearGradient(x, 0, x - length, 0);
  gradient.addColorStop(0, `rgba(160,210,255,${0.45 * alpha})`);
  gradient.addColorStop(0.5, `rgba(160,210,255,${0.14 * alpha})`);
  gradient.addColorStop(1, "rgba(160,210,255,0)");
  ctx.fillStyle = gradient;
  polygon(ctx, [
    [x, y - width],
    [x - length, y],
    [x, y + width],
  ]);
  ctx.fill();
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  s: Ship,
  time: number,
  alpha: number,
  lightAngle: number,
): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  const heading = s.design === "station" ? s.spin : Math.atan2(s.vy, s.vx);
  ctx.rotate(heading);
  ctx.scale(s.scale, s.scale);
  const line = 1 / s.scale;
  const edge = (0.35 + 0.5 * s.depth) * alpha;
  ctx.lineWidth = line;
  ctx.lineJoin = "round";

  // Hull shading: lit from the black hole, expressed in the ship's own frame.
  const local = lightAngle - heading;
  const hull = ctx.createLinearGradient(
    Math.cos(local) * 18,
    Math.sin(local) * 18,
    -Math.cos(local) * 18,
    -Math.sin(local) * 18,
  );
  hull.addColorStop(0, `rgba(58,62,74,${alpha})`);
  hull.addColorStop(0.5, `rgba(22,23,28,${alpha})`);
  hull.addColorStop(1, `rgba(6,6,8,${alpha})`);
  const panel = `rgba(255,255,255,${edge * 0.35})`;
  const outline = `rgba(255,255,255,${edge})`;
  const blink = Math.sin(time * 5 + s.phase) > 0.8 ? alpha : 0;

  const part = (points: readonly Point[]): void => {
    polygon(ctx, points);
    ctx.fillStyle = hull;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.stroke();
  };

  if (s.design === "station") {
    // Torus, radial trusses, hub, docking spar and two solar wings.
    ctx.strokeStyle = outline;
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.arc(0, 0, 36, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = panel;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 37.5, Math.sin(a) * 37.5);
      ctx.lineTo(Math.cos(a) * 42.5, Math.sin(a) * 42.5);
      ctx.stroke();
    }
    ctx.strokeStyle = outline;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      polygon(ctx, [
        [c * 10 - sn * 2, sn * 10 + c * 2],
        [c * 36 - sn * 2, sn * 36 + c * 2],
        [c * 36 + sn * 2, sn * 36 - c * 2],
        [c * 10 + sn * 2, sn * 10 - c * 2],
      ]);
      ctx.fillStyle = hull;
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = hull;
    ctx.fill();
    ctx.stroke();
    part([
      [0, -10],
      [3, -10],
      [3, -70],
      [0, -70],
      [-3, -70],
      [-3, -10],
    ]);
    for (const side of [-1, 1]) {
      part([
        [4, side * 52],
        [30, side * 52],
        [30, side * 66],
        [4, side * 66],
      ]);
      part([
        [-4, side * 52],
        [-30, side * 52],
        [-30, side * 66],
        [-4, side * 66],
      ]);
      ctx.strokeStyle = panel;
      for (let i = 1; i < 5; i++) {
        polyline(ctx, [
          [4 + i * 5.2, side * 52],
          [4 + i * 5.2, side * 66],
        ]);
        polyline(ctx, [
          [-4 - i * 5.2, side * 52],
          [-4 - i * 5.2, side * 66],
        ]);
      }
      ctx.strokeStyle = outline;
      polyline(ctx, [
        [0, side * 10],
        [0, side * 52],
      ]);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const on = Math.sin(time * 3 + i) > 0.6 ? alpha : 0;
      ctx.fillStyle = `rgba(120,230,255,${on})`;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 44, Math.sin(a) * 44, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (s.design === "interceptor") {
    trail(ctx, -34, 0, 110, 2.2, alpha);
    // Wings first, then the fuselage over them.
    const wing: Point[] = [
      [2, -5],
      [-22, -24],
      [-34, -26],
      [-32, -16],
      [-24, -5],
    ];
    part(wing);
    part(mirror(wing));
    ctx.strokeStyle = panel;
    polyline(ctx, [
      [-8, -8],
      [-26, -20],
    ]);
    polyline(ctx, [
      [-8, 8],
      [-26, 20],
    ]);
    ctx.strokeStyle = outline;
    part([
      [48, 0],
      [34, -3.5],
      [12, -6],
      [-20, -6.5],
      [-32, -4],
      [-36, 0],
      [-32, 4],
      [-20, 6.5],
      [12, 6],
      [34, 3.5],
    ]);
    // Canopy.
    polygon(ctx, [
      [28, -2],
      [18, -3.5],
      [10, -2.5],
      [10, 2.5],
      [18, 3.5],
      [28, 2],
    ]);
    ctx.fillStyle = `rgba(150,200,255,${0.35 * alpha})`;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = panel;
    polyline(ctx, [
      [8, -4],
      [-24, -4.5],
    ]);
    polyline(ctx, [
      [8, 4],
      [-24, 4.5],
    ]);
    thruster(ctx, -37, -2.2, 2.2, alpha);
    thruster(ctx, -37, 2.2, 2.2, alpha);
    ctx.fillStyle = `rgba(255,255,255,${blink})`;
    ctx.beginPath();
    ctx.arc(-33, -26, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,120,120,${blink})`;
    ctx.beginPath();
    ctx.arc(-33, 26, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.design === "hauler") {
    trail(ctx, -62, -6, 90, 2, alpha);
    trail(ctx, -62, 6, 90, 2, alpha);
    // Spine, three cargo modules, forward cabin, engine block.
    part([
      [-56, -3],
      [34, -3],
      [34, 3],
      [-56, 3],
    ]);
    for (let i = 0; i < 3; i++) {
      const cx = -42 + i * 24;
      part([
        [cx - 9, -12],
        [cx + 9, -12],
        [cx + 12, -4],
        [cx + 12, 4],
        [cx + 9, 12],
        [cx - 9, 12],
        [cx - 12, 4],
        [cx - 12, -4],
      ]);
      ctx.strokeStyle = panel;
      polyline(ctx, [
        [cx - 9, -6],
        [cx + 9, -6],
      ]);
      polyline(ctx, [
        [cx - 9, 6],
        [cx + 9, 6],
      ]);
      ctx.strokeStyle = outline;
    }
    part([
      [34, -8],
      [50, -6],
      [56, -2],
      [56, 2],
      [50, 6],
      [34, 8],
    ]);
    polyline(ctx, [
      [46, -6],
      [46, -16],
      [52, -16],
    ]);
    part([
      [-70, -10],
      [-56, -10],
      [-56, 10],
      [-70, 10],
    ]);
    thruster(ctx, -72, -6, 2.4, alpha);
    thruster(ctx, -72, 6, 2.4, alpha);
    ctx.fillStyle = `rgba(255,255,255,${blink})`;
    ctx.beginPath();
    ctx.arc(52, -16, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.design === "corvette") {
    trail(ctx, -36, 0, 80, 2.4, alpha);
    // Angular hull, dorsal fin, side pods.
    part([
      [42, 0],
      [26, -7],
      [-8, -9],
      [-28, -13],
      [-36, -6],
      [-36, 6],
      [-28, 13],
      [-8, 9],
      [26, 7],
    ]);
    part([
      [8, -9],
      [-20, -9],
      [-24, -18],
      [-2, -18],
    ]);
    part([
      [8, 9],
      [-20, 9],
      [-24, 18],
      [-2, 18],
    ]);
    ctx.strokeStyle = panel;
    polyline(ctx, [
      [30, -4],
      [-30, -6],
    ]);
    polyline(ctx, [
      [30, 4],
      [-30, 6],
    ]);
    polyline(ctx, [
      [20, 0],
      [-30, 0],
    ]);
    ctx.strokeStyle = outline;
    polygon(ctx, [
      [30, -2],
      [20, -3],
      [20, 3],
      [30, 2],
    ]);
    ctx.fillStyle = `rgba(150,200,255,${0.35 * alpha})`;
    ctx.fill();
    ctx.stroke();
    thruster(ctx, -38, -3, 2.4, alpha);
    thruster(ctx, -38, 3, 2.4, alpha);
    ctx.fillStyle = `rgba(255,255,255,${blink})`;
    ctx.beginPath();
    ctx.arc(-24, -18, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Probe: bus, dish, two solar panels, antenna. Tumbles slowly.
    ctx.rotate(s.spin * 2);
    for (const side of [-1, 1]) {
      part([
        [-6, side * 8],
        [6, side * 8],
        [6, side * 34],
        [-6, side * 34],
      ]);
      ctx.strokeStyle = panel;
      for (let i = 1; i < 5; i++) {
        polyline(ctx, [
          [-6, side * (8 + i * 5.2)],
          [6, side * (8 + i * 5.2)],
        ]);
      }
      ctx.strokeStyle = outline;
    }
    part([
      [-8, -8],
      [8, -8],
      [8, 8],
      [-8, 8],
    ]);
    ctx.beginPath();
    ctx.arc(14, 0, 9, -1.3, 1.3);
    ctx.stroke();
    polyline(ctx, [
      [8, 0],
      [16, 0],
    ]);
    polyline(ctx, [
      [-8, 0],
      [-18, 0],
    ]);
    ctx.fillStyle = `rgba(255,255,255,${blink})`;
    ctx.beginPath();
    ctx.arc(-18, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

export function createCosmos(initial: Scene): Cosmos {
  const sets: Record<Scene, SceneSet> = { home: homeSet(), chronicle: chronicleSet() };
  for (const key of Object.keys(sets) as Scene[]) {
    sets[key].alpha = key === initial ? 1 : 0;
    sets[key].target = sets[key].alpha;
  }

  let reducedMotion = false;
  let time = 0;
  let placed = false;

  /** Planet size follows the viewport, not the frame, so bitmaps survive the collapse. */
  const shortEdge = (): number => Math.min(window.innerWidth, window.innerHeight);

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

  /**
   * Paint at most one bitmap per frame, inactive scene included, so the work
   * is spread across idle frames instead of landing on the collapse.
   */
  const warm = (bounds: Bounds, dpr: number): void => {
    const w = bounds.right - bounds.left;
    const h = bounds.bottom - bounds.top;
    const cx = bounds.left + w / 2;
    const cy = bounds.top + h / 2;
    const short = shortEdge();
    for (const set of Object.values(sets)) {
      for (const p of set.planets) {
        const radius = p.fr * short;
        const key = `${Math.round(radius)}:${Math.round(dpr * 10)}`;
        if (p.bitmap && p.bitmapKey === key) continue;
        const px = Math.min(MAX_BITMAP_RADIUS, radius * dpr);
        const x = bounds.left + p.fx * w;
        const y = bounds.top + p.fy * h;
        p.bitmap = paintPlanet(p, px, Math.atan2(cy - y, cx - x));
        p.bitmapKey = key;
        p.bitmapRadius = radius;
        return;
      }
      for (let i = 0; i < set.nebulae.length; i++) {
        if (set.nebulaBitmaps[i]) continue;
        const nebula = set.nebulae[i];
        if (!nebula) continue;
        set.nebulaBitmaps[i] = paintNebula(nebula);
        return;
      }
    }
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

      for (const set of Object.values(sets)) {
        const step = Math.min(1, dt / FADE_SECONDS);
        set.alpha += (set.target - set.alpha) * step;
        if (Math.abs(set.target - set.alpha) < 0.005) set.alpha = set.target;
        if (set.alpha === 0) continue;

        for (const p of set.planets) {
          p.ox += velocityX * p.depth * PARALLAX;
          p.oy += velocityY * p.depth * PARALLAX;
          p.ox -= p.ox * Math.min(1, dt * RELAX);
          p.oy -= p.oy * Math.min(1, dt * RELAX);
        }

        if (reducedMotion) continue;
        for (const s of set.ships) {
          s.x += (s.vx + velocityX * s.depth * 0.5) * dt;
          s.y += (s.vy + Math.sin(time * 0.7 + s.phase) * 2 + velocityY * s.depth * 0.5) * dt;
          s.spin += dt * 0.1;
          wrap(s, bounds, 140 * s.scale);
        }
      }
    },

    drawBack(ctx, bounds, dpr) {
      warm(bounds, dpr);
      const w = bounds.right - bounds.left;
      const h = bounds.bottom - bounds.top;
      const short = shortEdge();

      for (const set of Object.values(sets)) {
        if (set.alpha <= 0) continue;

        for (let i = 0; i < set.nebulae.length; i++) {
          const n = set.nebulae[i];
          const bitmap = set.nebulaBitmaps[i];
          if (!n || !bitmap) continue;
          const r = n.fr * short;
          const x = bounds.left + n.fx * w + Math.sin(time * 0.05 + n.seed) * short * 0.02;
          const y = bounds.top + n.fy * h + Math.cos(time * 0.04 + n.seed) * short * 0.015;
          ctx.globalAlpha = set.alpha;
          ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
        }

        for (const p of set.planets) {
          if (!p.bitmap) continue;
          const radius = p.fr * short;
          const x = bounds.left + p.fx * w + p.ox;
          const y = bounds.top + p.fy * h + p.oy;
          // Bitmap pixels per planet radius tells us how big to draw it now.
          const pxRadius = Math.min(MAX_BITMAP_RADIUS, p.bitmapRadius * dpr);
          const size = (p.bitmap.width / pxRadius) * radius;
          ctx.globalAlpha = set.alpha;
          ctx.drawImage(p.bitmap, x - size / 2, y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    },

    drawFront(ctx, bounds, _dpr) {
      const cx = (bounds.left + bounds.right) / 2;
      const cy = (bounds.top + bounds.bottom) / 2;
      for (const set of Object.values(sets)) {
        if (set.alpha <= 0) continue;
        for (const s of set.ships) {
          drawShip(ctx, s, time, set.alpha, Math.atan2(cy - s.y, cx - s.x));
        }
      }
    },
  };
}
