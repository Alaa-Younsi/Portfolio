export default function Header({ active, setActive }) {
  const btn = (id, label) => (
    <button
      onClick={() => setActive(id)}
      aria-label={`Navigate to ${label}`}
      aria-current={active === id ? "page" : undefined}
      className="block text-left text-[var(--fg)] font-normal hover:opacity-50 transition-opacity text-[clamp(0.7rem,1vw,1rem)]"
    >
      {active === id ? "●" : label}
    </button>
  )

  return (
    <header className="fixed left-[var(--content-x)] top-[var(--content-y)] text-[var(--fg)] z-10 text-left">
      <h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold tracking-tight">Alaa Younsi</h1>
      <p className="text-[clamp(0.65rem,1.2vw,0.95rem)] mt-1 opacity-80">Developer & Designer</p>

      <nav aria-label="Main navigation" className="mt-6 sm:mt-8 lg:mt-10 space-y-1 sm:space-y-2 text-left">
        {btn("home", "Home")}
        {btn("projects", "Projects")}
        {btn("info", "Info")}
        {btn("contact", "Contact")}
      </nav>
    </header>
  )
}