export default function Hero({ active }) { // Renamed from Home to Hero for clarity
  if (active !== "home") return null // ADD CONDITIONAL RENDERING

  const lines = [
    "Born in 2003",
    "in Skikda, Algeria",
    "i believe",
    "coding is",
    "also an art.",
    "In a mission",
    "to do experiments",
    "and Learn all kinds",
    "of coding",
    "& programming",
    "and Find",
    "creative individuals",
    "to work with",
    "on future projects.",
  ]

  return (
    <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] font-normal space-y-0.5 sm:space-y-1">
      {lines.map((l, index) => (
        <p 
          key={l} 
          className="glitch-text text-[clamp(0.6rem,1vw,0.9rem)]"
          style={{ 
            animationDelay: `${index * 0.2}s`,
            lineHeight: '1.2'
          }}
        >
          {l}
        </p>
      ))}
    </div>
  )
}

