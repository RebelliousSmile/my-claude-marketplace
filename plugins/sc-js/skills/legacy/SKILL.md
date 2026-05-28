---
name: legacy
model: sonnet
description: >-
  Scans JavaScript/TypeScript code for outdated patterns and deprecated APIs,
  then proposes a migration plan. Handles ES5 remnants (var, callbacks, prototype
  patterns), CommonJS→ESM migration, Vue 2→3 (Options API → Composition API,
  Vuex → Pinia), TypeScript strictness evolution, and framework version migrations
  (Nuxt 2→3, Vite config updates).
  Use when the user says "modernize", "upgrade to Vue 3", "migrate to ESM",
  "this uses old JS", "remove Vuex", "this is Vue 2 code", or when deprecated
  patterns appear in the codebase.
  Do NOT use for dependency management (npm/pnpm), performance optimization
  (web-optimize), or general refactoring unrelated to version compatibility.
---

# sc-js Legacy

Detects version-specific and deprecated patterns in the JS/TS codebase, then produces a migration plan and applies changes file by file.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect legacy patterns and version gaps | path, target version/framework |
| 02 | `migrate` | Apply upgrade transformations | scan manifest, direction |

## Default flow

Always sequential: `scan` → `migrate`.

1. `scan` reads `package.json`, `tsconfig.json`, and source files; detects current and target versions; finds deprecated/missing patterns; emits a structured manifest
2. `migrate` reads the manifest and applies transformations file by file

## References

- `references/js-versions.md` — ES version change tables (ES5→ES2024, CommonJS→ESM)
- `references/vue-migration.md` — Vue 2→3, Vuex→Pinia, Nuxt 2→3 breaking changes
- `references/typescript-strictness.md` — TS strict flags and version-specific features

## Transversal rules

- Always detect current framework/library versions from `package.json` before scanning.
- Never remove a working pattern without providing its replacement inline.
- For breaking changes: show a diff of what will change and ask for confirmation before writing.
- Vue 2→3 migrations: check for Vuex before removing — must migrate to Pinia first.
- Never touch files under `node_modules/` or `.nuxt/`.
- CommonJS→ESM: verify `"type": "module"` in `package.json` before converting `require()`.
