import { useState, useEffect } from 'react'

export default function Contact({ active }) {
  const [githubText, setGithubText] = useState('')
  const [leetcodeText, setLeetcodeText] = useState('')
  const [contactText, setContactText] = useState('')

  const githubString = 'Instagram↗'
  const leetcodeString = 'X↗'
  const contactString = 'Contact↗'

  useEffect(() => {
    if (active !== "contact") return

    // Type Github first
    if (githubText.length < githubString.length) {
      const timer = setTimeout(() => {
        setGithubText(githubString.slice(0, githubText.length + 1))
      }, 25)
      return () => clearTimeout(timer)
    }

    // Then Leetcode
    if (leetcodeText.length < leetcodeString.length) {
      const timer = setTimeout(() => {
        setLeetcodeText(leetcodeString.slice(0, leetcodeText.length + 1))
      }, 25)
      return () => clearTimeout(timer)
    }

    // Then Contact
    if (contactText.length < contactString.length) {
      const timer = setTimeout(() => {
        setContactText(contactString.slice(0, contactText.length + 1))
      }, 25)
      return () => clearTimeout(timer)
    }
  }, [active, githubText, leetcodeText, contactText])

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
          {githubText.length < githubString.length && <span className="cursor-blink">|</span>}
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
          {leetcodeText.length < leetcodeString.length && <span className="cursor-blink">|</span>}
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
          {contactText.length < contactString.length && <span className="cursor-blink">|</span>}
        </a>
      )}
    </div>
  )
}

