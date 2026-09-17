import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypedLink, TypedText } from "./TypedText";

describe("TypedText", () => {
  it("renders nothing before the first character", () => {
    const { container } = render(
      <TypedText line={{ text: "", full: "Hello", done: false, scramble: "" }} as="p" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("materialises as soon as noise runs ahead of the caret", () => {
    render(
      <TypedText
        line={{ text: "", full: "Hello", done: false, scramble: "#!" }}
        as="p"
        id="line"
      />,
    );
    expect(document.getElementById("line")?.querySelector(".scramble")).toHaveTextContent("#!");
  });

  it("shows a caret while typing and the whole sentence to screen readers", () => {
    render(
      <TypedText
        line={{ text: "Hel", full: "Hello", done: false, scramble: "" }}
        as="p"
        id="line"
      />,
    );

    const element = document.getElementById("line");
    expect(element).toHaveTextContent("Hel");
    expect(element).toHaveTextContent("Hello");
    expect(element?.querySelector(".caret")).not.toBeNull();
  });

  it("drops the caret once the line is finished", () => {
    render(
      <TypedText
        line={{ text: "Hello", full: "Hello", done: true, scramble: "" }}
        as="p"
        id="line"
      />,
    );
    expect(document.getElementById("line")?.querySelector(".caret")).toBeNull();
  });
});

describe("TypedLink", () => {
  it("opens in a new tab without leaking the opener", () => {
    render(
      <TypedLink
        line={{ text: "GitHub", full: "GitHub", done: true, scramble: "" }}
        href="https://example.com"
        description="Visit example (opens in a new tab)"
      />,
    );

    const link = screen.getByRole("link", { name: "Visit example (opens in a new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
