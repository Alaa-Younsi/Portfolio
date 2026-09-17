# Alaa Younsi — Portfolio

**[alaa-younsi.vercel.app](https://alaa-younsi.vercel.app)**

A framed, interstellar single-page portfolio built from scratch — no UI kit, no
component library, no animation library. Every particle, every glitch and every
frame is hand-written. The design is minimal, dark and typographic: white borders
on black, monospace type, physics-driven canvas, and a scientifically-shaped
black hole at the centre of the page.

---

## Screenshots

![Home](./screenshots/home.png)
![Projects](./screenshots/projects.png)
![Info](./screenshots/info.png)
![Contact](./screenshots/contact.png)

Click the black hole and the frame drops away:

![Collapsed](./screenshots/collapse.png)

| Mobile | | |
|---|---|---|
| ![Mobile home](./screenshots/mobile-home.png) | ![Mobile projects](./screenshots/mobile-projects.png) | ![Mobile info](./screenshots/mobile-info.png) |

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime & package manager | **Bun 1.3** | One binary for install, scripts and test running |
| Build | **Vite 8** (Rolldown) | Sub-second cold start, Rust-speed production builds |
| UI | **React 19** | Hooks only, function components only |
| Language | **TypeScript 5.9**, `strict` | Plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` |
| Styling | **Tailwind CSS 3** | Utilities over CSS-var design tokens |
| Lint & format | **Biome 2** | One binary, one config, replaces ESLint + Prettier |
| Tests | **Vitest 5** + Testing Library | jsdom, canvas stubbed |
| Hosting | **Vercel** | Static edge delivery, headers from `vercel.json` |

Runtime dependencies: `react`, `react-dom`, `react-error-boundary`. That's it.

---

## Getting started

```bash
bun install      # install dependencies
bun dev          # dev server on http://localhost:5173
bun run verify   # typecheck + lint + test
bun run build    # typecheck + production build to dist/
bun run preview  # serve the production build locally
```

| Script | Does |
|---|---|
| `dev` | Vite dev server with HMR |
| `build` | `tsc --build` then `vite build` |
| `preview` | Serves `dist/` |
| `typecheck` | Full TypeScript project build, no emit |
| `lint` | `biome check .` — lint + format + import order |
| `lint:fix` | Applies every safe fix |
| `format` | Formats only |
| `test` / `test:watch` | Vitest |
| `verify` | Everything CI runs, locally |

---

## Structure

```
.
├── index.html                 # All static SEO: meta, Open Graph, JSON-LD, noscript
├── vite.config.ts             # Build target, chunking, Vitest config
├── tailwind.config.ts         # Design tokens: breakpoints, colours, keyframes
├── biome.json                 # Lint + format
├── vercel.json                # Security headers and cache policy
├── public/
│   ├── fonts/                 # Self-hosted JetBrains Mono (variable, latin subset)
│   ├── icon-*.png, favicon.ico, apple-touch-icon.png
│   ├── og-image.png           # 1200×630 social card
│   ├── site.webmanifest, robots.txt, sitemap.xml, humans.txt
└── src/
    ├── main.tsx               # Root + error boundary
    ├── App.tsx
    ├── index.css              # @font-face, CSS variables, base layer, glitch effect
    ├── config/site.ts         # Identity, socials, section metadata
    ├── data/                  # Projects and copy, kept out of components
    ├── lib/
    │   ├── starfield.ts       # Pointer-reactive star simulation (framework-free)
    │   └── blackhole.ts       # Accretion disk, photon ring, collapse (framework-free)
    ├── hooks/
    │   ├── useTypingSequence.ts
    │   ├── useMediaQuery.ts   # + usePrefersReducedMotion, useIsCompact
    │   └── useDocumentTitle.ts
    ├── components/            # Header, Hero, About, Projects, Contact, Frame,
    │                          # SplashScreen, StarField, BlackHole, TypedText
    └── pages/Home.tsx         # Layout + the collapse state machine
```

**The rule the structure follows:** anything that runs at 60 fps lives in
`src/lib/` as plain TypeScript that owns its own canvas, listeners and animation
frame. React never re-renders to animate.

---

## How the pieces work

**Star field** — a particle system whose velocity is driven by pointer delta,
damped by friction each frame. Stars that leave the frame are recycled in from
the opposite edge. The frame boundary is enforced twice: a 2D clip path for the
pixels, and a CSS `clip-path` so mobile compositors cannot bleed the GPU layer
past the border.

**Black hole** — particles orbit on Keplerian paths (inner orbits are faster),
coloured by a Doppler shift: material rotating towards the viewer blue-shifts,
material rotating away red-shifts. They are depth-sorted so the far half of the
disk is occluded by the event horizon. Clicking it detonates the disk, drops the
frame, and lets the star field fill the viewport.

**Typing engine** — `useTypingSequence` holds a single `{ line, chars }` cursor
instead of an array of partial strings, so revealing a character costs one
integer increment rather than an array copy. Every typed line also renders its
finished sentence in an `.sr-only` span, so screen readers get whole sentences
instead of a stream of fragments.

---

## Performance

- **Zero third-party requests.** JetBrains Mono is self-hosted as a single 40 KB
  variable `woff2` (the old build pulled three font families from Google Fonts),
  preloaded from `index.html`.
- Both canvases stop their animation frame on `visibilitychange` — a
  backgrounded tab does no work.
- Device pixel ratio is capped at 2: above that the extra fill rate is invisible
  and expensive on phones.
- Radial gradients in the black hole are cached and only rebuilt when the hover
  state changes; the disk is depth-sorted every tenth frame, not every frame.
- Resize handling is coalesced into one animation frame.
- `prefers-reduced-motion` is honoured end to end: typing completes instantly,
  the splash screen is skipped, the glitch stops, and both canvases render a
  single static frame.
- React is split into its own chunk so app deploys do not invalidate it.
- Production HTML contains no inline script, which is what lets the CSP stay
  strict.

---

## Accessibility

- Semantic landmarks, one `<h1>`, `aria-labelledby` on every section.
- Complete sentences exposed to assistive technology during typing animations.
- All external links carry a descriptive accessible name and open with
  `rel="noopener noreferrer"`.
- The black hole is a real `<button>` — focusable, keyboard-activatable, named.
- Visible `:focus-visible` outline; decorative canvases are not focusable.
- 44px minimum touch targets on small screens.

---

## Security

Enforced at the edge via `vercel.json`:

- **CSP** with `script-src 'self'` — no `unsafe-inline`, no `unsafe-eval`, plus
  `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'none'` and
  `base-uri 'self'`.
- HSTS with `preload`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`
  and a deny-by-default `Permissions-Policy`.
- Immutable caching for hashed assets and fonts; HTML always revalidates.
- No `dangerouslySetInnerHTML`, no user input, no runtime network calls, three
  runtime dependencies.

---

## SEO

Every crawler-visible tag is static in `index.html`, because social scrapers do
not execute JavaScript — title, description, canonical, Open Graph with a
generated 1200×630 card, Twitter card, a `Person` + `WebSite` JSON-LD graph, a
`noscript` fallback with real contact links, plus `sitemap.xml`, `robots.txt` and
a web manifest.

---

## License

All rights reserved — see [LICENSE](./LICENSE). The code is public to be read,
not to be reused.

---

*"A portfolio is never finished — it's a living document of a developer's
journey, constantly refined with new knowledge, projects and perspectives. This
is my current chapter."*
