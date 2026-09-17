import { heroLines, heroLinks } from "@/data/content";
import { useTypingSequence } from "@/hooks/useTypingSequence";
import { TypedLink, TypedText } from "./TypedText";

const LINK_LABELS = heroLinks.map((link) => link.label);

type HeroProps = { active: boolean };

export function Hero({ active }: HeroProps) {
  const bio = useTypingSequence(heroLines, active);
  const links = useTypingSequence(LINK_LABELS, active);

  if (!active) return null;

  return (
    <>
      <div className="absolute bottom-content-y right-content-x space-y-0.5 font-normal text-fg sm:space-y-1">
        {bio.map((line) => (
          <TypedText
            key={line.full}
            as="p"
            line={line}
            className="text-[0.72rem] leading-[1.25] sm:text-[clamp(0.6rem,1vw,0.9rem)] sm:leading-[1.2]"
          />
        ))}
      </div>

      <div className="absolute bottom-content-y left-content-x animate-fadeIn space-y-1 text-fg sm:space-y-2">
        {heroLinks.map((link, index) => {
          const line = links[index];
          if (!line) return null;
          return (
            <TypedLink
              key={link.href}
              line={line}
              href={link.href}
              description={link.description}
              className="block py-1 text-[0.85rem] transition-opacity duration-200 hover:opacity-50 sm:py-0 sm:text-[clamp(0.7rem,1vw,0.9rem)]"
            />
          );
        })}
      </div>
    </>
  );
}
