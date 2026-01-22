export default function Contact({ active }) {
  if (active !== "contact") return null

  return (
    <a
      href="/form.html"
      className="absolute right-[var(--content-x)] bottom-[var(--content-y)] text-[var(--fg)] font-normal hover:opacity-50 transition-opacity text-[clamp(0.7rem,1vw,0.95rem)]"
    >
      Contact Form↗
    </a>
  )
}

