export default function Header({ active, setActive }) {
  const btn = (id, label) => (
    <button
      onClick={() => setActive(id)}
      className="block text-[var(--fg)] font-normal hover:opacity-50 transition-opacity text-[clamp(0.7rem,1vw,1rem)]"
    >
      {active === id ? "●" : label}
    </button>
  )

  return (
    <div className="fixed left-[var(--content-x)] top-[var(--content-y)] text-[var(--fg)] z-10">
      <p className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold tracking-tight">Alaa Younsi</p>
      <p className="text-[clamp(0.65rem,1.2vw,0.95rem)] mt-1 opacity-80">Developer & Designer</p>

      <div className="mt-6 sm:mt-8 lg:mt-10 space-y-1 sm:space-y-2">
        {btn("home", "Home")}
        {btn("projects", "Projects")}
        {btn("info", "Info")}
        {btn("contact", "Contact")}
      </div>
    </div>
  )
}