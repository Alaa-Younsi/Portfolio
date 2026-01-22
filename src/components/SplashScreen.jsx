import { useEffect, useState } from "react"

export default function SplashScreen() { // Rename component
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setTimeout(() => setVisible(false), 2500)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[999] flex items-center justify-center">
      <p className="text-[var(--fg)] text-2xl font-bold">
        <span className="animate-fadeOut">Alaa Younsi</span>{" "}
        <span className="animate-fadeOutSlow">Portfolio</span>
      </p>
    </div>
  )
}

