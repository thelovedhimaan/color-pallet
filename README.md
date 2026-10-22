# Color Palette Studio

A modern React workspace for creating, testing, privately saving, sharing, and exporting accessible color systems.

[**Open the production app**](https://color-pallet-drab.vercel.app) | [Architecture](./docs/ARCHITECTURE.md) | [Modernization audit](./docs/AUDIT.md) | [Roadmap](./ROADMAP.md)

## Current release

Color Palette Studio is deployed and operational. Google authentication, private per-user palettes, Supabase persistence, read-only sharing, accessibility tooling, exports, version history, automated tests, CI, and responsive production UI are implemented.

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

### Accounts and ownership

- Authenticate with Google through Supabase Auth
- Load only palettes belonging to the signed-in user
- Enforce ownership in Postgres with row-level security
- Automatically save changes to the user's cloud workspace
- Sign out without exposing another user's palettes
- View the shared example without an account

## Interface

The current UI uses React-inspired cyan accents, compact palette cards, clear editable metadata fields, smooth motion, subtle depth, responsive layouts, and stable tab transitions. Motion is removed when the operating system requests reduced motion.

## Technology

| Area | Technology and purpose |
| :--- | :--- |
| Interface | React 19 components and hooks |
| Styling | Native responsive CSS, design tokens, and reduced-motion support |
| Language | Strict TypeScript |
| Build | Vite 6 with lazy authentication loading and bundle budgets |
| Authentication | Supabase Auth with Google OAuth |
| Database | Supabase Postgres with row-level security |
| Sharing | Public read-only snapshots addressed by UUID |
| Validation | Runtime validation before import or cloud hydration |
| Testing | Vitest, Testing Library, jsdom, and axe-core |
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
| Initial JavaScript | 250.19 kB uncompressed / 78.20 kB gzip |
| Lazy authentication chunk | 108.13 kB uncompressed / 29.84 kB gzip |
| CSS bundle | 22.36 kB uncompressed / 5.32 kB gzip |
| Production | [Live on Vercel](https://color-pallet-drab.vercel.app) |

## Google sign-in and cloud setup

Copy `.env.example` to `.env.local`, create a Supabase project, and run `supabase/migrations/001_accounts_and_palettes.sql` in its SQL editor. Add the project URL and public publishable key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in local development and Vercel.

Enable Google under **Supabase Authentication → Providers**, then add the Supabase callback URL to the Google OAuth client. Add both the local URL and production URL to Supabase Authentication's allowed redirect URLs.

## Data and privacy

Every signed-in user reads and writes only rows whose `user_id` matches their authenticated Supabase user. Row-level security enforces this rule in the database. The included example palette is read-only. Published share links contain a snapshot in `shared_palettes`; anyone with the unguessable link can view that snapshot, while only its owner can publish or delete it.
