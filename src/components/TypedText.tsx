import type { ElementType } from "react";
import { useScramble } from "@/hooks/useScramble";
import type { TypedLine } from "@/hooks/useTypingSequence";

/** Terminal block caret that trails a line still being typed. */
function Caret() {
  return <span aria-hidden="true" className="caret" />;
}

type TypedTextProps = {
  line: TypedLine;
  /** Element to render — headings keep their semantics, body copy stays a <p>. */
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Renders one line of the typing animation. The line materialises (slide + blur
 * in) the moment its first noise glyph appears, then decodes character by
 * character behind the caret.
 *
 * Assistive tech gets the finished sentence in one piece instead of a stream of
 * half-words, so `aria-labelledby` on the surrounding section still resolves to
 * something readable.
 */
export function TypedText({ line, as: Tag = "span", className, id }: TypedTextProps) {
  if (!line.text && !line.scramble) return null;

  return (
    <Tag className={`animate-summon ${className ?? ""}`} id={id}>
      <span aria-hidden="true" className="glitch" data-text={line.text}>
        {line.text}
        {!line.done && <span className="scramble">{line.scramble}</span>}
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

/** A typed external link that re-decodes itself on hover. */
export function TypedLink({ line, href, description, className }: TypedLinkProps) {
  const { display, play } = useScramble(line.full, { duration: 480 });
  if (!line.text && !line.scramble) return null;

  const visible = line.done ? display : line.text;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={description}
      className={`animate-summon ${className ?? ""}`}
      onMouseEnter={line.done ? play : undefined}
      onFocus={line.done ? play : undefined}
    >
      <span aria-hidden="true" className="glitch" data-text={visible}>
        {visible}
        {!line.done && <span className="scramble">{line.scramble}</span>}
        {!line.done && <Caret />}
      </span>
      <span className="sr-only">{line.full}</span>
    </a>
  );
}
