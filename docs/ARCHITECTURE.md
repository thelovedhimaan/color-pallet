# Architecture decisions

## Rebuild strategy

The product now uses React 19, strict TypeScript, and Vite. The previous React
16 application remains in Git history; the production entry point is
`src/main.tsx`. A focused rebuild reduced the runtime dependency surface and
made the palette model portable.

## State and persistence

The studio keeps one serializable `StudioState`. Mutations create bounded
in-memory undo checkpoints and persist validated state to local storage.
Palette JSON uses a framework-independent schema so it can move to remote
storage later without changing the editor model.

## Sharing and collaboration

Share links encode a validated palette in the URL. This provides stable links
without a backend or account requirement. Browser storage supplies local
version history, duplication, and collections. Cloud synchronization remains
an optional infrastructure extension.

## Accessibility and performance

The interface uses semantic landmarks, visible focus styles, labelled inputs,
keyboard reorder controls, reduced-motion support, and WCAG contrast evidence.
CI enforces uncompressed budgets of 250 KiB for JavaScript and 80 KiB for CSS.
