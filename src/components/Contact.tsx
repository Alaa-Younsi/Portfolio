import { contactLinks } from "@/data/content";
import { useTypingSequence } from "@/hooks/useTypingSequence";
import { TypedLink } from "./TypedText";

const LABELS = contactLinks.map((link) => link.label);

type ContactProps = { active: boolean };

export function Contact({ active }: ContactProps) {
  const typed = useTypingSequence(LABELS, active);

  if (!active) return null;

  return (
    <div className="absolute bottom-content-y right-content-x z-20 space-y-2 text-right text-fg">
      {contactLinks.map((link, index) => {
        const line = typed[index];
        if (!line) return null;
        return (
          <TypedLink
            key={link.href}
            line={line}
            href={link.href}
            description={link.description}
            className="block text-[clamp(0.7rem,1vw,0.95rem)] font-normal transition-opacity duration-200 hover:opacity-50"
          />
        );
      })}
    </div>
  );
}
