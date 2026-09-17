type FrameProps = { hidden: boolean };

/**
 * The white rectangle every other element lives inside. Four 1px bars rather
 * than a border so the lines never scale with the viewport. On mount the
 * horizontals draw outward from the centre, then the verticals follow.
 */
export function Frame({ hidden }: FrameProps) {
  const line = `fixed z-20 bg-line transition-opacity duration-[400ms] ${
    hidden ? "opacity-0" : "opacity-100"
  }`;
  const horizontal =
    "left-frame-x h-[0.5px] w-[calc(100%-2*var(--frame-x))] origin-center animate-drawX sm:h-px";
  const vertical =
    "top-frame-y h-[calc(100%-2*var(--frame-y))] w-[0.5px] origin-center animate-drawY sm:w-px";

  return (
    <div aria-hidden="true">
      <div className={`${line} ${horizontal} top-frame-y`} />
      <div className={`${line} ${horizontal} bottom-frame-y`} />
      <div className={`${line} ${vertical} left-frame-x`} />
      <div className={`${line} ${vertical} right-frame-x`} />
    </div>
  );
}
