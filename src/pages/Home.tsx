import { useCallback, useEffect, useState } from "react";
import { About } from "@/components/About";
import { BlackHole } from "@/components/BlackHole";
import { Chronicle } from "@/components/Chronicle";
import { Contact } from "@/components/Contact";
import { Frame } from "@/components/Frame";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { SplashScreen } from "@/components/SplashScreen";
import { StarField } from "@/components/StarField";
import { SECTION_TITLES, type Section } from "@/config/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGlitchBursts } from "@/hooks/useGlitchBursts";

/** Matches the collapse animation in `src/lib/blackhole-gl.ts`. */
const COLLAPSE_MS = 1100;
/** Matches the `duration-[400ms]` fade on the UI layer. */
const RESTORE_MS = 300;

/**
 * idle → collapsing → collapsed → restoring → idle.
 * Modelling it as one value keeps the two timers from fighting each other.
 */
type Phase = "idle" | "collapsing" | "collapsed" | "restoring";

export function Home() {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Section>("home");
  const [visit, setVisit] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  const collapsed = phase !== "idle";
  useDocumentTitle(SECTION_TITLES[active]);
  useGlitchBursts(ready && !collapsed);

  useEffect(() => {
    if (phase === "collapsing") {
      const id = setTimeout(() => setPhase("collapsed"), COLLAPSE_MS);
      return () => clearTimeout(id);
    }
    if (phase === "restoring") {
      const id = setTimeout(() => setPhase("idle"), RESTORE_MS);
      return () => clearTimeout(id);
    }
    return;
  }, [phase]);

  const navigate = useCallback((section: Section) => {
    setActive(section);
    // Bumping the key remounts the section so its typing animation replays.
    setVisit((value) => value + 1);
  }, []);

  const onSplashDone = useCallback(() => setReady(true), []);

  return (
    <main className="h-full overflow-hidden bg-bg text-fg">
      <StarField fullScreen={collapsed} />
      {ready && <Frame hidden={collapsed} />}
      <SplashScreen onDone={onSplashDone} />

      {(phase === "collapsed" || phase === "restoring") && (
        <Chronicle leaving={phase === "restoring"} />
      )}

      {phase === "collapsed" && (
        <button
          type="button"
          onClick={() => setPhase("restoring")}
          aria-label="Restore the portfolio"
          className="fixed right-content-x top-content-y z-20 animate-fadeIn border border-line px-2 py-0.5 text-[0.65rem] font-normal tracking-wide text-fg transition-opacity duration-200 hover:opacity-60 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:px-3 sm:py-1 sm:text-xs"
        >
          <span className="glitch" data-text="Home">
            Home
          </span>
        </button>
      )}

      {ready && (
        <div
          className={`transition-opacity duration-[400ms] ${
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <Header active={active} onNavigate={navigate} />
          <Hero key={`hero-${visit}`} active={active === "home"} />
          <About key={`about-${visit}`} active={active === "info"} />
          <Projects key={`projects-${visit}`} active={active === "projects"} />
          <Contact key={`contact-${visit}`} active={active === "contact"} />
        </div>
      )}

      {active === "home" && phase !== "collapsed" && (
        <BlackHole exploding={phase === "collapsing"} onExplode={() => setPhase("collapsing")} />
      )}
    </main>
  );
}
