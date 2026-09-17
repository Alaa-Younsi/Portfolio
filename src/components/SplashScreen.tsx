import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const SPLASH_MS = 2500;

/** Intro curtain: the name fades out slightly before the word "Portfolio". */
export function SplashScreen() {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => setVisible(false), SPLASH_MS);
    return () => clearTimeout(id);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-bg"
    >
      <p className="text-2xl font-bold text-fg">
        <span className="animate-fadeOut">{site.name}</span>{" "}
        <span className="animate-fadeOutSlow">Portfolio</span>
      </p>
    </div>
  );
}
