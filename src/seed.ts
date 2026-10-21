import type { Palette } from "./types";

const timestamp = "2026-10-21T00:00:00.000Z";
export const seedPalettes: Palette[] = [
  {
    id: "react-interface", name: "React Interface", description: "A crisp product palette inspired by React's cyan energy and deep technical surfaces.", collection: "Product UI", createdAt: timestamp, updatedAt: timestamp, versions: [],
    colors: [
      { id: "react-cyan", name: "React Cyan", value: "#61DAFB" },
      { id: "deep-navy", name: "Deep Navy", value: "#20232A" },
      { id: "canvas", name: "Canvas", value: "#090B10" },
      { id: "cloud", name: "Cloud", value: "#F3F7FA" },
      { id: "success", name: "Success", value: "#4ADE80" },
    ],
  },
  {
    id: "warm-editorial", name: "Warm Editorial", description: "Confident warm tones for storytelling, publishing, and campaign systems.", collection: "Brand", createdAt: timestamp, updatedAt: timestamp, versions: [],
    colors: [
      { id: "ink", name: "Ink", value: "#191716" },
      { id: "paper", name: "Paper", value: "#FFF9F0" },
      { id: "coral", name: "Coral", value: "#F06449" },
      { id: "gold", name: "Gold", value: "#E8B44F" },
      { id: "sage", name: "Sage", value: "#6B8F71" },
    ],
  },
];
