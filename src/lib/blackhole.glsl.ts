/**
 * GLSL for the ray-marched black hole. Kept in a `.ts` module so it ships in
 * the bundle with no loader and stays type-checked at the call site.
 *
 * Units: the Schwarzschild radius r_s = 2GM/c² is 1. In those units the
 * innermost stable circular orbit sits at 3, the photon sphere at 1.5, and the
 * shadow the observer sees has an apparent radius of √27 / 2 ≈ 2.6.
 */

export const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
precision highp float;

uniform vec2  uResolution;
uniform float uPhase;     // accumulated disk rotation (JS integrates speed)
uniform float uTime;      // seconds, drives slow turbulence
uniform float uHover;     // 0..1 eased
uniform float uCollapse;  // 0..1 eased, the click-to-destroy timeline

const float R_IN    = 3.0;    // ISCO
const float R_OUT   = 12.0;
const float R_BOUND = 12.6;   // bounding sphere: rays start here, not at the camera
const float CAM_DIST = 38.0;
const float TAN_HALF = 0.33;
const float ELEV    = 0.13;   // camera elevation above the disk plane (rad)
const float PI      = 3.141592653589793;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

/**
 * Light emitted where a ray pierces the disk plane.
 * Returns premultiplied colour in rgb and opacity in a.
 */
