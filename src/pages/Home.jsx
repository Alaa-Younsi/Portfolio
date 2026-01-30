import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import SplashScreen from "../components/SplashScreen";
import Background from "../components/Background";
import BlackHole from "../components/BlackHole";

export default function HomePage() {
  const [active, setActive] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [homeClickCount, setHomeClickCount] = useState(0);
  const [projectsClickCount, setProjectsClickCount] = useState(0);
  const [aboutClickCount, setAboutClickCount] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showHomeButton, setShowHomeButton] = useState(false);

  const handleNavigation = (section) => {
    setActive(section);
    
    // Increment counters when navigating to specific sections
    if (section === "home") {
      setHomeClickCount(prev => prev + 1);
    } else if (section === "projects") {
      setProjectsClickCount(prev => prev + 1);
    } else if (section === "info") {
      setAboutClickCount(prev => prev + 1);
    }
  };

  const handleBlackHoleExplode = () => {
    // Start glitch effect immediately
    setIsGlitching(true);
    
    // After glitch animation (300ms * 3 iterations = 900ms), hide content
    setTimeout(() => {
      setIsExploding(true);
    }, 900);
    
    // Show home button after explosion animation completes (1000ms) + glitch (900ms) + delay
    setTimeout(() => {
      setShowHomeButton(true);
    }, 2100);
  };

  const handleRestore = () => {
    setShowHomeButton(false);
    setTimeout(() => {
      setIsExploding(false);
      setIsGlitching(false);
    }, 300); // Wait for fade out
  };

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
    <div 
      style={themeVars} 
      className="min-h-screen bg-[var(--bg)] text-[var(--fg)]"
      role="main"
    >
      <Helmet>
        <title>Alaa Younsi - Developer & Designer</title>
        <meta name="description" content="Alaa Younsi is a developer and designer specializing in website development, design, and server-side services. Explore creative projects and innovative digital solutions." />
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Alaa Younsi - Developer & Designer" />
        <meta property="og:description" content="Alaa Younsi is a developer and designer specializing in website development, design, and server-side services. Explore creative projects and innovative digital solutions." />
        <meta property="og:url" content="https://alaa-younsi.vercel.app" />
        <meta property="og:site_name" content="Alaa Younsi Portfolio" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alaa Younsi - Developer & Designer" />
        <meta name="twitter:description" content="Alaa Younsi is a developer and designer specializing in website development, design, and server-side services. Explore creative projects and innovative digital solutions." />
        <meta name="twitter:creator" content="@ashv3il" />
        
        {/* Additional meta tags */}
        <meta name="author" content="Alaa Younsi" />
        <meta name="keywords" content="developer, designer, web development, portfolio, Alaa Younsi, frontend, backend, React, JavaScript, Python, PHP, NodeJS" />
        <link rel="canonical" href="https://alaa-younsi.vercel.app" />
        
        {/* glitch CSS moved to src/index.css to ensure consistent production builds */}
      </Helmet>

      {/* Background stars inside frame */}
      <Background isDarkMode={isDarkMode} fullScreen={isExploding} />
      
      {/* Splash screen */}
      <SplashScreen />

      <button
        type="button"
        onClick={() => setIsDarkMode((v) => !v)}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        className={`fixed right-[var(--content-x)] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto top-[var(--content-y)] z-20 border border-[var(--border)] text-[var(--fg)] px-2 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-normal tracking-wide transition-opacity ${
          isExploding ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isGlitching ? 'glitch-effect' : ''}`}
      >
        {isDarkMode ? "Dark" : "Light"}
      </button>

      {/* Home restore button */}
      {showHomeButton && (
        <button
          type="button"
          onClick={handleRestore}
          aria-label="Restore home"
          className="fixed right-[var(--content-x)] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto top-[var(--content-y)] z-20 border border-[var(--border)] text-[var(--fg)] px-2 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-normal tracking-wide animate-[fadeIn_0.5s_ease-in-out]"
          style={{
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        >
          Home
        </button>
      )}
      
      {/* UI Components */}
      <div className={`transition-opacity duration-300 ${
        isExploding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isGlitching ? 'glitch-effect' : ''}`}>
        <Header active={active} setActive={handleNavigation} />
        {active === "home" && <Hero key={homeClickCount} active={active} />}
        {active === "info" && <About key={aboutClickCount} active={active} />}
        <Skills active={active} />
        {active === "projects" && <Projects key={projectsClickCount} active={active} />}
        {active === "contact" && <Contact active={active} />}
      </div>
      
      {active === "home" && <BlackHole active={active} onExplode={handleBlackHoleExplode} isExploding={isExploding} />}
    </div>
  );
}
