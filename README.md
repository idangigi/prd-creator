# Fattal Hotels — PRD Builder

A browser-based Product Requirements Document (PRD) creator for internal use at Fattal Hotels. PMs fill out a guided, multi-section form and export a formatted Word document (`.docx`) or plain text file — no backend required.

## What it does

Walks users through seven PRD sections:

1. **Feature Brief** — name, what/why/who
2. **User Stories & AC** — "As a / I want to / So that" with Given/When/Then acceptance criteria, plus optional reference images per story
3. **Edge Cases** — scenario, expected behavior, error message
4. **Technical Notes** — API endpoints, DB/schema changes, third-party integrations
5. **Project Scope** — what's included in the release
6. **Design Links** — Figma URL and screen names
7. **Reference Files** — attachments (PDF, DOCX, images, etc.) kept in browser memory for the session

Exports produce a styled Word document branded for Fattal Hotels, or a plain `.txt` file. The UI is bilingual (English / Hebrew with RTL).

## Tech stack

- **React 19** + **TypeScript** — single-page app, no routing
- **Vite** — dev server and build
- **docx** — client-side `.docx` generation
- **React Compiler** — automatic memoization via `babel-plugin-react-compiler`
- **GitHub Pages** — deployed at `/prd-creator/`

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/prd-creator/`.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # ESLint across all .ts/.tsx files
npm run preview   # Serve the dist/ build locally
npm run deploy    # Build and push to gh-pages branch
```

## Project structure

The app separates presentational ("dumb") components from logic. Each component lives in its own file under `src/components/`, grouped by role. State and mutations live in `src/hooks/usePRDData.ts`; `App.tsx` is a thin orchestrator that wires the hook to the UI.

```
src/
├── App.tsx                              # Orchestrator: composes layout + sections
├── main.tsx
├── types/prd.ts                         # PRDData, Story, AC, SectionDef, ...
├── constants/
│   ├── designTokens.ts                  # Color palette + breakpoint
│   └── translations.ts                  # EN / HE dictionary
├── config/sections.ts                   # The seven section definitions
├── utils/
│   ├── formatFileSize.ts
│   ├── initData.ts                      # Empty-state factories
│   └── validation.ts                    # Required-field checks
├── services/
│   ├── exportDocx.ts                    # docx generation + download
│   └── exportTxt.ts                     # Plain-text export
├── hooks/
│   ├── usePRDData.ts                    # State + all update handlers
│   ├── useResponsive.ts                 # isMobile via window resize
│   └── useClickOutside.ts
└── components/
    ├── icons/                           # One SVG per file
    ├── buttons/Button.tsx               # Variant + size system
    ├── inputs/
    │   ├── FormFieldInput.tsx           # Label + input/textarea + char counter
    │   ├── AcceptanceCriterionField.tsx # Given/When/Then row
    │   └── ImageLabelInput.tsx
    ├── header/
    │   ├── AppHeader.tsx                # Composes the three below + progress
    │   ├── LanguageToggle.tsx
    │   ├── ExportMenu.tsx
    │   └── ProgressBar.tsx
    ├── navigation/
    │   ├── DesktopSidebarNav.tsx
    │   ├── MobileDrawerNav.tsx
    │   ├── MobilePillNav.tsx
    │   └── SectionFooterNav.tsx
    └── sections/
        ├── SectionCard.tsx              # Card wrapper with title + note
        ├── StaticFieldsSection.tsx      # Renders FieldDef[]
        ├── DynamicListSection.tsx       # Add/remove list of items
        ├── DynamicItemCard.tsx
        ├── UserStoriesSection.tsx
        ├── StoryCard.tsx
        ├── AcceptanceCriterionList.tsx
        ├── StoryImagesGrid.tsx
        ├── StoryImageThumbnail.tsx
        ├── ReferenceFilesSection.tsx
        ├── FileDropZone.tsx
        └── FileListItem.tsx
```

### How a section is rendered

`config/sections.ts` declares each section as one of three modes:

- **Static fields** — `fields[]` array → `StaticFieldsSection` renders `FormFieldInput` per field, keyed directly on `PRDData`.
- **Dynamic lists** — `dynamic: true` → `DynamicListSection` renders an add/remove list of `DynamicItemCard`s. `minItems` enforces the lower bound; `prefix` controls the label (`EC-01`, `Item 01`, ...).
- **Special** — `isStories: true` renders `UserStoriesSection` (nested `Story → AC[]` with images); `isFiles: true` renders `ReferenceFilesSection`.

### Validation

`utils/validation.ts` walks the section list and produces an `ErrorMap` keyed by path (`fieldId`, `sectionId_index_fieldId`, `story_si_field`, `ac_si_ai_field`). Validation runs on export attempt — on failure, the first section with errors becomes active and inline errors appear.

### Styling

All styles are inline `React.CSSProperties`. The `C` token map in `constants/designTokens.ts` holds the colour palette. No CSS framework. The `mob` boolean threaded into components adjusts padding and font sizes for the mobile layout (breakpoint: `window.innerWidth < 820`).

### React Compiler

The React Compiler is enabled, so avoid manual `useMemo` / `useCallback` — the compiler handles memoization automatically.

## Deployment

The app is deployed to GitHub Pages at `/prd-creator/`. The Vite config sets `base: '/prd-creator/'` to match. The `deploy` script runs `gh-pages -d dist`.

## Intended audience

Internal — PM + Tech Lead sign-off required before development starts.
