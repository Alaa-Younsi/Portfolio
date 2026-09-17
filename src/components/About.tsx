import { about } from "@/data/content";
import { useTypingSequence } from "@/hooks/useTypingSequence";
import { TypedLink, TypedText } from "./TypedText";

/** Flat typing order: heading, intro, then each group's label + body, then links. */
const SEQUENCE = [
  about.heading,
  about.intro,
  ...about.groups.flatMap((group) => [group.label, group.body]),
  ...about.links.map((link) => link.label),
];

const GROUPS_OFFSET = 2;
const LINKS_OFFSET = GROUPS_OFFSET + about.groups.length * 2;

const LABEL_CLASS = "text-[0.72rem] font-normal opacity-80 sm:text-[clamp(0.7rem,1vw,0.9rem)]";
const BODY_CLASS = "mt-1 text-[0.85rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)]";

type AboutProps = { active: boolean };

export function About({ active }: AboutProps) {
  const typed = useTypingSequence(SEQUENCE, active);

  if (!active) return null;

  const heading = typed[0];
  const intro = typed[1];
  if (!heading) return null;

  return (
    <>
      <section
        aria-labelledby="about-heading"
        className="absolute left-1/2 top-[60%] w-[min(90vw,40rem)] -translate-x-1/2 -translate-y-1/2 text-center text-fg sm:top-section-top sm:translate-y-0"
      >
        <TypedText
          as="h2"
          id="about-heading"
          line={heading}
          className="text-[0.72rem] font-normal opacity-80 sm:text-[clamp(0.7rem,1vw,0.9rem)]"
        />

        {intro && (
          <TypedText
            as="p"
            line={intro}
            className="mt-4 text-[0.85rem] leading-relaxed sm:text-[clamp(0.9rem,1.25vw,1.05rem)]"
          />
        )}

        <div className="mx-auto mt-6 max-w-xs text-left sm:mt-8 sm:max-w-sm">
          {about.groups.map((group, index) => {
            const label = typed[GROUPS_OFFSET + index * 2];
            const body = typed[GROUPS_OFFSET + index * 2 + 1];
            if (!label) return null;
            return (
              <div key={group.label} className="mt-3 sm:mt-4">
                <TypedText as="p" line={label} className={LABEL_CLASS} />
                {body && <TypedText as="p" line={body} className={BODY_CLASS} />}
              </div>
            );
          })}
        </div>
      </section>

      <div className="absolute bottom-content-y right-content-x space-y-2 text-right text-fg">
        {about.links.map((link, index) => {
          const line = typed[LINKS_OFFSET + index];
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
