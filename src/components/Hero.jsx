import { useState, useEffect, useMemo } from 'react'
import { useTypingSequence } from '../hooks/useTypingSequence'

const LINK_STRINGS = ['DeadSide\u2197', 'SingularityLab\u2197', 'Marlowe\u2197']

export default function Hero({ active }) { // Renamed from Home to Hero for clarity
  const lines = useMemo(() => [
    "Born in 2003",
    "in Skikda, Algeria",
    "i believe",
    "coding is",
    "also an art.",
    "In a mission",
    "to do experiments",
    "and learn all sorts",
    "of problem solving",
    "& programming",
    "and find",
    "creative individuals",
    "to work with",
    "on future projects.",
  ], [])

  const [typedLines, setTypedLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const showLinks = true // Show immediately

  const [link1Text, link2Text, link3Text] = useTypingSequence(LINK_STRINGS, true)

  useEffect(() => {
    if (active !== "home") return
    if (currentLineIndex >= lines.length) return

    const currentLine = lines[currentLineIndex]
    
    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setCurrentText(currentLine.slice(0, currentCharIndex + 1))
        setCurrentCharIndex(currentCharIndex + 1)
      }, 25) // Typing speed - faster!
      
      return () => clearTimeout(timer)
    } else {
      // Line complete, move to next line after a brief pause
      const timer = setTimeout(() => {
        setTypedLines([...typedLines, currentLine])
        setCurrentLineIndex(currentLineIndex + 1)
        setCurrentText('')
        setCurrentCharIndex(0)
      }, 100) // Pause before next line - faster!
      
      return () => clearTimeout(timer)
    }
  }, [currentCharIndex, currentLineIndex, typedLines, lines, active])

  // Don't render when not on home
  if (active !== "home") return null

  return (
    <>
      <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] font-normal space-y-0.5 sm:space-y-1">
        {typedLines.map((l, index) => (
          <p 
            key={`line-${index}`}
            className="glitch-text text-[clamp(0.6rem,1vw,0.9rem)]"
            data-text={l}
            style={{ 
              lineHeight: '1.2'
            }}
          >
            {l}
          </p>
        ))}
        {currentText && currentLineIndex < lines.length && (
          <p 
            key={`current-${currentLineIndex}-${currentCharIndex}`}
            className="glitch-text text-[clamp(0.6rem,1vw,0.9rem)]"
            data-text={currentText}
            style={{ 
              lineHeight: '1.2'
            }}
          >
            {currentText}
            {currentCharIndex < lines[currentLineIndex]?.length && <span className="cursor-blink">|</span>}
          </p>
        )}
      </div>

      {showLinks && (
        <div className="absolute bottom-[var(--content-y)] left-[var(--content-x)] text-[var(--fg)] space-y-2 animate-fadeIn">
          {link1Text && (
            <a
              href="https://deadside-blog.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit DeadSide (opens in new tab)"
              className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity duration-200 glitch-text"
              data-text={link1Text}
            >
              {link1Text}
              {link1Text.length < LINK_STRINGS[0].length && <span className="cursor-blink">|</span>}
            </a>
          )}
          {link2Text && (
            <a
              href="https://singularity-lab-ruddy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit SingularityLab (opens in new tab)"
              className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity duration-200 glitch-text"
              data-text={link2Text}
            >
              {link2Text}
              {link2Text.length < LINK_STRINGS[1].length && <span className="cursor-blink">|</span>}
            </a>
          )}
          {link3Text && (
            <a
              href="https://marlowe-newspapers.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Marlowe (opens in new tab)"
              className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity duration-200 glitch-text"
              data-text={link3Text}
            >
              {link3Text}
              {link3Text.length < LINK_STRINGS[2].length && <span className="cursor-blink">|</span>}
            </a>
          )}
        </div>
      )}
    </>
  )
}

