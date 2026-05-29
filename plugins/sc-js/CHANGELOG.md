# Changelog — sc-js

## [0.6.5] — 2026-05-29

### sniff

- **`02-install-pivots` — explicit no-op output.** No longer prints `✅ pivots installed` when nothing was written. New headers: `nothing to install` (no applicable perf/data pivot, e.g. vanilla web) and `pivots up-to-date` (all already current).
- **ESLint detection** — `eslint` in devDependencies now maps to the new `tools/eslint.md` pivot, restoring symmetry with Biome (the dominant linter was previously sunk into the tooling/infra bucket).
- **`01-scan` Step 6 — companion-package dedup.** Satellites of an already-covered pivot (e.g. `@vitest/coverage-v8` under `tools/vitest.md`, `@eslint/js`/`globals` under `tools/eslint.md`, `playwright-core` under `tools/playwright.md`) are dropped instead of re-listed as gaps.

### New capability pivot

- **`tools/eslint.md`** — flat config (ESLint 9+), `@eslint/js`/`globals`, CI (`--max-warnings=0`), Prettier coexistence, anti-patterns.

## [0.6.4] — 2026-05-29

### sniff

- **`01-scan` Step 6 — gaps sorted into three buckets.** Capability gaps (pivot candidates) are still listed exhaustively; tooling/infra (build systems, dev servers, test runners, env loaders, DOM emulators) is condensed one line per family; private/workspace packages are **excluded** by scope-matching the project's own `@scope/` (plus `workspace:`/`file:`/`link:` deps). Stops internal monorepo packages and build tooling from drowning out the actionable signal.
- **`01-scan` Step 3 — "Vanilla web (no JS framework)" is now a formal classification.** No more improvised labels like "Gulp SPA": Gulp/BrowserSync are named as build/dev tooling for context only, and the absence of a vanilla perf pivot is documented as expected, not a defect.
- **Vitest detection** — `vitest` in devDependencies now maps to the new `tools/vitest.md` pivot instead of being reported as a gap (parity with the existing Playwright/Biome tooling pivots).
- **Closing-summary constraint** — any free-text summary must not call something a "gap" if it appears in the pivot manifeste; the structured manifeste is authoritative.

### New capability pivot

- **`tools/vitest.md`** — Vitest config, `@vitest/coverage-v8` thresholds, CI (`vitest run`) vs watch modes, anti-patterns.

## [0.6.3] — 2026-05-28

- **Alpine.js component pivot** (`components/alpine-x-data.md`) and **Express MVC pivot** (`server/express-mvc.md`) added, with detection wired into `sniff`.
- **`01-scan` Step 5 — invented pivots forbidden.** A pivot path is only added to the manifeste after verifying the file physically exists in the plugin; otherwise the capability is reported as a gap.

## [0.6.2] — 2026-05-28

- **`01-scan` Step 5 — pivots decided from `package.json` only**, never by inspecting source files. The sniff maps what is available; `/sc-js:audit` decides whether a pattern is missing or misused.
- **`/sc-js:audit` fixes** — all applicable pivots reported as covered, fixed severity scale, and a score with explicit breakdown.

## [0.6.1] — 2026-05-28

- **Playwright perf pivot** (`tools/playwright.md`) + detection — Core Web Vitals measurement, network/CPU throttling, trace capture, Lighthouse integration.
- **`01-scan` Step 2 — `node` runtime for pure backends** (Fastify/Express/Koa/NestJS with no frontend framework) — avoids applying browser-specific pivots to Node.js APIs.
- **`01-scan` Step 3 — SvelteKit adapter detection** (reads `svelte.config.*`) and **Step 6 — exhaustive gaps** that no longer go silent between runs.

## [0.6.0] — 2026-05-28

- **SvelteKit perf pivot** (`perf/sveltekit.md`) with `ssr/storage-guards.md`, adapter-static vs adapter-node guidance.
- **Svelte stores pivot** (`state/svelte-stores.md`) — writable/derived/readable, auto-subscription, anti-patterns.
- **Biome pivot** (`tools/biome.md`) — config, CI (`biome ci`), pre-commit, anti-patterns.
- All three wired into `sniff` (and `improve`) detection.

## [0.5.6] — 2026-05-28

- **`legacy` skill** — added Svelte 4→5 runes and SvelteKit 1→2 migration references.

## [0.5.5] — 2026-05-28

- **`improve` Step 1.5** — wired 5 previously-missing capability pivots, added SvelteKit detection.

## [0.5.4] — 2026-05-28

- **`improve` Step 1.5** — load applicable capability pivots so stack-specific anti-patterns are checked during improvement.

## [0.5.3] — 2026-05-28

- **TypeScript capability pivot** (`typescript.md`) — detected in `sniff`, guarded in `improve`.

## [0.5.2] — 2026-05-28

- **Guard against installing capability rules** — reinforces the 0.4.0 contract that capability pivots are read from the plugin at audit time, never written to the project.

## [0.5.1] — 2026-05-28

- **`legacy` skill references** added (migration knowledge files).

## [0.5.0] — 2026-05-28

- **New skills: `improve`, `legacy`, `teach`.** `improve` applies stack-specific fixes, `legacy` handles framework migrations, `teach` explains JS patterns.

## [0.4.0] — 2026-05-28

### Breaking changes

- **sniff no longer installs capability rules to `.claude/rules/capabilities/`**. In 0.3.0, `sniff` would write files like `.claude/rules/capabilities/state/pinia.md` to the project. In 0.4.0, those files are loaded from the plugin at audit time — never installed.
- **`skills/setup` removed**. The install-all setup skill is gone. Use `sniff` (detector) and `audit` (code review) instead.
- **`02-sync` action renamed to `02-install-pivots`**. Scope is now restricted to perf and data pivots only.

### New features

- **`/sc-js:audit`** — new skill that detects the project stack, loads applicable JS capability pivots from the plugin, and delegates a structured code review to `aidd-dev:reviewer`. Zero file writes.
- **`03-clean` migration action** — opt-in migration tool to remove orphaned `.claude/rules/capabilities/*` files left by sc-js 0.3.0. Safe: only deletes files whose content matches the plugin reference exactly (content-match guard). Invoke explicitly with `/sc-js:sniff clean`.

### Preserved

- Perf pivots (`perf-pivots-*.md`) and data pivots (`data-pivots-*.md`) are still installed to `.claude/rules/07-quality/` by `02-install-pivots`. The `web-optimize` and `data-optimize` contract is unchanged.

### Migration from 0.3.0

1. Reload the plugin (Claude Code: `/reload-plugins`)
2. Run `/sc-js:sniff` on your project — emits pivot manifeste and installs perf/data pivots as before
3. Optionally clean up orphaned capability rules: `/sc-js:sniff clean --dry-run` to preview, then `/sc-js:sniff clean` to delete

If you have manually edited any `.claude/rules/capabilities/` file, `03-clean` will detect the content mismatch and skip it — your edits are safe.

## [0.3.0]

Capability-based rules: sniff detects runtime/framework/ORMs and installs matching coding rules.

## [0.2.0]

Flat rule files install model.
