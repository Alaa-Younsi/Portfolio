import { useCallback, useSyncExternalStore } from "react";

const EMPTY = () => () => {};

/**
 * Subscribes to a media query without the re-render churn of a `resize`
 * listener — the browser only notifies us when the query actually flips.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return EMPTY();
      }
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True when the visitor asked the OS to minimise motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Matches Tailwind's `sm` breakpoint so JS and CSS never disagree. */
export function useIsCompact(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
