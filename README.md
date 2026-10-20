# Color Palette Studio

A visual workspace for creating, organizing, previewing, and exporting color
systems. The current React application is functional but uses a legacy frontend
stack; a focused modernization is planned.

> **Status:** legacy application under evaluation for modernization. No new
> implementation has started. See [ROADMAP.md](./ROADMAP.md).

**[Open the legacy Vercel preview](https://color-pallet-drab.vercel.app)**

The preview preserves the historical application for evaluation. It is not the
final microfrontend and still requires the dependency, accessibility, and
interaction modernization described below.

## Existing functionality

- Browse curated starter palettes
- Explore multiple shades for every color
- Copy color values for use in other tools
- Create palettes with a visual color picker
- Drag and reorder colors
- Validate names and prevent duplicates
- Save and delete palettes in browser storage
- Responsive navigation and animated page transitions

## Why this project is worth modernizing

Unlike a static tutorial page, the existing application already has a complete
interaction loop: discover, create, organize, persist, and reuse. A rebuild can
turn that foundation into a credible frontend product case study focused on
accessibility, state design, interaction quality, and design-token workflows.

## Current stack

- React 16 and Create React App
- Material UI 3
- React Router 4
- Chroma.js
- Browser local storage

These versions are intentionally documented rather than hidden. Dependency,
accessibility, and browser compatibility work are required before deployment.

## Legacy setup

```bash
npm install
npm start
```

## Modernization goals

- Modern React and TypeScript foundation
- Keyboard-accessible palette editing and drag/reorder alternatives
- WCAG contrast analysis and color-vision previews
- Import/export for CSS variables, design tokens, JSON, and common tools
- Shareable palettes and reliable persistence
- Automated component, interaction, accessibility, and end-to-end tests
- Documented performance and architecture decisions

The exact framework, component system, persistence model, and deployment tools
will be selected before implementation begins.
