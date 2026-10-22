import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Color Palette Studio", () => {
  it("renders the palette workflow with accessible navigation", () => {
    render(<App />);
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share palette/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Palette name")).toHaveValue("React Interface");
  });

  it("always provides a way to exit presentation mode", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Present" }));
    const exitButton = screen.getByRole("button", { name: /exit presentation/i });
    expect(exitButton).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Present" })).toBeVisible();
  });
});
