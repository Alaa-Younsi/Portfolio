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
  title: "Into the interstellar",
  sections: [
    {
      paragraphs: [
        "Congratulations, if your reading this, you have been curious, you have been intereseted in my work, you like space, problem solving and you suffer from insomnia and severe existential crises. we have a lot in common! :D",
        "Hi this is Alaa, I operate under the name ashv3il. I don't have a physical address, exactly — I have a series of connections, a network of servers, a collection of half-finished projects that probably run better than they have any right to. I was born in skikda town tho, a small town in the middle of nowhere, spent childhood there, in nature and beaches, felt isolated, felt beatiful.",
        "I supposedly always showed signs of mathematics and problem solving skills, until i became a wasted potential, or did i ? why would anyone do anything, it’s the same ending anyways, so whatever. well I guess success depends from one to another, but the important thing is to reach your limits, no matter the field.",
        "My work is a reflection of the things i wanted to achieve, and maybe i did, but it never really felt even close, just like everything in life - nothing is ever fullfilled.",
        "Days and days lost, days and days of existential crises, days of grey, isolation makes you notice everything, and self development makes you even more dissapointed in everything, how ironic.",
        "Is there really just a black & white ? right or wrong ? good or bad ? a yes or no ? 1 and 0 ? you might think, of course not, there are greys. things in the middle, mixtures. but that’s not true, beyond every decision, every action, everything, deep inside, there are only two options, black and white, it represents the irony & beauty of the universe, the perfect balance, but there are exceptions, one exception, chosen ones, there is red, the elite color, a specifinc humans, different than everyone else, the Elite. blessed supposedly but cursed with knowledge, can never fit in, can never belong anywhere, can’t really feel anything, everything becomes boring, everything becomes so basic, so usual, so human, feelings and sympathy becomes logical calculations, relationships with others become liabilities, leading to extreme isolation, and that causes the loss of point and motif. we know we aint superieur as humans, no one is above another, but we are playing another league. the real question is, are you an Elite ? or just happen to be similar. the difference is huge. regardless, do not be limited, do not be stupid, use your brain, think like your life depends on it, cause it does!",
      ],
    },
  ],
  images: [
    {
      src: "/bio-images/interstellar.webp",
      alt: "The Endurance docking above a frozen planet in Interstellar",
      caption: "Interstellar — 2014",
      width: 736,
      height: 414,
    },
    {
      src: "/bio-images/oppenheimer.webp",
      alt: "Cillian Murphy as J. Robert Oppenheimer outside a university building",
      caption: "Oppenheimer — 2023",
      width: 735,
      height: 414,
    },
    {
      src: "/bio-images/true-detective.webp",
      alt: "Rust Cohle standing in a field at dusk in True Detective",
      caption: "True Detective — 2014",
      width: 734,
      height: 412,
    },
    {
      src: "/bio-images/the-big-sleep.webp",
      alt: "Humphrey Bogart and Lauren Bacall seated side by side in The Big Sleep",
      caption: "The Big Sleep — 1946",
      width: 735,
      height: 585,
    },
    {
      src: "/bio-images/fight-club.webp",
      alt: "Tyler Durden in a red leather jacket, smoking against a dark wall in Fight Club",
      caption: "Fight Club — 1999",
      width: 736,
      height: 414,
    },
  ],
};
