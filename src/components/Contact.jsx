import { useTypingSequence } from '../hooks/useTypingSequence'

const STRINGS = ['Instagram\u2197', 'X\u2197', 'Contact\u2197']

export default function Contact({ active }) {
  const [githubText, leetcodeText, contactText] = useTypingSequence(STRINGS, active === 'contact')

  if (active !== "contact") return null

  return (
    <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] space-y-2 text-right">
      {githubText && (
        <a
          href="https://www.instagram.com/ashv3il/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit GitHub profile (opens in new tab)"
          className="block text-[clamp(0.7rem,1vw,0.95rem)] font-normal hover:opacity-50 transition-opacity duration-200 z-20 glitch-text"
          data-text={githubText}
        >
          {githubText}
          {githubText.length < STRINGS[0].length && <span className="cursor-blink">|</span>}
        </a>
      )}
      {leetcodeText && (
        <a
          href="https://x.com/ashv3il"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit LeetCode profile (opens in new tab)"
          className="block text-[clamp(0.7rem,1vw,0.95rem)] font-normal hover:opacity-50 transition-opacity duration-200 z-20 glitch-text"
          data-text={leetcodeText}
        >
          {leetcodeText}
          {leetcodeText.length < STRINGS[1].length && <span className="cursor-blink">|</span>}
        </a>
      )}
      {contactText && (
        <a
          href="https://linktr.ee/ashv3il"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact via Linktree (opens in new tab)"
          className="block text-[clamp(0.7rem,1vw,0.95rem)] font-normal hover:opacity-50 transition-opacity duration-200 z-20 glitch-text"
          data-text={contactText}
        >
          {contactText}
          {contactText.length < STRINGS[2].length && <span className="cursor-blink">|</span>}
        </a>
      )}
    </div>
  )
}


