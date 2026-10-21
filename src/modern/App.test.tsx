import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Color Palette Studio", () => {
  it("renders the palette workflow with accessible navigation", () => {
    render(<App />);
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share palette/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Palette name")).toHaveValue("React Interface");
  });
});
