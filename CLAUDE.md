# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint`
- **Preview prod build:** `npm run preview`

No test framework is configured.

## Architecture

React 19 + TypeScript + Vite SPA for browsing D&D spells with filtering, search, and EN/FR i18n.

### Key patterns

- **Feature-based structure:** `src/features/<feature>/` contains page, components, data, and hooks for each feature. Currently only `spells`.
- **UI components:** shadcn/ui (base-nova style) in `src/components/ui/`, using Tailwind v4 via `@tailwindcss/vite` plugin. Add new components with `npx shadcn add <name>`.
- **Path alias:** `@/` maps to `src/`.
- **i18n:** Custom lightweight system in `src/i18n/`. Translations live in `src/i18n/translations.ts`. Use `useLanguage()` hook for `lang` and `t()`. Default language is French.
- **Spell data:** Static JSON in `data/` (mechanics in `spells.json`, translations in `spells.i18n.{en,fr}.json`). Parsed and merged at runtime in `src/features/spells/data/`.
- **Data scraping:** Python scripts in `scripts/` for fetching/parsing spell data from HTML sources. Not part of the build pipeline.
- **Table:** Uses `@tanstack/react-table` for the spell list with sorting and filtering.
