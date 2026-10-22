# Color Palette Studio

A modern React workspace for creating, testing, privately saving, sharing, and exporting accessible color systems.

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
- Sign in with Google and keep palettes isolated in a private cloud workspace
- Keep one read-only example palette available to every visitor

### Accessibility and color tooling

- Compare every foreground and background combination in a WCAG contrast matrix
- Find accessible color-pair suggestions with AA and AAA results
- Preview protanopia, deuteranopia, tritanopia, and achromatopsia simulations
- Switch color formats without changing the underlying palette
- Use keyboard-accessible controls and reduced-motion behavior

### Sharing and delivery

- Publish stable, read-only palette links that anyone can open
- Duplicate a shared palette into the signed-in user's private workspace
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
| Accounts and data | Supabase Auth, Postgres, and row-level security |

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
| Initial JavaScript | 250.19 kB uncompressed / 78.20 kB gzip |
| Lazy authentication chunk | 108.13 kB uncompressed / 29.84 kB gzip |
| CSS bundle | 22.36 kB uncompressed / 5.32 kB gzip |
| Production | [Live on Vercel](https://color-pallet-drab.vercel.app) |

## Google sign-in and cloud setup

Copy `.env.example` to `.env.local`, create a Supabase project, and run `supabase/migrations/001_accounts_and_palettes.sql` in its SQL editor. Add the project URL and public publishable key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in local development and Vercel.

Enable Google under **Supabase Authentication → Providers**, then add the Supabase callback URL to the Google OAuth client. Add both the local URL and production URL to Supabase Authentication's allowed redirect URLs.

## Data and privacy

Every signed-in user reads and writes only rows whose `user_id` matches their authenticated Supabase user. Row-level security enforces this rule in the database. The included example palette is read-only. Published share links contain a snapshot in `shared_palettes`; anyone with the unguessable link can view that snapshot, while only its owner can publish or delete it.
