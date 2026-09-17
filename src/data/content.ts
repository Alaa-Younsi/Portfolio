import { socials } from "@/config/site";

export type ExternalLink = {
  readonly label: string;
  readonly href: string;
  /** Announced by screen readers in place of the decorative arrow glyph. */
  readonly description: string;
};

/** Typed biography on the home screen — one array entry per rendered line. */
export const heroLines = [
  "Born in 2003",
  "in Skikda, Algeria",
  "i believe",
  "coding is",
  "also an art.",
  "In a mission",
  "to do experiments",
  "and learn all sorts",
  "of problem solving",
  "& programming",
  "and find",
  "creative individuals",
  "to work with",
  "on future projects.",
] as const;

export const heroLinks: readonly ExternalLink[] = [
  {
    label: "DeadSide\u2197",
    href: "https://deadside-blog.vercel.app/",
    description: "Visit DeadSide (opens in a new tab)",
  },
  {
    label: "SingularityLab\u2197",
    href: "https://singularity-lab-ruddy.vercel.app/",
    description: "Visit SingularityLab (opens in a new tab)",
  },
  {
    label: "Marlowe\u2197",
    href: "https://marlowe-newspapers.vercel.app/",
    description: "Visit Marlowe (opens in a new tab)",
  },
] as const;

export const about = {
  heading: "\u25a0 Things that i can do",
  intro: "I can do all sorts of digital services.",
  groups: [
    {
      label: "\u25cf Software Engineering & AI Systems",
      body: "Full-stack web development, AI SaaS agents, automation, Linux, networking, and security.",
    },
    {
      label: "\u25cf Design, Content & Growth",
      body: "UI/UX design, visual content creation, and performance-driven digital marketing for products and brands.",
    },
  ],
  links: [
    {
      label: "GitHub\u2197",
      href: socials.github,
      description: "Visit the GitHub profile of Alaa Younsi (opens in a new tab)",
    },
    {
      label: "LeetCode\u2197",
      href: socials.leetcode,
      description: "Visit the LeetCode profile of Alaa Younsi (opens in a new tab)",
    },
  ],
} as const satisfies {
  heading: string;
  intro: string;
  groups: readonly { label: string; body: string }[];
  links: readonly ExternalLink[];
};

export const contactLinks: readonly ExternalLink[] = [
  {
    label: "Instagram\u2197",
    href: socials.instagram,
    description: "Visit the Instagram profile of Alaa Younsi (opens in a new tab)",
  },
  {
    label: "X\u2197",
    href: socials.x,
    description: "Visit the X profile of Alaa Younsi (opens in a new tab)",
  },
  {
    label: "Contact\u2197",
    href: socials.linktree,
    description: "Contact Alaa Younsi via Linktree (opens in a new tab)",
  },
] as const;

export const projectsHeading = "\u25a0 Development & Design Projects";
