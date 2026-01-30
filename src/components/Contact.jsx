import { useState, useEffect } from 'react'

export default function Contact({ active }) {
  const [contactText, setContactText] = useState('')
  const contactString = 'Contact\u2197'

  useEffect(() => {
    if (active !== "contact") return

    if (contactText.length < contactString.length) {
      const timer = setTimeout(() => {
        setContactText(contactString.slice(0, contactText.length + 1))
      }, 25)
      return () => clearTimeout(timer)
    }
  }, [active, contactText])

  if (active !== "contact") return null

  return (
    <a
      href="https://linktr.ee/infinituxs"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact via Linktree (opens in new tab)"
      className="absolute right-[var(--content-x)] bottom-[var(--content-y)] text-[var(--fg)] font-normal hover:opacity-50 transition-opacity text-[clamp(0.7rem,1vw,0.95rem)] z-20"
    >
      {contactText || <span className="cursor-blink">|</span>}
      {contactText && contactText.length < contactString.length && <span className="cursor-blink">|</span>}
    </a>
  )
}

