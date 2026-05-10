# Fattal Hotels — PRD Builder

A browser-based Product Requirements Document (PRD) creator for internal use at Fattal Hotels. PMs fill out a guided, multi-section form and export a formatted Word document (`.docx`) or plain text file — no backend required.

## What it does

Walks users through six PRD sections:

1. **Feature Brief** — name, what/why/who
2. **User Stories & AC** — "As a / I want to / So that" format with Given/When/Then acceptance criteria
3. **Edge Cases** — scenario, expected behavior, error message
4. **Technical Notes** — API endpoints, DB/schema changes, third-party integrations
5. **Out of Scope** — explicit exclusions for the release
6. **Design Links** — Figma URL and screen names

Exports produce a styled Word document branded for Fattal Hotels, or a plain `.txt` file.

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

## Build & deploy

```bash
npm run build    # outputs to dist/
npm run deploy   # builds and pushes to gh-pages branch
```

## Intended audience

Internal — PM + Tech Lead sign-off required before development starts.