vec4 diskEmission(vec3 hit, vec3 towardObserver, float rOut, float surge) {
  float r = length(hit.xz);
  float phi = atan(hit.z, hit.x);

  // Keplerian shear: inner material laps the outer material.
  float omega = pow(r, -1.5) * 3.2;
  float a = phi - uPhase * omega;

  // Streaks: high frequency radially, low frequency around the orbit.
  float n1 = fbm(vec2(r * 1.7, a * 2.4));
  float n2 = fbm(vec2(r * 3.4 - uTime * 0.06, a * 5.5 + 3.7));
  float tex = 0.45 + 0.75 * n1 + 0.4 * (n2 - 0.5);

  float t = (r - R_IN) / (rOut - R_IN);
  float x = R_IN / r;
  float flux = (1.0 - sqrt(x)) * pow(x, 2.2) * 13.3;   // normalised to peak ≈ 1
  float outer = 1.0 - smoothstep(0.5, 1.0, t);
  float profile = flux * outer;

  // Special relativity: orbital speed sqrt(r_s / 2r) in units of c.
  float v = sqrt(0.5 / r);
  vec3 tangent = normalize(vec3(hit.z, 0.0, -hit.x));
  float gamma = inversesqrt(1.0 - v * v);
  float doppler = 1.0 / (gamma * (1.0 - v * dot(tangent, towardObserver)));
  // General relativity: light climbing out of the well loses energy.
  float redshift = sqrt(1.0 - 1.0 / r);
  float beam = pow(doppler * redshift, 1.6);

  vec3 hot  = vec3(1.0, 0.95, 0.85);
  vec3 warm = vec3(1.0, 0.6, 0.2);
  vec3 cool = vec3(0.92, 0.3, 0.06);
  vec3 col = mix(hot, warm, smoothstep(0.0, 0.35, t));
  col = mix(col, cool, smoothstep(0.35, 1.0, t));
  col = mix(col, col * vec3(0.72, 0.88, 1.35), clamp((doppler - 1.0) * 1.8, 0.0, 1.0));
  col = mix(col, col * vec3(1.05, 0.5, 0.25), clamp((1.0 - doppler) * 2.4, 0.0, 1.0));

  float energy = profile * tex * beam * 2.2 * (1.0 + 4.0 * surge);
  float opacity = clamp(profile * tex * 2.6, 0.0, 1.0) * 0.9;
  return vec4(col * energy, opacity);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;

  float surge = smoothstep(0.0, 0.5, uCollapse);
  float shock = smoothstep(0.42, 1.0, uCollapse);
  float zoom = 1.0 - 0.035 * uHover + 0.1 * surge;

  vec3 camPos = vec3(0.0, CAM_DIST * sin(ELEV), -CAM_DIST * cos(ELEV));
  vec3 fwd = normalize(-camPos);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 dir = normalize(fwd + (right * uv.x + up * uv.y) * TAN_HALF * zoom);

  // Angular momentum of the ray is conserved: compute it once.
  vec3 hVec = cross(camPos, dir);
  float h2 = dot(hVec, hVec);
  float impact = sqrt(h2);

  vec3 col = vec3(0.0);
  float transmittance = 1.0;
  bool captured = false;

  // Jump straight to the bounding sphere; empty space needs no integration.
  float b = dot(camPos, dir);
  float c = dot(camPos, camPos) - R_BOUND * R_BOUND;
  float disc = b * b - c;

  if (disc > 0.0) {
    float rOut = mix(R_OUT, R_IN + 0.8, surge);
    vec3 pos = camPos + dir * (-b - sqrt(disc));
    vec3 vel = dir;

    for (int i = 0; i < STEPS; i++) {
      float r2 = dot(pos, pos);
      if (r2 < 1.0) { captured = true; break; }
      if (r2 > R_BOUND * R_BOUND && dot(pos, vel) > 0.0) break;

      // Schwarzschild null geodesic: d²x/dλ² = -3/2 · h² · x / r⁵.
      float dt = clamp(0.045 * r2, 0.06, 0.34);
      vec3 acc = -1.5 * h2 * pos / (r2 * r2 * sqrt(r2));
      vel += acc * dt;
      vec3 prev = pos;
      pos += vel * dt;

      if (prev.y * pos.y < 0.0) {
        float k = prev.y / (prev.y - pos.y);
        vec3 hit = mix(prev, pos, k);
        float rh = length(hit.xz);
        if (rh > R_IN && rh < rOut) {
          vec4 e = diskEmission(hit, -normalize(vel), rOut, surge);
          col += e.rgb * transmittance;
          transmittance *= 1.0 - e.a;
          if (transmittance < 0.03) break;
        }
      }
    }
  }

  float alpha = 1.0 - transmittance;
  if (captured) alpha = 1.0;

  // Photon ring: light that orbited the hole before escaping.
  float ring = exp(-pow((impact - 2.62) * 3.2, 2.0));
  col += vec3(1.0, 0.8, 0.55) * ring * (0.14 + 0.22 * uHover + 1.6 * surge);
  alpha = max(alpha, ring * 0.5);

  // A faint haze along the disk plane, outside the shadow: the atmosphere a
  // real accretion flow has and a zero-thickness disk does not.
  float haze = exp(-pow(uv.y * 4.5, 2.0)) * exp(-pow(uv.x * 1.3, 2.0));
  haze *= smoothstep(2.3, 4.0, impact) * 0.06;
  col += vec3(1.0, 0.7, 0.42) * haze;
  alpha = max(alpha, haze * 2.0);

  // Filmic exposure: beamed highlights roll off to white instead of clipping.
  col = min(col, vec3(2.4));
  col = 1.0 - exp(-col * (1.0 + 0.3 * uHover));
  col = pow(col, vec3(0.95));

  // Collapse: surge, a flash at the horizon, then a shockwave racing outward
  // while everything behind it goes dark.
  float fade = 1.0 - smoothstep(0.48, 0.8, uCollapse);
  col *= fade;
  alpha *= fade;

  float flashWindow = smoothstep(0.32, 0.5, uCollapse) * (1.0 - smoothstep(0.5, 0.78, uCollapse));
  float flash = exp(-impact * impact * 0.3) * flashWindow * 2.2;
  col += vec3(1.0, 0.96, 0.88) * flash;
  alpha = max(alpha, min(flash, 1.0));

  float waveRadius = 2.6 + shock * 10.4;
  float waveWidth = 0.8 + 1.2 * shock;
  float waveGate = smoothstep(0.42, 0.46, uCollapse);
  float wave = exp(-pow((impact - waveRadius) / waveWidth, 2.0)) * pow(1.0 - shock, 0.55) * 2.0 * waveGate;
  col += vec3(1.0, 0.88, 0.7) * wave;
  alpha = max(alpha, min(wave, 1.0));

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;
