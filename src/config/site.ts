/**
 * Every piece of identity data lives here: the HTML head, the JSON-LD graph,
 * the sitemap and the UI all read from this one object.
 */
export const site = {
  name: "Alaa Younsi",
  tagline: "Problem Solving Enjoyer",
  role: "Developer & Designer",
  url: "https://alaa-younsi.vercel.app",
  locale: "en",
  twitterHandle: "@ashv3il",
  description:
    "Alaa Younsi is a developer and designer specializing in website development, design, and server-side services. Explore creative projects and innovative digital solutions.",
  jobTitle: "Full-Stack Developer & UI/UX Designer",
  birthPlace: "Skikda, Algeria",
} as const;

export const socials = {
  github: "https://github.com/Alaa-Younsi",
  leetcode: "https://leetcode.com/u/alaa-younsi/",
  instagram: "https://www.instagram.com/ashv3il/",
  x: "https://x.com/ashv3il",
  linktree: "https://linktr.ee/ashv3il",
} as const;

export const SECTIONS = ["home", "projects", "info", "contact"] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  home: "Home",
  projects: "Projects",
  info: "Info",
  contact: "Contact",
};

/** Per-section document titles — keeps deep links and browser history readable. */
export const SECTION_TITLES: Record<Section, string> = {
  home: `${site.name} — ${site.role}`,
  projects: `Projects — ${site.name}`,
  info: `Info — ${site.name}`,
  contact: `Contact — ${site.name}`,
};
