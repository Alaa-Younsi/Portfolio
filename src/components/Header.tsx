import { SECTION_LABELS, SECTIONS, type Section, site } from "@/config/site";

type HeaderProps = {
  active: Section;
  onNavigate: (section: Section) => void;
};

export function Header({ active, onNavigate }: HeaderProps) {
  return (
    <header className="fixed left-content-x top-content-y z-40 text-left text-fg">
      <h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold tracking-tight">{site.name}</h1>
      <p className="mt-1 text-[clamp(0.65rem,1.2vw,0.95rem)] opacity-80">{site.tagline}</p>

      <nav
        aria-label="Main navigation"
        className="mt-6 space-y-1 text-left sm:mt-8 sm:space-y-2 lg:mt-10"
      >
        {SECTIONS.map((section) => {
          const isActive = active === section;
          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              aria-label={`Navigate to ${SECTION_LABELS[section]}`}
              aria-current={isActive ? "page" : undefined}
              className="block text-left text-[clamp(0.7rem,1vw,1rem)] font-normal text-fg transition-opacity duration-200 hover:opacity-50"
            >
              <span aria-hidden="true">{isActive ? "\u25cf" : SECTION_LABELS[section]}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
