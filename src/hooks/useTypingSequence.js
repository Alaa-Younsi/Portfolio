import { useState, useEffect, useRef } from 'react'

// Sequentially types an array of strings one character at a time.
// Returns an array of the same length with partially-typed strings.
// Advances to the next string automatically with a 100 ms inter-string pause.
export function useTypingSequence(strings, active, speed = 25) {
  const stringsRef = useRef(strings)
  useEffect(() => { stringsRef.current = strings }, [strings])

  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState(() => strings.map(() => ''))

  useEffect(() => {
    const strs = stringsRef.current
    if (!active) return
    if (step >= strs.length) return

    const target = strs[step]
    const current = typed[step]

    if (current.length < target.length) {
      const timer = setTimeout(() => {
        setTyped(prev => {
          const next = [...prev]
          next[step] = target.slice(0, prev[step].length + 1)
          return next
        })
      }, speed)
      return () => clearTimeout(timer)
    } else if (step < strs.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 100)
      return () => clearTimeout(timer)
    }
  }, [active, step, typed, speed])

  return typed
}
