export default function Projects({ active }) {
  if (active !== "projects") return null

  return (
    <div className="absolute top-[var(--section-top)] right-[var(--content-x)] w-[min(90vw,40rem)] text-right text-[var(--fg)]">
      <p className="text-xs sm:text-sm mb-4 sm:mb-6 opacity-80">■ Development & Design Projects</p>

      <a href="https://alaa-younsi.github.io/WebSync-Media-1.0/" target="_blank"
         className="block hover:opacity-50 transition-opacity mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm font-normal mb-1">2023 / Commission / Agency</p>
        <p className="text-[clamp(1.75rem,5vw,3.5rem)] font-bold tracking-tight">WebSync Media</p>
      </a>

      <a href="https://alaa-younsi.github.io/Marlowe/" target="_blank"
         className="block hover:opacity-50 transition-opacity">
        <p className="text-xs sm:text-sm font-normal mb-1">2023 / Commission / Portfolio</p>
        <p className="text-[clamp(1.75rem,5vw,3.5rem)] font-bold tracking-tight">Marlowe</p>
      </a>
    </div>
  )
}