import { type CSSProperties, useRef } from "react";
import { type ChronicleImage, chronicle } from "@/data/biography";
import { useReveal } from "@/hooks/useReveal";

/** Deterministic 0..1 from an index — layout must not change between renders. */
function unit(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Placement = CSSProperties & {
  "--w": string;
  "--overhang": string;
  "--tilt": string;
  "--drop": string;
};

/**
 * Scatter: each image gets a side, a width, how far it leans out of the text
 * column, a small tilt and a vertical drop — all derived from its index, so
 * the article looks hand-placed and never reflows differently.
 */
function placement(index: number): { side: "left" | "right"; style: Placement } {
  const side = unit(index, 1) < 0.5 ? "left" : "right";
  return {
    side,
    style: {
      "--w": `${Math.round(40 + unit(index, 2) * 18)}%`,
      "--overhang": `-${Math.round(6 + unit(index, 3) * 16)}%`,
      "--tilt": `${((unit(index, 4) - 0.5) * 4).toFixed(2)}deg`,
      "--drop": `${(unit(index, 5) * 2.5).toFixed(2)}em`,
    },
  };
}

function Figure({ image, index }: { image: ChronicleImage; index: number }) {
  const { side, style } = placement(index);
  const float =
    side === "left"
      ? "sm:float-left sm:mr-8 lg:[margin-left:var(--overhang)]"
      : "sm:float-right sm:ml-8 lg:[margin-right:var(--overhang)]";

  return (
    <figure
      data-reveal
      style={style}
      className={`my-8 w-full sm:my-4 sm:[width:var(--w)] sm:[margin-top:var(--drop)] sm:[transform:rotate(var(--tilt))] ${float}`}
    >
      <div className="border border-line/50 p-1">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full grayscale contrast-[1.05] transition-[filter] duration-500 hover:grayscale-0"
        />
      </div>
      <figcaption className="mt-2 text-2xs uppercase tracking-[0.2em] opacity-60">
        {image.caption}
      </figcaption>
    </figure>
  );
}

type ChronicleProps = {
  /** Fades the article out while the portfolio is being restored. */
  leaving: boolean;
};

/**
 * The content behind the black hole. A full-viewport scroll container with
 * no scrollbar and a fade mask at both ends, so paragraphs and images appear
 * out of nothing rather than sliding in from an edge.
 */
export function Chronicle({ leaving }: ChronicleProps) {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  // Interleave images after every second paragraph, in order.
  const images = [...chronicle.images];
  let paragraphIndex = 0;
  let imageIndex = 0;

  return (
    <section
      ref={rootRef}
      aria-label="About Alaa Younsi"
      className={`scrollbar-hide mask-fade-y fixed inset-0 z-10 animate-summonSlow overflow-y-auto overscroll-contain text-fg transition-opacity duration-300 [touch-action:pan-y] ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <article className="chronicle mx-auto w-[min(92vw,46rem)] pb-[42vh] pt-[30vh]">
        <header className="mb-12 sm:mb-16">
          <p className="text-2xs uppercase tracking-[0.35em] opacity-60 sm:text-xs">
            {chronicle.kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.6rem,1.2rem+2.6vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em]">
            {chronicle.title}
          </h1>
        </header>

        {chronicle.sections.map((section) => (
          <div key={section.heading ?? "intro"}>
            {section.heading && (
              <h2 data-reveal className="mb-6 mt-16 sm:mt-20">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph) => {
              const image = paragraphIndex % 2 === 1 ? images[imageIndex] : undefined;
              const figureIndex = imageIndex;
              if (image) imageIndex += 1;
              paragraphIndex += 1;
              return (
                <div key={paragraph.slice(0, 32)} className="mt-6 first:mt-0">
                  {image && <Figure image={image} index={figureIndex} />}
                  <p data-reveal>{paragraph}</p>
                </div>
              );
            })}
          </div>
        ))}

        {images.slice(imageIndex).map((image, offset) => (
          <Figure key={image.src} image={image} index={imageIndex + offset} />
        ))}
        <div className="clear-both" />
      </article>
    </section>
  );
}
