import { projectsHeading } from "@/data/content";
import { projects } from "@/data/projects";
import { useTypingSequence } from "@/hooks/useTypingSequence";
import { TypedText } from "./TypedText";

/** Flat typing order: heading, then each project's meta line + title. */
const SEQUENCE = [projectsHeading, ...projects.flatMap((project) => [project.meta, project.title])];

const LIST_MAX_HEIGHT =
  "max-h-[calc(100dvh-var(--section-top)-var(--frame-y)-3rem)] sm:max-h-[calc(100dvh-var(--section-top)-var(--frame-y)-4rem)]";

type ProjectsProps = { active: boolean };

export function Projects({ active }: ProjectsProps) {
  const typed = useTypingSequence(SEQUENCE, active);

  if (!active) return null;

  const heading = typed[0];
  if (!heading) return null;

  return (
    <section
      aria-labelledby="projects-heading"
      className="absolute right-content-x top-section-top z-30 max-w-[min(90vw,40rem)] overflow-hidden text-right text-fg [max-height:calc(100dvh-var(--section-top)-var(--frame-y))] [touch-action:pan-y]"
    >
      <TypedText
        as="h2"
        id="projects-heading"
        line={heading}
        className="glitch mb-4 text-xs opacity-80 sm:mb-6 sm:text-sm"
      />

      {typed[1] && (
        <ul
          className={`${LIST_MAX_HEIGHT} scrollbar-hide overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] [touch-action:pan-y] [will-change:scroll-position]`}
        >
          {projects.map((project, index) => {
            const meta = typed[1 + index * 2];
            const title = typed[2 + index * 2];
            if (!meta) return null;

            return (
              <li key={project.url} className={index === projects.length - 1 ? "" : "mb-6 sm:mb-8"}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit the ${project.title} project (opens in a new tab)`}
                  className="block transition-opacity duration-200 hover:opacity-50"
                >
                  <TypedText
                    as="p"
                    line={meta}
                    className="glitch mb-1 text-xs font-normal sm:text-sm"
                  />
                  {title && (
                    <TypedText
                      as="p"
                      line={title}
                      className="glitch whitespace-nowrap text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
