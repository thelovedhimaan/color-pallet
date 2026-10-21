export type ColorFormat = "hex" | "rgb" | "hsl";
export type VisionMode = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

export interface PaletteColor { id: string; name: string; value: string; }
export interface PaletteVersion { id: string; savedAt: string; colors: PaletteColor[]; }
export interface Palette {
  id: string;
  name: string;
  description: string;
  collection: string;
  colors: PaletteColor[];
  versions: PaletteVersion[];
  createdAt: string;
  updatedAt: string;
}
export interface StudioState { palettes: Palette[]; activePaletteId: string; }
