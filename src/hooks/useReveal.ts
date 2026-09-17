import { type RefObject, useEffect } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

const ATTR = "data-reveal";
const CLASS = "is-revealed";

/**
 * Marks `[data-reveal]` descendants as revealed the first time they scroll into
 * the container — the CSS does the summoning. One observer for the whole
 * article; nothing runs per frame.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(`[${ATTR}]`);
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      for (const el of targets) el.classList.add(CLASS);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(CLASS);
          observer.unobserve(entry.target);
        }
      },
      { root, threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef, reducedMotion]);
}
