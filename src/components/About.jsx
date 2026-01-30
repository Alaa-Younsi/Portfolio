import { useState, useEffect } from 'react'

export default function Info({ active }) {
  const [titleText, setTitleText] = useState('')
  const [descText, setDescText] = useState('')
  const [frontEndLabel, setFrontEndLabel] = useState('')
  const [frontEndSkills, setFrontEndSkills] = useState('')
  const [backEndLabel, setBackEndLabel] = useState('')
  const [backEndSkills, setBackEndSkills] = useState('')
  const [link1Text, setLink1Text] = useState('')
  const [link2Text, setLink2Text] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  const titleString = '\u25a0 Things that i can do'
  const descString = 'I can do website development and design, including server side services.'
  const frontEndLabelString = '\u25cf Front-end skillset'
  const frontEndSkillsString = 'JavaScript, Typescript, React, Tailwind, Vite, NextJS..'
  const backEndLabelString = '\u25cf Back-end skillset'
  const backEndSkillsString = 'Python, MySQL, NodeJS, ExpressJS, Firebase, Vercel..'
  const link1String = 'Instagram\u2197'
  const link2String = 'Twitter\u2197'

  useEffect(() => {
    if (active !== "info") return

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

    // Step 1: Type description
    if (currentStep === 1) {
      if (descText.length < descString.length) {
        const timer = setTimeout(() => {
          setDescText(descString.slice(0, descText.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(2), 150)
        return () => clearTimeout(timer)
      }
    }

    // Step 2: Type front-end label
    if (currentStep === 2) {
      if (frontEndLabel.length < frontEndLabelString.length) {
        const timer = setTimeout(() => {
          setFrontEndLabel(frontEndLabelString.slice(0, frontEndLabel.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(3), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 3: Type front-end skills
    if (currentStep === 3) {
      if (frontEndSkills.length < frontEndSkillsString.length) {
        const timer = setTimeout(() => {
          setFrontEndSkills(frontEndSkillsString.slice(0, frontEndSkills.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(4), 150)
        return () => clearTimeout(timer)
      }
    }

    // Step 4: Type back-end label
    if (currentStep === 4) {
      if (backEndLabel.length < backEndLabelString.length) {
        const timer = setTimeout(() => {
          setBackEndLabel(backEndLabelString.slice(0, backEndLabel.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(5), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 5: Type back-end skills
    if (currentStep === 5) {
      if (backEndSkills.length < backEndSkillsString.length) {
        const timer = setTimeout(() => {
          setBackEndSkills(backEndSkillsString.slice(0, backEndSkills.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(6), 150)
        return () => clearTimeout(timer)
      }
    }

    // Step 6: Type link 1
    if (currentStep === 6) {
      if (link1Text.length < link1String.length) {
        const timer = setTimeout(() => {
          setLink1Text(link1String.slice(0, link1Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setCurrentStep(7), 100)
        return () => clearTimeout(timer)
      }
    }

    // Step 7: Type link 2
    if (currentStep === 7) {
      if (link2Text.length < link2String.length) {
        const timer = setTimeout(() => {
          setLink2Text(link2String.slice(0, link2Text.length + 1))
        }, 25)
        return () => clearTimeout(timer)
      }
    }
  }, [active, currentStep, titleText, descText, frontEndLabel, frontEndSkills, backEndLabel, backEndSkills, link1Text, link2Text])

  if (active !== "info") return null

  return (
    <>
      <section aria-labelledby="about-heading" className="absolute top-[60%] sm:top-[var(--section-top)] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 w-[min(90vw,40rem)] text-[var(--fg)] text-center">
        {titleText && (
          <h2 id="about-heading" className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal opacity-80 glitch-text" data-text={titleText}>
            {titleText}
            {titleText.length < titleString.length && <span className="cursor-blink">|</span>}
          </h2>
        )}

        {currentStep >= 1 && descText && (
          <p className="mt-4 text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] leading-relaxed glitch-text" data-text={descText}>
            {descText}
            {descText.length < descString.length && currentStep === 1 && <span className="cursor-blink">|</span>}
          </p>
        )}

        {currentStep >= 2 && (
          <div className="mt-6 sm:mt-8 text-left max-w-xs sm:max-w-sm mx-auto">
            {frontEndLabel && (
              <p className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80 glitch-text" data-text={frontEndLabel}>
                {frontEndLabel}
                {frontEndLabel.length < frontEndLabelString.length && currentStep === 2 && <span className="cursor-blink">|</span>}
              </p>
            )}
            {currentStep >= 3 && frontEndSkills && (
              <p className="text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1 glitch-text" data-text={frontEndSkills}>
                {frontEndSkills}
                {frontEndSkills.length < frontEndSkillsString.length && currentStep === 3 && <span className="cursor-blink">|</span>}
              </p>
            )}

            {currentStep >= 4 && (
              <>
                {backEndLabel && (
                  <p className="text-[0.6rem] sm:text-[clamp(0.7rem,1vw,0.9rem)] font-normal mt-3 sm:mt-4 opacity-80 glitch-text" data-text={backEndLabel}>
                    {backEndLabel}
                    {backEndLabel.length < backEndLabelString.length && currentStep === 4 && <span className="cursor-blink">|</span>}
                  </p>
                )}
                {currentStep >= 5 && backEndSkills && (
                  <p className="text-[0.75rem] sm:text-[clamp(0.9rem,1.25vw,1.05rem)] mt-1 glitch-text" data-text={backEndSkills}>
                    {backEndSkills}
                    {backEndSkills.length < backEndSkillsString.length && currentStep === 5 && <span className="cursor-blink">|</span>}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {currentStep >= 6 && (
        <div className="absolute bottom-[var(--content-y)] right-[var(--content-x)] text-[var(--fg)] space-y-2 text-right">
          {link1Text && (
            <a href="https://www.instagram.com/infinituxs/" target="_blank" rel="noopener noreferrer"
               aria-label="Visit Instagram profile (opens in new tab)"
               className="block text-[clamp(0.7rem,1vw,0.9rem)] hover:opacity-50 transition-opacity glitch-text" data-text={link1Text}>
              {link1Text}
              {link1Text.length < link1String.length && currentStep === 6 && <span className="cursor-blink">|</span>}
            </a>
          )}
          {currentStep >= 7 && link2Text && (
            <a href="https://x.com/ashv3il" target="_blank" rel="noopener noreferrer"
               aria-label="Visit Twitter profile (opens in new tab)"
               className="block text-xs sm:text-sm hover:opacity-50 transition-opacity glitch-text" data-text={link2Text}>
              {link2Text}
              {link2Text.length < link2String.length && currentStep === 7 && <span className="cursor-blink">|</span>}
            </a>
          )}
        </div>
      )}
    </>
  )
}