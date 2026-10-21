import type { Palette, PaletteColor, StudioState, VisionMode } from "./types";

const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export function normalizeHex(value: string): string | null {
  const candidate = value.trim().startsWith("#") ? value.trim() : `#${value.trim()}`;
  return HEX_PATTERN.test(candidate) ? candidate.toUpperCase() : null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const valid = normalizeHex(hex);
  if (!valid) throw new Error(`Invalid color: ${hex}`);
  return [1, 3, 5].map((index) => Number.parseInt(valid.slice(index, index + 2), 16)) as [number, number, number];
}

export function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function hexToHsl(hex: string): [number, number, number] {
  const [red, green, blue] = hexToRgb(hex).map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
    if (max === green) hue = ((blue - red) / delta + 2) / 6;
    if (max === blue) hue = ((red - green) / delta + 4) / 6;
  }
  return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
}

export function formatColor(hex: string, format: "hex" | "rgb" | "hsl"): string {
  if (format === "hex") return normalizeHex(hex) || hex;
  const [red, green, blue] = hexToRgb(hex);
  if (format === "rgb") return `rgb(${red}, ${green}, ${blue})`;
  const [hue, saturation, lightness] = hexToHsl(hex);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function luminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const VISION_MATRICES: Record<Exclude<VisionMode, "normal">, number[][]> = {
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

export function simulateVision(hex: string, mode: VisionMode): string {
  if (mode === "normal") return hex;
  const rgb = hexToRgb(hex);
  const result = VISION_MATRICES[mode].map((row) => Math.min(255, Math.max(0, row.reduce((sum, value, index) => sum + value * rgb[index], 0))));
  return rgbToHex(result[0], result[1], result[2]);
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function validatePalette(value: unknown): value is Palette {
  if (!value || typeof value !== "object") return false;
  const palette = value as Partial<Palette>;
  return typeof palette.id === "string" && typeof palette.name === "string" && Array.isArray(palette.colors) && palette.colors.every((color) => typeof color?.id === "string" && typeof color?.name === "string" && Boolean(normalizeHex(color?.value || "")));
}

export function validateState(value: unknown): value is StudioState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StudioState>;
  return Array.isArray(state.palettes) && state.palettes.every(validatePalette) && typeof state.activePaletteId === "string";
}

export function exportCss(colors: PaletteColor[]): string {
  return `:root {\n${colors.map((color) => `  --color-${slugify(color.name)}: ${color.value};`).join("\n")}\n}`;
}

export function exportTokens(palette: Palette): string {
  return JSON.stringify({ $schema: "https://design-tokens.github.io/community-group/format/", color: Object.fromEntries(palette.colors.map((color) => [slugify(color.name), { $type: "color", $value: color.value }])) }, null, 2);
}
