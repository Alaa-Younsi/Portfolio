import { SECTION_LABELS, SECTIONS, type Section, site } from "@/config/site";

type HeaderProps = {
  active: Section;
  onNavigate: (section: Section) => void;
};

export function Header({ active, onNavigate }: HeaderProps) {
  return (
    <header className="fixed left-content-x top-content-y z-40 text-left text-fg">
      <h1 className="animate-summon font-display text-[clamp(1.6rem,3.6vw,3.25rem)] font-bold tracking-[-0.03em]">
        <span className="glitch" data-text={site.name}>
          {site.name}
        </span>
      </h1>
      <p className="mt-1 animate-summon text-[clamp(0.65rem,1.2vw,0.95rem)] opacity-80 [animation-delay:120ms]">
        {site.tagline}
      </p>

      <nav
        aria-label="Main navigation"
        className="mt-6 space-y-1 text-left sm:mt-8 sm:space-y-2 lg:mt-10"
      >
        {SECTIONS.map((section, index) => {
          const isActive = active === section;
          const label = SECTION_LABELS[section];
          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              aria-label={`Navigate to ${label}`}
              aria-current={isActive ? "page" : undefined}
              className="block animate-summon text-left text-[clamp(0.7rem,1vw,1rem)] font-normal text-fg transition-opacity duration-200 hover:opacity-60"
              style={{ animationDelay: `${220 + index * 70}ms` }}
            >
              <span aria-hidden="true" className="glitch" data-text={isActive ? "\u25cf" : label}>
                {isActive ? "\u25cf" : label}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
