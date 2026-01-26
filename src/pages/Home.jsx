import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import SplashScreen from "../components/SplashScreen"; // Or rename to SplashScreen
import Background from "../components/Background"; // ADD THIS IMPORT

export default function HomePage() {
  const [active, setActive] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [homeClickCount, setHomeClickCount] = useState(0);
  const [projectsClickCount, setProjectsClickCount] = useState(0);
  const [aboutClickCount, setAboutClickCount] = useState(0);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    if (active === "home" && prevActiveRef.current !== "home") {
      setHomeClickCount(prev => prev + 1);
    }
    if (active === "projects" && prevActiveRef.current !== "projects") {
      setProjectsClickCount(prev => prev + 1);
    }
    if (active === "info" && prevActiveRef.current !== "info") {
      setAboutClickCount(prev => prev + 1);
    }
    prevActiveRef.current = active;
  }, [active]);

  const themeVars = {
    "--bg": isDarkMode ? "#000" : "#fff",
    "--fg": isDarkMode ? "#fff" : "#000",
    "--border": isDarkMode ? "#fff" : "#000",
    "--frame-x": "clamp(12px, 2.5vw, 32px)",
    "--frame-y": "clamp(16px, 5vh, 48px)",
    "--content-x": "calc(var(--frame-x) + clamp(10px, 1.5vw, 20px))",
    "--content-y": "calc(var(--frame-y) + clamp(10px, 1.5vw, 20px))",
    "--section-top": "calc(var(--content-y) + clamp(56px, 10vh, 140px))",
  };

  return (
    <div style={themeVars} className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background stars inside frame */}
      <Background isDarkMode={isDarkMode} />
      
      {/* Splash screen */}
      <SplashScreen />

      <button
        type="button"
        onClick={() => setIsDarkMode((v) => !v)}
        className="fixed right-[var(--content-x)] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto top-[var(--content-y)] z-20 border border-[var(--border)] text-[var(--fg)] px-2 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-normal tracking-wide"
      >
        {isDarkMode ? "Dark" : "Light"}
      </button>
      
      {/* UI Components */}
      <Header active={active} setActive={setActive} />
      <Hero key={homeClickCount} active={active} />
      <About key={aboutClickCount} active={active} />
      <Skills active={active} />
      <Projects key={projectsClickCount} active={active} />
      <Contact active={active} />
    </div>
  );
}
