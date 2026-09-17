import { useEffect } from "react";

/** Keeps `document.title` in sync with the visible section. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    if (document.title !== title) document.title = title;
  }, [title]);
}
