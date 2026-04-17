export default function Frame() {
  return (
    <>
      {/* Frame lines - responsive thickness */}
      <div className="fixed top-[var(--frame-y)] left-[var(--frame-x)] w-[calc(100%-2*var(--frame-x))] h-[0.5px] sm:h-px bg-[var(--border)] z-20" />
      <div className="fixed bottom-[var(--frame-y)] left-[var(--frame-x)] w-[calc(100%-2*var(--frame-x))] h-[0.5px] sm:h-px bg-[var(--border)] z-20" />
      <div className="fixed top-[var(--frame-y)] left-[var(--frame-x)] h-[calc(100%-2*var(--frame-y))] w-[0.5px] sm:w-px bg-[var(--border)] z-20" />
      <div className="fixed top-[var(--frame-y)] right-[var(--frame-x)] h-[calc(100%-2*var(--frame-y))] w-[0.5px] sm:w-px bg-[var(--border)] z-20" />
    </>
  )
}
