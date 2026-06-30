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

- **Feature-based structure:** `src/features/<feature>/` contains page, components, data, and hooks for each feature. Features: `spells`, `spellbooks`, `items`.
- **Naming convention:** All code identifiers (file names, directories, variables, types, functions) must be in English. No French words in code — even for D&D concepts (e.g. use `spellbook`, not `grimoire`).
- **UI components:** shadcn/ui (base-nova style) in `src/components/ui/`, using Tailwind v4 via `@tailwindcss/vite` plugin. Add new components with `npx shadcn add <name>`.
- **Path alias:** `@/` maps to `src/`.
- **i18n:** Custom lightweight system in `src/i18n/`. Translations live in `src/i18n/translations.ts`. Use `useLanguage()` hook for `lang` and `t()`. Default language is French.
- **Static data:** Per-feature JSON in `data/`, split into language-agnostic mechanics (`<feature>.json`) and translations (`<feature>.i18n.{en,fr}.json`). Parsed and merged at runtime in `src/features/<feature>/data/`.
- **Data sources:**
  - **Spells** (`spells.json`, `spells.i18n.{en,fr}.json`): scraped from aidedd.org (covers SRD + sourcebooks like PHB 2024, Forgotten Realms: Heroes of Faerûn, Eberron: Forge of the Artificer).
  - **Magic items** (`items.json`, `items.i18n.{en,fr}.json`): SRD 5.1 from [5e-bits/5e-database](https://github.com/5e-bits/5e-database) — `src/2014/en/5e-SRD-Magic-Items.json`. Reshape: top-level keyed by `index`; mechanics file holds `category`, `rarity`, `variant`, `variants`; i18n files hold `name`, `desc`. FR translations scraped from aidedd.org: parse the filter index at `https://www.aidedd.org/dnd-filters/objets-magiques.php` (matches EN names from the `colVO` column to our slugs via a small alias map for a handful of renamed items — Heward's Handy Haversack, Apparatus of Kwalish, etc.), then fetch each individual page `https://www.aidedd.org/dnd/om.php?vf=<fr-slug>` for `<div class='type'>` (header) and `<div class='description'>` (body). Variants inherit their parent's FR description (their EN name stays — aidedd has no per-variant entry).
- **Data ingestion:** Run reshape inline (one-shot) when refreshing data; do not check scripts into `scripts/`. Document the source URL and reshape rules in this file instead.
- **Table:** Uses `@tanstack/react-table` for the spell list with sorting and filtering.
