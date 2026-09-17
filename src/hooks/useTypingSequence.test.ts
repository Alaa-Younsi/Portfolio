import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTypingSequence } from "./useTypingSequence";

const LINES = ["ab", "cd"] as const;
const SPEED = 10;
const LINE_PAUSE = 100;

/** Each timer must flush through React before the next one is scheduled. */
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

afterEach(() => {
  vi.useRealTimers();
});

describe("useTypingSequence", () => {
  it("reveals one character at a time", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { result } = renderHook(() => useTypingSequence(LINES, true, SPEED));

    expect(result.current[0]?.text).toBe("");

    tick(SPEED);
    expect(result.current[0]?.text).toBe("a");

    tick(SPEED);
    expect(result.current[0]?.text).toBe("ab");
    expect(result.current[0]?.done).toBe(true);
  });

  it("moves on to the next string after the inter-line pause", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { result } = renderHook(() => useTypingSequence(LINES, true, SPEED));

    tick(SPEED);
    tick(SPEED);
    expect(result.current[1]?.text).toBe("");

    tick(LINE_PAUSE);
    tick(SPEED);
    tick(SPEED);
    expect(result.current[1]?.text).toBe("cd");
    expect(result.current.every((line) => line.done)).toBe(true);
  });

  it("stays empty while inactive", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { result } = renderHook(() => useTypingSequence(LINES, false, SPEED));

    tick(1000);
    expect(result.current.map((line) => line.text)).toEqual(["", ""]);
  });

  it("always exposes the full string for assistive technology", () => {
    const { result } = renderHook(() => useTypingSequence(LINES, true, SPEED));
    expect(result.current.map((line) => line.full)).toEqual(["ab", "cd"]);
  });
});
