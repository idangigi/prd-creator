# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173/prd-creator/
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # ESLint across all .ts/.tsx files
npm run preview   # Serve the dist/ build locally
npm run deploy    # Build and push to gh-pages branch (GitHub Pages)
```

There are no tests.

## Architecture

The entire application lives in **`src/App.tsx`** (~950 lines). There is no routing, no external state library, and no component files outside of `App.tsx`.

### Data model

`PRDData` is the single root state object held in `useState`. It covers all six PRD sections: `featureName`, `what`, `why`, `who` (Feature Brief), `stories[]` (User Stories with nested `acs[]`), `edge[]` (Edge Cases), `api`, `db`, `integrations` (Technical Notes), `scope[]` (Out of Scope), `figma`, `screens` (Design Links).

### Section configuration

`SECTIONS: SectionDef[]` is the data-driven config that controls what renders. Each entry has one of three modes:

- **Static fields** — `fields[]` array, renders `FieldInput` per field, keyed by `field.id` directly on `PRDData`.
- **Dynamic lists** — `dynamic: true`, renders a list of item cards with add/remove; items are arrays on `PRDData` (e.g. `edge`, `scope`). `minItems` enforces a minimum count before remove is allowed. `prefix` sets the label prefix (`EC-01`, `Item 01`, etc.).
- **Stories** — `isStories: true`, a special-cased section for the nested `Story → AC[]` structure with its own update handlers (`updateStory`, `updateAC`, `addStory`, `removeStory`, `addAC`, `removeAC`).

### Validation

`validate()` returns an `ErrorMap` keyed by a path string:
- Static fields: `fieldId`
- Dynamic items: `sectionId_index_fieldId`
- Stories: `story_si_field` or `ac_si_ai_field`

Validation only fires on export attempt (`handleExport`). `submitted` flag enables inline error display afterward. On failure, the app auto-navigates to the first section containing an error.

### Export

- **`generateDocx(data)`** — async, uses the `docx` npm package to build a fully-styled Word document in memory, then triggers a browser download via `URL.createObjectURL`. Hardcoded "FATTAL HOTELS" branding and a blue color palette (`BLUE = '1A3C6E'`, `MID = '2E75B6'`).
- **`generateTxt(data)`** — synchronous plain text export via the same blob/anchor pattern.

### Styling

All styles are inline `React.CSSProperties`. The `C` object at the top of `App.tsx` is the design token map (colors only). No CSS framework, no CSS modules, no styled-components. The `App.css` and `index.css` files contain only resets/base rules.

### Responsive layout

`isMobile` state (breakpoint: `window.innerWidth < 820`) switches between:
- **Desktop**: sticky left sidebar nav + main content area.
- **Mobile**: hamburger drawer + horizontal scrollable pill nav.

The `mob` boolean prop is threaded into `FieldInput` and `ACField` to adjust padding and font sizes.

### React Compiler

The React Compiler is enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel`. Avoid manual `useMemo`/`useCallback` — the compiler handles memoization automatically.

## Deployment

The app is deployed to GitHub Pages at `/prd-creator/`. The Vite config sets `base: '/prd-creator/'` to match. The `deploy` script runs `gh-pages -d dist`.
