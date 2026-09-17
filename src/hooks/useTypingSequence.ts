import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export type TypedLine = {
  /** Characters revealed so far. */
  readonly text: string;
  /** The complete string — exposed for screen readers and cursor logic. */
  readonly full: string;
  readonly done: boolean;
  /** One or two glyphs of noise ahead of the caret while the line is typing. */
  readonly scramble: string;
};

const CHAR_MS = 24;
const LINE_PAUSE_MS = 90;
/** A human doesn't type at a metronome: ±40% jitter per keystroke. */
const JITTER = 0.4;
const PAUSE_AFTER: Readonly<Record<string, number>> = {
  ",": 110,
  ";": 110,
  ":": 110,
  ".": 190,
  "!": 190,
  "?": 190,
  "&": 60,
};
const NOISE = "!<>-_\\/[]{}=+*^?#%01";

type Cursor = { line: number; chars: number; seed: number };
const START: Cursor = { line: 0, chars: 0, seed: 1 };

/** Tiny deterministic PRNG so noise is stable per render and never touches Math.random in render. */
function noiseFor(seed: number, length: number): string {
  let s = seed >>> 0 || 1;
  let out = "";
  for (let i = 0; i < length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out += NOISE[s % NOISE.length];
  }
  return out;
}

function delayFor(target: string, index: number, seed: number): number {
  const jitter = 1 + ((seed % 1000) / 1000 - 0.5) * 2 * JITTER;
  const previous = target[index - 1];
  const pause = previous ? (PAUSE_AFTER[previous] ?? 0) : 0;
  return CHAR_MS * jitter + pause;
}

/**
 * Types an array of strings one character at a time, moving to the next string
 * once the current one is complete.
 *
 * State is a single `{ line, chars }` cursor rather than an array of partial
 * strings, so a keystroke costs one integer bump instead of copying the whole
 * array. Keystrokes are jittered and pause after punctuation, and a couple of
 * glyphs of noise run ahead of the caret — the text is decoded, not printed.
 * Visitors who prefer reduced motion get the finished text immediately.
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
      const ms = delayFor(target, cursor.chars, cursor.seed) * (speed / CHAR_MS);
      const id = setTimeout(
        () =>
          setCursor((c) => ({
            line: c.line,
            chars: c.chars + 1,
            seed: (c.seed * 1664525 + 1013904223) >>> 0,
          })),
        ms,
      );
      return () => clearTimeout(id);
    }

    if (cursor.line < lines.length - 1) {
      const id = setTimeout(
        () =>
          setCursor((c) => ({
            line: c.line + 1,
            chars: 0,
            seed: (c.seed * 22695477 + 1) >>> 0,
          })),
        LINE_PAUSE_MS,
      );
      return () => clearTimeout(id);
    }

    return;
  }, [active, cursor, speed, reducedMotion]);

  return useMemo<readonly TypedLine[]>(
    () =>
      strings.map((full, index) => {
        if (!active) return { text: "", full, done: false, scramble: "" };
        if (reducedMotion || index < cursor.line) {
          return { text: full, full, done: true, scramble: "" };
        }
        if (index > cursor.line) return { text: "", full, done: false, scramble: "" };

        const text = full.slice(0, cursor.chars);
        const done = text.length === full.length;
        const remaining = full.length - text.length;
        const scramble = done ? "" : noiseFor(cursor.seed, Math.min(2, remaining));
        return { text, full, done, scramble };
      }),
    [strings, active, cursor, reducedMotion],
  );
}
