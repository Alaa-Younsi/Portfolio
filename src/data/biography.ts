/**
 * The long-form biography revealed after the black hole collapses.
 *
 * Plain strings on purpose: no markup to sanitise, nothing to escape. Edit the
 * words here and the article re-flows around whatever images are declared
 * below; their positions are derived from their index, not hand-placed.
 */

export type ChronicleImage = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  /** Intrinsic size, so the browser reserves the space before the file lands. */
  readonly width: number;
  readonly height: number;
};

export type ChronicleSection = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
};

export type Chronicle = {
  readonly kicker: string;
  readonly title: string;
  readonly sections: readonly ChronicleSection[];
  readonly images: readonly ChronicleImage[];
};

export const chronicle: Chronicle = {
  kicker: "Beyond the horizon",
  title: "A short biography, in fragments",
  sections: [
    {
      paragraphs: [
        "I was born in 2003 in Skikda, a port city on the Algerian coast, where the Mediterranean is never more than a few streets away. Somewhere between that sea and a keyboard I found the thing I wanted to spend my life on: making machines do exactly what I imagine, and then making that look effortless.",
        "This page is the part of the portfolio that the black hole was hiding. You just collapsed it. Everything below is what came out.",
      ],
    },
    {
      heading: "Coding is also an art",
      paragraphs: [
        "I have never believed that engineering and design live in separate rooms. A function can be elegant the way a sentence is elegant, and a layout can be wrong the way an algorithm is wrong. The best work I know of treats the two as one discipline, and that is the discipline I practise.",
        "It is why this portfolio is not a grid of cards. It is a frame, a field of stars that follows your pointer, and a black hole rendered from real orbital mechanics. I would rather show you how I think than list it.",
      ],
    },
    {
      heading: "What I do",
      paragraphs: [
        "Software engineering and AI systems: full-stack web development, AI agents and SaaS products, automation, Linux, networking, and security. I am at home from the first pixel to the last packet.",
        "Design, content and growth: UI/UX design, visual content creation, and performance-driven digital marketing for products and brands. Building something is half the job. Making sure it is seen and understood is the other half.",
        "Most of my work is commissioned, and delivered end to end: online shops for Northernwest, Auto Style, Laroche, Kindo and Jazym; company sites for Afia Export, Amana Partners, HIS & HVAC and Norlyn Coffee; a ceramic-surface store for Arcada; a parts and repair workshop for GSM Auto; a booking platform for a private driver in Paris. Each one is live, and each one taught me something the last one could not.",
      ],
    },
    {
      heading: "Experiments",
      paragraphs: [
        "Between commissions I run experiments. SingularityLab is where ideas go to be tested. Marlowe is a newspaper concept. DeadSide is where I write. CPlayground is a C compiler you can use from a browser tab, because I wanted one. None of them were assigned; all of them shipped.",
        "I keep a LeetCode habit for the same reason a musician keeps scales. Problem solving is not the thing I do for work; it is the thing I enjoy, and work is where it happens to be useful.",
      ],
    },
    {
      heading: "What comes next",
      paragraphs: [
        "I am looking for creative individuals to work with on future projects: people who care about the craft as much as the outcome, who want to build things that do not look like everything else.",
        "If that is you, the contact links are one click away. The black hole will still be here when you get back.",
      ],
    },
  ],
  images: [
    {
      src: "/images/arcada.webp",
      alt: "Homepage of the Arcada ceramic surfaces store",
      caption: "Arcada — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/northernwest.webp",
      alt: "Homepage of the Northernwest online shop",
      caption: "Northernwest — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/laroche.webp",
      alt: "Homepage of the Laroche Bijoux online shop",
      caption: "Laroche — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/amana-partners.webp",
      alt: "Homepage of the Amana Partners advisory website",
      caption: "Amana Partners — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/gsm-auto.webp",
      alt: "Homepage of the GSM Auto parts and repair workshop",
      caption: "GSM Auto — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/norlyn-coffee.webp",
      alt: "Homepage of the Norlyn Coffee website",
      caption: "Norlyn Coffee — commission",
      width: 960,
      height: 600,
    },
    {
      src: "/images/the-driver.webp",
      alt: "Homepage of The Driver, a private driver service in Paris",
      caption: "The Driver — commission",
      width: 960,
      height: 600,
    },
  ],
};
