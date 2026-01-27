import { useState, useEffect, useMemo } from 'react'

export default function Hero({ active }) { // Renamed from Home to Hero for clarity
  const lines = useMemo(() => [
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
  ], [])

  const [typedLines, setTypedLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

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
  )
}

