import { useState, useEffect } from 'react'

export default function Projects({ active }) {
  const [titleText, setTitleText] = useState('')
  const [showProjects, setShowProjects] = useState(false)
  const [project1Text, setProject1Text] = useState('')
  const [project1Title, setProject1Title] = useState('')
  const [project2Text, setProject2Text] = useState('')
  const [project2Title, setProject2Title] = useState('')
  const [project3Text, setProject3Text] = useState('')
  const [project3Title, setProject3Title] = useState('')
  const [project4Text, setProject4Text] = useState('')
  const [project4Title, setProject4Title] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  const titleString = '■ Development & Design Projects'
  const p1TextString = '2026 / Comission / Agency'
  const p1TitleString = 'MYB Agency'
  const p2TextString = '2025 / Comission / Online Store'
  const p2TitleString = 'Northernwest'
  const p3TextString = '2023 / Commission / Agency'
  const p3TitleString = 'WebSync Media'
  const p4TextString = '2023 / Commission / Portfolio'
  const p4TitleString = 'Marlowe'

  useEffect(() => {
    if (active !== "projects") return

    // Step 0: Type title
    if (currentStep === 0) {
      if (titleText.length < titleString.length) {
        const timer = setTimeout(() => {
          setTitleText(titleString.slice(0, titleText.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(1), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 1: Show projects container and type project 1 text
    if (currentStep === 1) {
      setShowProjects(true)
      if (project1Text.length < p1TextString.length) {
        const timer = setTimeout(() => {
          setProject1Text(p1TextString.slice(0, project1Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(2), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 2: Type project 1 title
    if (currentStep === 2) {
      if (project1Title.length < p1TitleString.length) {
        const timer = setTimeout(() => {
          setProject1Title(p1TitleString.slice(0, project1Title.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(3), 200)
        return () => clearTimeout(timer)
      }
    }

    // Step 3: Type project 2 text
    if (currentStep === 3) {
      if (project2Text.length < p2TextString.length) {
        const timer = setTimeout(() => {
          setProject2Text(p2TextString.slice(0, project2Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(4), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 4: Type project 2 title
    if (currentStep === 4) {
      if (project2Title.length < p2TitleString.length) {
        const timer = setTimeout(() => {
          setProject2Title(p2TitleString.slice(0, project2Title.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(5), 200)
        return () => clearTimeout(timer)
      }
    }

    // Step 5: Type project 3 text
    if (currentStep === 5) {
      if (project3Text.length < p3TextString.length) {
        const timer = setTimeout(() => {
          setProject3Text(p3TextString.slice(0, project3Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(6), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 6: Type project 3 title
    if (currentStep === 6) {
      if (project3Title.length < p3TitleString.length) {
        const timer = setTimeout(() => {
          setProject3Title(p3TitleString.slice(0, project3Title.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(7), 200)
        return () => clearTimeout(timer)
      }
    }

    // Step 7: Type project 4 text
    if (currentStep === 7) {
      if (project4Text.length < p4TextString.length) {
        const timer = setTimeout(() => {
          setProject4Text(p4TextString.slice(0, project4Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(8), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 8: Type project 4 title
    if (currentStep === 8) {
      if (project4Title.length < p4TitleString.length) {
        const timer = setTimeout(() => {
          setProject4Title(p4TitleString.slice(0, project4Title.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      }
    }
  }, [active, currentStep, titleText, project1Text, project1Title, project2Text, project2Title, project3Text, project3Title, project4Text, project4Title])

  if (active !== "projects") return null

  return (
    <div className="absolute top-[var(--section-top)] right-[var(--content-x)] w-[min(90vw,40rem)] text-right text-[var(--fg)]">
      {titleText && (
        <p className="text-xs sm:text-sm mb-4 sm:mb-6 opacity-80 glitch-text" data-text={titleText}>
          {titleText}
          {titleText.length < titleString.length && <span className="cursor-blink">|</span>}
        </p>
      )}

      {showProjects && (
        <div className="max-h-[calc(100vh-var(--section-top)-4rem)] overflow-y-auto scrollbar-hide">
          <a href="https://mind-your-business-agency.vercel.app/" target="_blank"
             className="block hover:opacity-50 transition-opacity mb-6 sm:mb-8">
            {project1Text && (
              <p className="text-xs sm:text-sm font-normal mb-1 glitch-text" data-text={project1Text}>
                {project1Text}
                {project1Text.length < p1TextString.length && currentStep === 1 && <span className="cursor-blink">|</span>}
              </p>
            )}
            {project1Title && (
              <p className="text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight glitch-text" data-text={project1Title}>
                {project1Title}
                {project1Title.length < p1TitleString.length && currentStep === 2 && <span className="cursor-blink">|</span>}
              </p>
            )}
          </a>

          {currentStep >= 3 && (
            <a href="https://northernwest.shop/" target="_blank"
               className="block hover:opacity-50 transition-opacity mb-6 sm:mb-8">
              {project2Text && (
                <p className="text-xs sm:text-sm font-normal mb-1 glitch-text" data-text={project2Text}>
                  {project2Text}
                  {project2Text.length < p2TextString.length && currentStep === 3 && <span className="cursor-blink">|</span>}
                </p>
              )}
              {project2Title && (
                <p className="text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight glitch-text" data-text={project2Title}>
                  {project2Title}
                  {project2Title.length < p2TitleString.length && currentStep === 4 && <span className="cursor-blink">|</span>}
                </p>
              )}
            </a>
          )}

          {currentStep >= 5 && (
            <a href="https://alaa-younsi.github.io/WebSync-Media-1.0/" target="_blank"
               className="block hover:opacity-50 transition-opacity mb-6 sm:mb-8">
              {project3Text && (
                <p className="text-xs sm:text-sm font-normal mb-1 glitch-text" data-text={project3Text}>
                  {project3Text}
                  {project3Text.length < p3TextString.length && currentStep === 5 && <span className="cursor-blink">|</span>}
                </p>
              )}
              {project3Title && (
                <p className="text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight glitch-text" data-text={project3Title}>
                  {project3Title}
                  {project3Title.length < p3TitleString.length && currentStep === 6 && <span className="cursor-blink">|</span>}
                </p>
              )}
            </a>
          )}

          {currentStep >= 7 && (
            <a href="https://alaa-younsi.github.io/Marlowe/" target="_blank"
               className="block hover:opacity-50 transition-opacity">
              {project4Text && (
                <p className="text-xs sm:text-sm font-normal mb-1 glitch-text" data-text={project4Text}>
                  {project4Text}
                  {project4Text.length < p4TextString.length && currentStep === 7 && <span className="cursor-blink">|</span>}
                </p>
              )}
              {project4Title && (
                <p className="text-[clamp(1.25rem,5vw,3.5rem)] font-bold tracking-tight glitch-text" data-text={project4Title}>
                  {project4Title}
                  {project4Title.length < p4TitleString.length && currentStep === 8 && <span className="cursor-blink">|</span>}
                </p>
              )}
            </a>
          )}
        </div>
      )}
    </div>
  )
}