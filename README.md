# Color Palette Studio

A modern React workspace for creating, testing, sharing, and exporting accessible
color systems.

**[Open the production app](https://color-pallet-drab.vercel.app)** ·
[Architecture](./docs/ARCHITECTURE.md) · [Modernization audit](./docs/AUDIT.md) ·
[Roadmap](./ROADMAP.md)

## Product capabilities

- Create, edit, order, duplicate, search, and organize palettes
- Copy values in HEX, RGB, and HSL formats
- Undo and redo editing decisions
- Measure every color pairing against WCAG contrast thresholds
- Preview protanopia, deuteranopia, tritanopia, and achromatopsia simulations
- Export CSS variables, portable JSON, and W3C-shaped design tokens
- Share palettes with stable URLs and open a distraction-free presentation mode
- Save local versions, restore checkpoints, and import palette JSON
- Persist validated work in browser storage without requiring an account

## Modern stack

- React 19 and strict TypeScript
- Vite 6 static production build
- Native CSS design system with responsive and reduced-motion behavior
- Vitest and Testing Library
- GitHub Actions quality checks
- Vercel deployment configuration

## Local development

```bash
npm install
npm run dev
```

Run the complete verification suite:

```bash
npm run check
npm run build
```

The build enforces uncompressed budgets of 250 KiB for JavaScript and 80 KiB
for CSS.

## Data and privacy

Palette data stays in the browser unless a user exports it or creates a share
URL. Share URLs contain the selected palette. No account or remote database is
required for the complete editing workflow.
