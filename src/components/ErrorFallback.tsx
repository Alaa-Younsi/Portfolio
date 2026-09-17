import type { FallbackProps } from "react-error-boundary";
import { socials } from "@/config/site";

/**
 * Last line of defence. A canvas failure should degrade to a readable page,
 * never to an empty black void.
 */
export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg"
    >
      <p className="text-[clamp(1.25rem,4vw,2rem)] font-bold tracking-tight">
        Singularity reached.
      </p>
      <p className="max-w-sm text-[clamp(0.75rem,1.2vw,0.95rem)] opacity-80">
        Something collapsed while rendering this page.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="border border-line px-3 py-1 text-xs transition-opacity duration-200 hover:opacity-50"
        >
          Reload
        </button>
        <a
          href={socials.linktree}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline transition-opacity duration-200 hover:opacity-50"
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}
