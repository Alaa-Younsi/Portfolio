import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * The canonical origin, and the only place it is written down.
 *
 * It reaches the rest of the project three ways: `%SITE_URL%` placeholders in
 * `index.html` (head tags + JSON-LD), the `__SITE_URL__` compile-time constant
 * in application code, and the generated `robots.txt` / `sitemap.xml` below.
 * Changing this line moves the whole site to a new domain.
 */
const SITE_URL = "https://ashv3il.me";

const ROBOTS_TXT = `User-agent: *
Allow: /

# The raw font binary has no standalone value in a search index.
Disallow: /fonts/

Sitemap: ${SITE_URL}/sitemap.xml
`;

const sitemapXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

/** Derives every absolute URL in the output from `SITE_URL`. */
function seo(): Plugin {
  return {
    name: "portfolio-seo",

    transformIndexHtml: {
      order: "pre",
      handler: (html) => html.replaceAll("%SITE_URL%", SITE_URL),
    },

    // Dev should serve exactly what production will, rather than 404.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(ROBOTS_TXT);
          return;
        }
        if (req.url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(sitemapXml());
          return;
        }
        next();
      });
    },

    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: ROBOTS_TXT });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml() });
    },
  };
}

export default defineConfig({
  plugins: [react(), seo()],

  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },

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
