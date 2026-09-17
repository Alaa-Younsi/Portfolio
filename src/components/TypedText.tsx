import type { ElementType } from "react";
import type { TypedLine } from "@/hooks/useTypingSequence";

/** The blinking caret that trails a line still being typed. */
function Caret() {
  return (
    <span aria-hidden="true" className="ml-0.5 animate-blink font-thin">
      |
    </span>
  );
}

type TypedTextProps = {
  line: TypedLine;
  /** Element to render — headings keep their semantics, body copy stays a <p>. */
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Renders one line of the typing animation.
 *
 * Assistive tech gets the finished sentence in one piece instead of a stream of
 * half-words, so `aria-labelledby` on the surrounding section still resolves to
 * something readable.
 */
export function TypedText({ line, as: Tag = "span", className, id }: TypedTextProps) {
  if (!line.text) return null;

  return (
    <Tag className={className} id={id}>
      <span aria-hidden="true">
        {line.text}
        {!line.done && <Caret />}
      </span>
      <span className="sr-only">{line.full}</span>
    </Tag>
  );
}

type TypedLinkProps = {
  line: TypedLine;
  href: string;
  /** Full description of the destination — becomes the accessible name. */
  description: string;
  className?: string;
};

export function TypedLink({ line, href, description, className }: TypedLinkProps) {
  if (!line.text) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={description}
      className={className}
    >
      {line.text}
      {!line.done && <Caret />}
    </a>
  );
}
