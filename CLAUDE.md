# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state of this repository

This repo is a bare `create-next-app` scaffold — the dependencies, TypeScript, Tailwind, and PostCSS
config are all in place, but **no application source code has been committed yet**. There is no
`pages/`, `app/`, `src/`, or `components/` directory in git. Before assuming any existing routes,
components, or API handlers exist, run `git ls-files` to confirm — the file tree below is the
entire tracked repo.

Because of this, most changes here will be *creating* the initial app structure rather than
modifying existing code. Decide the router style (Pages vs. App Router) based on the config hints
below and stay consistent once you pick one.

## Commands

Install dependencies first (no lockfile-driven CI is configured, so just use npm):

```bash
npm install
```

- `npm run dev` — start the Next.js dev server at http://localhost:3000
- `npm run build` — production build (`next build`)
- `npm run start` — serve the production build (`next build` must run first)
- `npm run lint` — `next lint` (ESLint via `eslint-config-next`)

There is no test script, test runner, or test files in this repo. If you add tests, wire up a
`test` script in `package.json` and document how to run a single test here.

`next lint` has no `.eslintrc*` file checked in yet — the first run will prompt interactively to
generate one (choose "Strict" to match `eslint-config-next`'s defaults). Add the generated config
to git once created.

## Architecture notes and conflicting config

- **Router style is ambiguous.** `tsconfig.json` defines a `@/*` → `./src/*` path alias, and
  `tailwind.config.ts` scans `./src/pages`, `./src/components`, and `./src/app` — i.e. it hedges
  across Pages Router, App Router, and a `src/` layout simultaneously. `build-manifest.json`
  (a stale build artifact, see below) shows `/`, `/_app`, `/_error` entries, implying the project
  was previously using the **Pages Router** (`pages/index.tsx`, `pages/_app.tsx`) as described in
  `README.md`. When adding the first routes, put them under `src/pages/` to match the `@/*` alias
  and Tailwind's content globs, unless you deliberately migrate to the App Router (in which case
  update `tailwind.config.ts`'s content globs and `tsconfig.json` accordingly).
- **Duplicate Tailwind/PostCSS configs exist and disagree.** Both `tailwind.config.js` (CommonJS,
  empty `content: []`) and `tailwind.config.ts` (TypeScript, real content globs + theme tokens) are
  checked in, as are both `postcss.config.js` (`tailwindcss` + `autoprefixer`) and
  `postcss.config.mjs` (`tailwindcss` only). Next.js/Tailwind will only load one of each pair at
  runtime. Before relying on Tailwind classes actually applying, resolve this by deleting the
  stale `.js` variants (the `.ts`/`.mjs` versions are the more complete/current ones) rather than
  editing both in parallel.
- **Stray build artifacts are committed at the repo root.** `build-manifest.json`,
  `react-loadable-manifest.json`, and `trace` are normally generated inside `.next/` (which *is*
  gitignored) but here they were committed at the top level instead, from an old
  `next dev`/`next build` run. They are not used by the app and are safe to delete; don't treat
  their contents (e.g. the `/_app`, `/_error` page list) as a spec for the current app — they only
  reflect whatever pages existed at the time they were generated.
- **Styling**: `tailwind.config.ts` defines `background`/`foreground` theme colors sourced from CSS
  variables (`var(--background)`, `var(--foreground)`) — define those variables in a global
  stylesheet (e.g. `src/app/globals.css` or `src/pages/_app`'s imported CSS) when scaffolding pages.
- **TypeScript**: `strict: true`, `moduleResolution: "bundler"`, `jsx: "preserve"` — standard
  Next.js 14 App/Pages-compatible config, no deviations from `create-next-app` defaults.
