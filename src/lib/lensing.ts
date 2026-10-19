/**
 * The splash curtain's optics: a point-mass gravitational lens sitting in
 * front of a flat source image (the name and a handful of stars). Every
 * screen pixel is traced back through the lens equation
 *
 *     β = θ − θE² · θ / |θ|²
 *
 * to the source point whose light lands there. With a large Einstein radius
 * θE the name is smeared into a ring around a dark shadow, with a mirrored
 * second image inside it; as θE shrinks to zero the mapping becomes the
 * identity and the name lies flat. Lensing conserves surface brightness, so
 * a plain texture lookup is the whole story — no magnification term.
 */

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uLens;
uniform float uEinstein;
uniform float uOpacity;

void main() {
  vec2 theta = gl_FragCoord.xy - uLens;
  float r2 = max(dot(theta, theta), 1e-3);
  vec2 beta = gl_FragCoord.xy - theta * (uEinstein * uEinstein / r2);
  vec2 uv = beta / uResolution;
  // Light from beyond the source plane's edges is simply dark sky.
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  float light = texture2D(uSource, uv).a * inside * uOpacity;
  gl_FragColor = vec4(vec3(light), light);
}
`;

export type LensState = {
  /** Lens centre in device pixels, origin top-left. */
  x: number;
  y: number;
  /** Einstein radius in device pixels; 0 means no lensing. */
  einstein: number;
  opacity: number;
};

export type LensRenderer = {
  draw: (state: LensState) => void;
  dispose: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

/**
 * Binds `source` (same pixel size as `canvas`, white on transparent) as the
 * lensed image. Returns null when WebGL is unavailable so the caller can show
 * the name unlensed.
 */
export function createLensRenderer(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
): LensRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
  gl.useProgram(program);

  // One triangle covers the clip-space square.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Non-power-of-two texture: WebGL 1 demands clamped, mip-less sampling.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    lens: gl.getUniformLocation(program, "uLens"),
    einstein: gl.getUniformLocation(program, "uEinstein"),
    opacity: gl.getUniformLocation(program, "uOpacity"),
  };

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);

  return {
    draw: ({ x, y, einstein, opacity }) => {
      // gl_FragCoord counts rows from the bottom.
      gl.uniform2f(uniforms.lens, x, canvas.height - y);
      gl.uniform1f(uniforms.einstein, einstein);
      gl.uniform1f(uniforms.opacity, opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose: () => {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
