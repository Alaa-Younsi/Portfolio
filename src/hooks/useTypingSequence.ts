import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export type TypedLine = {
  /** Characters revealed so far. */
  readonly text: string;
  /** The complete string — exposed for screen readers and cursor logic. */
  readonly full: string;
  readonly done: boolean;
};

const CHAR_MS = 25;
const LINE_PAUSE_MS = 100;

type Cursor = { line: number; chars: number };
const START: Cursor = { line: 0, chars: 0 };

/**
 * Types an array of strings one character at a time, moving to the next string
 * once the current one is complete.
 *
 * State is a single `{ line, chars }` cursor rather than an array of partial
 * strings, so a keystroke costs one integer bump instead of copying the whole
 * array. Visitors who prefer reduced motion get the finished text immediately.
 */
export function useTypingSequence(
  strings: readonly string[],
  active: boolean,
  speed: number = CHAR_MS,
): readonly TypedLine[] {
  const reducedMotion = usePrefersReducedMotion();
  const stringsRef = useRef(strings);
  const [cursor, setCursor] = useState<Cursor>(START);

  useEffect(() => {
    stringsRef.current = strings;
  }, [strings]);

  useEffect(() => {
    if (!active) setCursor(START);
  }, [active]);

  useEffect(() => {
    if (!active || reducedMotion) return;

    const lines = stringsRef.current;
    const target = lines[cursor.line];
    if (target === undefined) return;

    if (cursor.chars < target.length) {
      const id = setTimeout(() => setCursor((c) => ({ line: c.line, chars: c.chars + 1 })), speed);
      return () => clearTimeout(id);
    }

    if (cursor.line < lines.length - 1) {
      const id = setTimeout(
        () => setCursor((c) => ({ line: c.line + 1, chars: 0 })),
        LINE_PAUSE_MS,
      );
      return () => clearTimeout(id);
    }

    return;
  }, [active, cursor, speed, reducedMotion]);

  return useMemo<readonly TypedLine[]>(
    () =>
      strings.map((full, index) => {
        if (!active) return { text: "", full, done: false };
        if (reducedMotion || index < cursor.line) return { text: full, full, done: true };
        if (index > cursor.line) return { text: "", full, done: false };
        const text = full.slice(0, cursor.chars);
        return { text, full, done: text.length === full.length };
      }),
    [strings, active, cursor, reducedMotion],
  );
}
