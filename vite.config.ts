import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    // Browsers that ship native ESM + top-level await. Keeps the bundle small
    // and avoids shipping transpiled legacy helpers nobody executes.
    target: "es2022",
    cssTarget: "chrome111",
    sourcemap: false,
    // The module-preload polyfill is injected as an INLINE <script>, which is
    // the only thing forcing `script-src 'unsafe-inline'` into the CSP.
    // Every browser in the `target` list supports modulepreload natively.
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // React barely changes between deploys; the app code changes often.
        // Splitting them keeps the vendor chunk cached across releases.
        codeSplitting: {
          groups: [{ name: "react", test: /node_modules\/(react|react-dom|scheduler)\// }],
        },
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
