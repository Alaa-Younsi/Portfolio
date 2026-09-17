import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    stubReducedMotion();
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
});
