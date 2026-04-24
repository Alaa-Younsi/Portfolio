import { useTypingSequence } from '../hooks/useTypingSequence'

const PROJECTS = [
  { meta: '2026 / Comission / Online Shop', title: 'Northernwest',    url: 'https://northernwest20.vercel.app/',        label: 'Visit Northernwest project (opens in new tab)' },
  { meta: '2026 / Comission / Company',    title: 'Afia Export',      url: 'https://www.afiaexport.com/',              label: 'Visit Afia Export project (opens in new tab)' },
  { meta: '2026 / Comission / Online Store',  title: 'VintageDZ', url: 'https://vintagedz.vercel.app/',                label: 'Visit Vintagedz project (opens in new tab)' },
  { meta: '2026 / Comission / Platform',    title: 'Supremease',   url: 'https://supremease1-0.vercel.app/',           label: 'Visit Supremease project (opens in new tab)' },
  { meta: '2026 / Comission / Platform',       title: 'DentaBot',    url: 'https://denta-bot1-0.vercel.app/',          label: 'Visit DentaBot project (opens in new tab)' },
  { meta: '2026 / Personal / Playground', title: 'CPlayground',  url: 'https://c-playground-web-edition.vercel.app/',  label: 'Visit CPlayground project (opens in new tab)' },
  { meta: '2025 / Comission / Agency',        title: 'MYB Agency',  url: 'https://www.mind-yb.com/',                   label: 'Visit MYB Agency project (opens in new tab)' },
  { meta: '2024 / Personal / Agency',    title: 'SkyWeb Media',  url: 'https://sky-web-media.vercel.app/',             label: 'Visit SkyWeb Media project (opens in new tab)' },
  { meta: '2023 / Personal / Restaurant',       title: 'Temple Tacos',    url: 'https://temple-tacos.vercel.app/',     label: 'Visit Temple Tacos project (opens in new tab)' },
  { meta: '2023 / Comission / School',     title: 'ENK School',       url: 'https://enk-school.vercel.app/',           label: 'Visit ENK School project (opens in new tab)' },
]

const TITLE_STRING = '\u25a0 Development & Design Projects'
// Flat order: [title, p0.meta, p0.title, p1.meta, p1.title, ...]
const ALL_STRINGS = [TITLE_STRING, ...PROJECTS.flatMap(p => [p.meta, p.title])]

export default function Projects({ active }) {
  const typed = useTypingSequence(ALL_STRINGS, active === 'projects')

  if (active !== 'projects') return null

  return (
    <section
      aria-labelledby="projects-heading"
      className="absolute top-[var(--section-top)] right-[var(--content-x)] max-w-[min(90vw,40rem)] text-right text-[var(--fg)] z-30 overflow-hidden"
      style={{ maxHeight: 'calc(100dvh - var(--section-top) - var(--frame-y))', touchAction: 'pan-y' }}
    >
      {typed[0] && (
        <h2 id="projects-heading" className="text-xs sm:text-sm mb-4 sm:mb-6 opacity-80 glitch-text" data-text={typed[0]}>
          {typed[0]}
          {typed[0].length < TITLE_STRING.length && <span className="cursor-blink">|</span>}
        </h2>
      )}

      {typed[1] && (
        <div
          className="max-h-[calc(100dvh-var(--section-top)-var(--frame-y)-3rem)] sm:max-h-[calc(100dvh-var(--section-top)-var(--frame-y)-4rem)] overflow-y-auto scrollbar-hide overscroll-contain pr-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            willChange: 'scroll-position',
          }}
        >
          {PROJECTS.map((project, i) => {
            const metaIdx  = 1 + i * 2
            const titleIdx = 2 + i * 2
            const metaText  = typed[metaIdx]
            const titleText = typed[titleIdx]

            if (!metaText) return null

            const isLast = i === PROJECTS.length - 1
            return (
              <a
                key={project.url}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={project.label}
                className={`block hover:opacity-50 transition-opacity duration-200${isLast ? '' : ' mb-6 sm:mb-8'}`}
              >
                <p className="text-xs sm:text-sm font-normal mb-1 glitch-text" data-text={metaText}>
                  {metaText}
                  {metaText.length < project.meta.length && <span className="cursor-blink">|</span>}
                </p>
                {titleText && (
                  <p className="text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight glitch-text whitespace-nowrap" data-text={titleText}>
                    {titleText}
                    {titleText.length < project.title.length && <span className="cursor-blink">|</span>}
                  </p>
                )}
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}

