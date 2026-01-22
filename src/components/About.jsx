export default function Info({ active }) {
  if (active !== "info") return null

  return (
    <>
      <div className="absolute top-[var(--section-top)] left-1/2 -translate-x-1/2 w-[min(90vw,40rem)] text-[var(--fg)] text-center">
        <p className="text-[clamp(0.7rem,1vw,0.9rem)] font-normal opacity-80">■ Things that i can do</p>

        <p className="mt-4 text-[clamp(0.9rem,1.25vw,1.05rem)] leading-relaxed">
          I can do website development and design, including server side services.
        </p>

        <div className="mt-6 sm:mt-8 text-left max-w-xs sm:max-w-sm mx-auto">
          <p className="text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80">● Front-end skillset</p>
          <p className="text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1">HTML, CSS, JS, React, Tailwind</p>

          <p className="text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80">● Back-end skillset</p>
          <p className="text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1">Python, PHP, NodeJS, Firebase</p>
        </div>
      </div>

      <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] space-y-2 text-right">
        <a href="https://www.instagram.com/syrexl7/" target="_blank" 
           className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity">
          Instagram↗
        </a>
        <a href="https://x.com/syrexl7" target="_blank" 
           className="block text-xs sm:text-sm hover:opacity-50 transition-opacity">
          Twitter↗
        </a>
      </div>
    </>
  )
}