import { describe, expect, it } from "vitest";
import { contrastRatio, exportCss, formatColor, normalizeHex, simulateVision, validatePalette } from "./palette-utils";
import { seedPalettes } from "./seed";

describe("palette utilities", () => {
  it("normalizes and converts portable color values", () => {
    expect(normalizeHex("61dafb")).toBe("#61DAFB");
    expect(formatColor("#61DAFB", "rgb")).toBe("rgb(97, 218, 251)");
    expect(formatColor("#61DAFB", "hsl")).toBe("hsl(193 95% 68%)");
  });
  it("calculates WCAG contrast ratios", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 1);
  });
  it("simulates color vision modes", () => {
    expect(simulateVision("#61DAFB", "normal")).toBe("#61DAFB");
    expect(simulateVision("#61DAFB", "deuteranopia")).toMatch(/^#[0-9A-F]{6}$/);
  });
  it("validates palettes and produces CSS tokens", () => {
    expect(validatePalette(seedPalettes[0])).toBe(true);
    expect(exportCss(seedPalettes[0].colors)).toContain("--color-react-cyan: #61DAFB;");
  });
});
