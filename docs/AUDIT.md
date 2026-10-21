# Modernization audit

## Preserved flows

- Browse, create, duplicate, rename, and delete palettes
- Add, remove, order, and edit colors
- Copy HEX, RGB, and HSL values
- Persist work in browser storage
- Import and export palette data

## Edge cases handled

- Invalid stored or imported data falls back safely
- A palette always retains at least two colors
- Reordering controls disable at list boundaries
- Malformed shared URLs do not prevent the application from loading
- Small screens switch to horizontal palette navigation and compact cards

## Product decisions

- Use explicit keyboard reorder controls instead of pointer-only drag
- Keep accounts optional; local-first functionality is complete without sign-in
- Use URL sharing until cloud synchronization has an approved data service
- Export W3C-shaped design tokens, CSS variables, and portable JSON
