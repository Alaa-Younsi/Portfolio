import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useScramble } from "@/hooks/useScramble";

/** Total curtain time; the fade-out is baked into `animate-splashOut`. */
const SPLASH_MS = 2200;

type SplashScreenProps = {
  /** Fires once the curtain has lifted, so the page can start typing. */
  onDone: () => void;
};

/**
 * Intro curtain: the name decodes out of noise, the word PORTFOLIO surfaces
 * beneath it, and a single hairline charges across — then the curtain fades
 * and the frame draws itself in behind it.
 */
export function SplashScreen({ onDone }: SplashScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const { display } = useScramble(site.name, { duration: 900, autoplay: !reducedMotion });

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      onDoneRef.current();
      return;
    }
    const id = setTimeout(() => {
      setVisible(false);
      onDoneRef.current();
    }, SPLASH_MS);
    return () => clearTimeout(id);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex animate-splashOut items-center justify-center bg-bg"
    >
      <div className="text-center">
        <p className="font-display text-[clamp(1.6rem,5vw,3.2rem)] font-bold tracking-tight text-fg">
          <span aria-hidden="true">{display || " "}</span>
          <span className="sr-only">{site.name}</span>
        </p>
        <p
          className="mt-3 animate-summon text-[0.65rem] uppercase tracking-[0.5em] text-fg opacity-70 [animation-delay:350ms] sm:text-xs"
          aria-hidden="true"
        >
          Portfolio
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-7 h-px w-[min(60vw,18rem)] overflow-hidden bg-fg/15"
        >
          <div className="h-full origin-left animate-splashLine bg-fg" />
        </div>
      </div>
    </div>
  );
}
