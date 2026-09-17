export type Project = {
  /** "year / engagement / category" — rendered above the title. */
  readonly meta: string;
  readonly title: string;
  readonly url: string;
};

export const projects: readonly Project[] = [
  {
    meta: "2026 / Commission / Online Shop",
    title: "Arcada",
    url: "https://arcada-store.vercel.app/",
  },
  {
    meta: "2026 / Commission / Online Shop",
    title: "Northernwest",
    url: "https://northernwest20.vercel.app/",
  },
  { meta: "2026 / Commission / Company", title: "Afia Export", url: "https://www.afiaexport.com/" },
  {
    meta: "2026 / Commission / Online Store",
    title: "VintageDZ",
    url: "https://vintagedz.vercel.app/",
  },
  {
    meta: "2026 / Commission / Platform",
    title: "Supremease",
    url: "https://supremease1-0.vercel.app/",
  },
  {
    meta: "2026 / Commission / Platform",
    title: "DentaBot",
    url: "https://denta-bot1-0.vercel.app/",
  },
  {
    meta: "2026 / Personal / Playground",
    title: "CPlayground",
    url: "https://c-playground-web-edition.vercel.app/",
  },
  { meta: "2025 / Commission / Agency", title: "MYB Agency", url: "https://www.mind-yb.com/" },
  {
    meta: "2024 / Personal / Agency",
    title: "SkyWeb Media",
    url: "https://sky-web-media.vercel.app/",
  },
  {
    meta: "2023 / Personal / Restaurant",
    title: "Temple Tacos",
    url: "https://temple-tacos.vercel.app/",
  },
  {
    meta: "2023 / Commission / School",
    title: "ENK School",
    url: "https://enk-school.vercel.app/",
  },
] as const;
