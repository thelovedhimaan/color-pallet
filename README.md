# Color Palette Studio

A modern, local-first React workspace for creating, testing, sharing, and exporting accessible color systems.

[**Open the production app**](https://color-pallet-drab.vercel.app) | [Architecture](./docs/ARCHITECTURE.md) | [Modernization audit](./docs/AUDIT.md) | [Roadmap](./ROADMAP.md)

## Project status

The planned modernization is complete for the current release. The original palette workflow has been rebuilt with a responsive interface, strict data validation, professional accessibility tools, sharing, version history, exports, automated tests, CI, and a production deployment.

## Features

### Palette workspace

- Create, rename, describe, duplicate, search, and delete palettes
- Add, edit, reorder, and remove colors from a compact visual workspace
- Copy values as HEX, RGB, or HSL
- Undo and redo palette changes
- Save named checkpoints and restore earlier versions
- Import portable palette JSON
- Persist validated work in browser storage

### Accessibility and color tooling

- Compare every foreground and background combination in a WCAG contrast matrix
- Find accessible color-pair suggestions with AA and AAA results
- Preview protanopia, deuteranopia, tritanopia, and achromatopsia simulations
- Switch color formats without changing the underlying palette
- Use keyboard-accessible controls and reduced-motion behavior

### Sharing and delivery

- Create stable palette URLs without requiring an account
- Open a distraction-free presentation view
- Export CSS custom properties, portable JSON, and W3C-shaped design tokens
- Download export files or copy their contents directly

## Interface

The current UI uses React-inspired cyan accents, compact palette cards, clear editable metadata fields, smooth motion, subtle depth, responsive layouts, and stable tab transitions. Motion is removed when the operating system requests reduced motion.

## Technology

| Area | Stack |
| :--- | :--- |
| UI | React 19, native CSS |
| Language | Strict TypeScript |
| Build | Vite 6 |
| Validation | Runtime palette schema validation |
| Testing | Vitest, Testing Library, axe-core |
| Automation | GitHub Actions |
| Hosting | Vercel |

## Run locally

```bash
npm install
npm run dev
```

Run the full verification suite:

```bash
npm run check
npm run build
```

The production build enforces uncompressed budgets of 250 KiB for JavaScript and 80 KiB for CSS.

## Verified release

| Check | Result |
| :--- | :--- |
| TypeScript | Passing |
| Automated tests | 6 passing |
| JavaScript bundle | 243.99 kB uncompressed / 75.91 kB gzip |
| CSS bundle | 20.39 kB uncompressed / 4.97 kB gzip |
| Production | [Live on Vercel](https://color-pallet-drab.vercel.app) |

## Data and privacy

Palette data remains in the browser unless the user exports it or creates a share URL. Shared URLs contain the selected palette data. The complete editing workflow does not require an account or remote database.
