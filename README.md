# Alaa Younsi — Portfolio

## Live

**[https://alaa-younsi.vercel.app](https://alaa-younsi.vercel.app)**

---

## Overview

My current main portfolio. A framed, interstellar-themed single-page application built entirely from scratch with React and Vite — no UI libraries, no component frameworks. Every animation, every interactive element is hand-coded. The design philosophy is minimal, dark, and typographic: white borders on black, monospace text, physics-based particles, and a scientifically-inspired black hole as the centrepiece.

---

## Screenshots

![Homepage](./screenshots/screenshot1.png)
![Services Section](./screenshots/screenshot2.png)
![Blog Section](./screenshots/screenshot3.png)
![Homepage](./screenshots/screenshot4.png)
![Services Section](./screenshots/screenshot5.png)
![Homepage](./screenshots/screenshot6.png)
![Services Section](./screenshots/screenshot7.png)

---

## Tech Stack

### Core
| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI component model, hooks-based state & effects |
| **Vite** | 7 | Dev server, HMR, production bundler |
| **Tailwind CSS** | 3 | Utility-first styling, responsive breakpoints, CSS variables |
| **PostCSS + Autoprefixer** | 8 | CSS processing and cross-browser prefixing |

### Libraries
| Library | Role |
|---|---|
| **react-helmet-async** | Document head management (title, meta, OG, Twitter Card tags) |

### Tooling
| Tool | Role |
|---|---|
| **ESLint** (flat config) | Static analysis with `react-hooks` and `react-refresh` plugins |
| **Vercel** | Zero-config deployment, CDN, HTTPS |
| **Git & GitHub** | Version control |

### Fonts (Google Fonts)
- **JetBrains Mono** — primary UI font
- **Fira Code** — fallback
- **Source Code Pro** — fallback

---

## Features

### Layout & Design
- **Framed card UI** — white border frame on full-viewport black background, consistent on all screen sizes
- **Dark / Light mode** — manual toggle, CSS variable-driven theme switching (`--bg`, `--fg`, `--border`)
- **Fully responsive** — custom Tailwind breakpoints (`xs: 375px`, `sm: 640px`, `md–2xl`)
- **Monospace typographic system** — `clamp()`-based fluid type scaling throughout

### Animations & Interactivity
- **Animated star field** — Canvas API particle system; stars follow pointer/touch parallax within the frame boundary using clipping paths; device-pixel-ratio aware
- **Interstellar black hole** — Physics-based Canvas animation with Keplerian orbital motion, Doppler colour shift (blue-shift approaching, red-shift receding), and gravitational lensing glow; explodes on click/tap
- **Splash screen** — Fade-out intro on first load
- **Typing animations** — Character-by-character text reveal for every section (Hero bio, Projects list, Skills, About, Contact) built with `useState`/`useEffect` state machines
- **Glitch text effect** — CSS `text-shadow` animation on all headings and links, intensifies on hover; `::before`/`::after` pseudo-elements for layered glitch
- **Blinking cursor** — Animated `|` cursor during active typing sequences

### Sections
| Section | Description |
|---|---|
| **Home** | Typing biography (bottom-right), external project links with glitch effect (bottom-left), interactive black hole |
| **Projects** | Sequential typing reveal of 8 live projects with labels and titles; inner scroll container clipped to frame |
| **Skills** | Animated skills list |
| **Info (About)** | Biography and background |
| **Contact** | Linktree link with glitch effect |

---

## Project Structure

```
portfolio 1.2/
├── index.html                  # Entry HTML, favicon, font preconnects, page title
├── vite.config.js              # Vite config
├── tailwind.config.js          # Custom breakpoints, extended animations
├── postcss.config.js           # Autoprefixer
├── eslint.config.js            # Flat ESLint config
├── vercel.json                 # Vercel deployment config
├── public/
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── main.jsx                # React root, HelmetProvider
    ├── App.jsx                 # App entry → Home page
    ├── index.css               # Global CSS: glitch keyframes, fonts, mobile base
    ├── assets/                 # Static assets (favicon, images)
    ├── pages/
    │   └── Home.jsx            # Root page: layout, theme vars, navigation state
    └── components/
        ├── Header.jsx          # Nav buttons (Home, Projects, Info, Contact)
        ├── Hero.jsx            # Typing bio + Dead Side / Journey links
        ├── About.jsx           # Info section
        ├── Skills.jsx          # Skills section
        ├── Projects.jsx        # 8 projects with typing animation + inner scroll
        ├── Contact.jsx         # Contact / Linktree link
        ├── Background.jsx      # Canvas star field with pointer parallax
        ├── BlackHole.jsx       # Canvas black hole (physics, Doppler, explosion)
        └── SplashScreen.jsx    # Intro fade-out overlay
```

---

## Portfolio Philosophy

The design rejects the typical "card grid on white background" portfolio format. Instead it treats the portfolio itself as a project — something that demonstrates craft, not just lists it.

---

## Best Practices

### Performance
- Canvas animations use `requestAnimationFrame` with a single loop; no `setInterval` timers on the render path
- Star field and black hole each run on a single `<canvas>` element (no multi-layer canvas stacking)
- `willChange: 'scroll-position'` on the Projects scroll container promotes it to its own compositing layer
- Background `touchmove` listener registered as `{ passive: true }` — never blocks the browser's scroll compositor thread
- Global CSS `transition` rule scoped to `opacity` only — `transform` excluded to prevent full repaints on every scroll frame
- Fonts loaded via `<link rel="preconnect">` + single Google Fonts request with `display=swap`
- Vite tree-shaking eliminates all unused code at build time

### Mobile
- Viewport units use `dvh` (dynamic viewport height) so layout recalculates correctly when the mobile URL bar expands/collapses
- `html`, `body`, `#root` locked to `height: 100%; overflow: hidden` — prevents page-level body scroll and viewport stretch on swipe
- Projects section: `touch-action: pan-y` on both the section and scroll container; `overscroll-behavior: contain` prevents scroll chaining
- CSS `clip-path: inset(var(--frame-y) var(--frame-x))` on the canvas enforces hard GPU-level clipping at the frame boundary on mobile compositors

### SEO
- `react-helmet-async` manages `<title>`, `<meta name="description">`, canonical URL
- Full Open Graph tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:creator`)
- `sitemap.xml` and `robots.txt` in `/public`
- Semantic HTML: `<section>` with `aria-labelledby`, `<h2>` headings per section

### Accessibility
- All interactive elements have `aria-label` attributes
- External links include `target="_blank" rel="noopener noreferrer"` and `aria-label` describing destination
- Theme toggle button has dynamic `aria-label` reflecting current mode
- `<button type="button">` used for all non-form buttons to prevent accidental form submission

### Security
- All external links use `rel="noopener noreferrer"` preventing tab-napping and `window.opener` leaks
- No `dangerouslySetInnerHTML` anywhere in the codebase
- No user input fields — no XSS surface
- `vercel.json` handles routing; no server logic exposed

### Code Quality
- ESLint flat config with `eslint-plugin-react-hooks` (enforces Rules of Hooks) and `eslint-plugin-react-refresh` (HMR safety)
- All `useEffect` hooks have correct dependency arrays
- No unused state setters (converted to constants where setter is never called)
- Component-level `if (active !== "section") return null` guards prevent off-screen renders

---

## License

Copyright (c) 2026 Alaa Younsi. All rights reserved.

1. SCOPE OF LICENSE
This repository is public for the sole purpose of demonstrating professional 
coding skills, architecture, and design capabilities. 

2. RESTRICTIONS
Permission is NOT granted to any person obtaining a copy of this software 
and associated documentation files to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software.

3. PROHIBITED USE
You may not use this code, or any portion of it, to build, host, or 
operate a personal or commercial website. This includes, but is not 
limited to:
   - Cloning this repository to use as a website template.
   - Copying unique CSS styling or custom UI components for reuse.
   - Redistributing this code as your own work.
- **Accessibility Checks** - WCAG compliance validation

##  About the Developer

**Alaa Younsi**
*Full-Stack Developer & UI/UX Designer*

This portfolio represents my commitment to craftsmanship in web development — showcasing not just what I've built, but how I think, solve problems, and continuously evolve as a developer. It's more than a collection of projects; it's an ongoing conversation about technology, design, and creating meaningful digital experiences.

---

*"A portfolio is never finished — it's a living document of a developer's journey, constantly refined with new knowledge, projects, and perspectives. This is my current chapter."*
