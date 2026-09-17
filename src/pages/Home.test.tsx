import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chronicle } from "@/data/biography";
import { projects } from "@/data/projects";
import { Home } from "./Home";

/** Reduced motion skips the typing animation, so the DOM settles synchronously. */
function stubReducedMotion(): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

beforeEach(() => {
  stubReducedMotion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home", () => {
  it("renders the identity block and full navigation", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "Alaa Younsi" })).toBeInTheDocument();
    for (const label of ["Home", "Projects", "Info", "Contact"]) {
      expect(screen.getByRole("button", { name: `Navigate to ${label}` })).toBeInTheDocument();
    }
  });

  it("lists every project with a safe external link", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Navigate to Projects" }));

    for (const project of projects) {
      const link = screen.getByRole("link", {
        name: `Visit the ${project.title} project (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", project.url);
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("keeps the document title in sync with the active section", () => {
    render(<Home />);
    expect(document.title).toBe("Alaa Younsi — Developer & Designer");

    fireEvent.click(screen.getByRole("button", { name: "Navigate to Contact" }));
    expect(document.title).toBe("Contact — Alaa Younsi");
  });

  it("reveals the biography when the black hole is collapsed", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse the black hole" }));
    act(() => void vi.advanceTimersByTime(1200));

    expect(screen.getByRole("region", { name: "About Alaa Younsi" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: chronicle.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restore the portfolio" }));
    act(() => void vi.advanceTimersByTime(400));
    expect(screen.queryByRole("region", { name: "About Alaa Younsi" })).toBeNull();
    vi.useRealTimers();
  });
});
