import { useTypingSequence } from '../hooks/useTypingSequence'

const STRINGS = [
  '\u25a0 Things that i can do',
  'I can do all sorts of digital services.',
  '\u25cf Software Engineering & AI Systems',
  'Full-stack web development, AI SaaS agents, automation, Linux, networking, and security.',
  '\u25cf Design, Content & Growth',
  'UI/UX design, visual content creation, and performance-driven digital marketing for products and brands.',
  'GitHub\u2197',
  'LeetCode\u2197',
]

export default function Info({ active }) {
  const typed = useTypingSequence(STRINGS, active === 'info')

  if (active !== 'info') return null

  const [titleText, descText, frontEndLabel, frontEndSkills, backEndLabel, backEndSkills, link1Text, link2Text] = typed

  return (
    <>
      <section aria-labelledby="about-heading" className="absolute top-[60%] sm:top-[var(--section-top)] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 w-[min(90vw,40rem)] text-[var(--fg)] text-center">
        {titleText && (
          <h2 id="about-heading" className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal opacity-80 glitch-text" data-text={titleText}>
            {titleText}
            {titleText.length < STRINGS[0].length && <span className="cursor-blink">|</span>}
          </h2>
        )}

        {descText && (
          <p className="mt-4 text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] leading-relaxed glitch-text" data-text={descText}>
            {descText}
            {descText.length < STRINGS[1].length && <span className="cursor-blink">|</span>}
          </p>
        )}

        {frontEndLabel && (
          <div className="mt-6 sm:mt-8 text-left max-w-xs sm:max-w-sm mx-auto">
            <p className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80 glitch-text" data-text={frontEndLabel}>
              {frontEndLabel}
              {frontEndLabel.length < STRINGS[2].length && <span className="cursor-blink">|</span>}
            </p>
            {frontEndSkills && (
              <p className="text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1 glitch-text" data-text={frontEndSkills}>
                {frontEndSkills}
                {frontEndSkills.length < STRINGS[3].length && <span className="cursor-blink">|</span>}
              </p>
            )}

            {backEndLabel && (
              <>
                <p className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80 glitch-text" data-text={backEndLabel}>
                  {backEndLabel}
                  {backEndLabel.length < STRINGS[4].length && <span className="cursor-blink">|</span>}
                </p>
                {backEndSkills && (
                  <p className="text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1 glitch-text" data-text={backEndSkills}>
                    {backEndSkills}
                    {backEndSkills.length < STRINGS[5].length && <span className="cursor-blink">|</span>}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {link1Text && (
        <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] space-y-2 text-right">
          <a href="https://github.com/Alaa-Younsi" target="_blank" rel="noopener noreferrer"
             aria-label="Visit GitHub profile (opens in new tab)"
             className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity duration-200 glitch-text" data-text={link1Text}>
            {link1Text}
            {link1Text.length < STRINGS[6].length && <span className="cursor-blink">|</span>}
          </a>
          {link2Text && (
            <a href="https://leetcode.com/u/alaa-younsi/" target="_blank" rel="noopener noreferrer"
               aria-label="Visit Twitter profile (opens in new tab)"
               className="block text-xs sm:text-sm hover:opacity-50 transition-opacity duration-200 glitch-text" data-text={link2Text}>
              {link2Text}
              {link2Text.length < STRINGS[7].length && <span className="cursor-blink">|</span>}
            </a>
          )}
        </div>
      )}
    </>
  )
}

