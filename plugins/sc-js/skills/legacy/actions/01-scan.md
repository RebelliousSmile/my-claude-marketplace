# Action 01 — scan

Detect legacy JS/TS patterns, version gaps, and deprecated APIs. Emit a structured manifest for `02-migrate`.

## Process

### Step 1 — Read project manifests

Read `package.json`:
- `engines.node` — target Node version
- `type` field — `"module"` (ESM) or absent/`"commonjs"`
- Dependency versions: Vue, Nuxt, Vite, TypeScript, Vuex, Pinia, Svelte, SvelteKit

Read `tsconfig.json` if present:
- `target` — ES version
- `strict` mode status

Read `.nvmrc` or `.node-version` if present.

### Step 2 — Load version references

Load the applicable reference documents before scanning:

@../references/js-versions.md
@../references/vue-migration.md
@../references/svelte-migration.md
@../references/typescript-strictness.md

### Step 3 — Classify migration axes

Determine which axes apply based on detected versions. Use the loaded references to identify patterns.

| Axis | Trigger |
|---|---|
| ES5→Modern JS | `var`, callbacks, `prototype` patterns detected |
| CommonJS→ESM | `require()` in files when `"type": "module"` present or target is ESM |
| Vue 2→3 | `vue` version < 3 OR Options API + `vuex` detected |
| Vuex→Pinia | `vuex` in dependencies |
| Svelte 4→5 Runes | `svelte` version ≥ 5 detected AND `$:` or `export let` or `on:` directives present in `.svelte` files |
| SvelteKit 1→2 | `@sveltejs/kit` version ≥ 2 detected AND `return redirect(` or `$app/stores` usage present |
| TypeScript strictness | `strict: false` or absent in `tsconfig.json` |
| Nuxt 2→3 | `nuxt` version < 3 detected |

### Step 4 — Scan codebase per axis

For each active axis, apply the detection patterns from the reference documents. Flag every occurrence with file and line.

### Step 5 — Emit manifest

```
📋 sc-js legacy — scan manifest

Current: Vue 2.7 + Vuex 4 + TypeScript 4.9 (non-strict)
Target:  Vue 3.4 + Pinia 2 + TypeScript 5.3 (strict)

Migration axes (N total):
  ✅ Vue 2→3 Composition API   12 files affected
  ✅ Vuex→Pinia                 3 store files
  ✅ TypeScript strictness       tsconfig.json + 8 files with implicit any
  ⬜ CommonJS→ESM               not applicable (already ESM)

Breaking changes requiring confirmation:
  - filters removed in Vue 3 (4 usages in 2 files)
  - $listeners merged into $attrs (2 usages)

→ proceed to 02-migrate? (y/n)
```

Svelte example:

```
📋 sc-js legacy — scan manifest

Current: Svelte 5.0 + SvelteKit 2.0 (pre-runes components)
Target:  Svelte 5 (runes mode) + SvelteKit 2

Migration axes (N total):
  ✅ Svelte 4→5 Runes           18 files — $: (34), export let (27), on: (41)
  ✅ SvelteKit 1→2              2 files — return redirect() (3 usages)
  ⬜ TypeScript strictness       not applicable (strict already enabled)

Breaking changes requiring confirmation:
  - on: modifier syntax (on:click|once) — 2 usages, must rewrite manually
  - Slots → Snippets — 5 components with named slots (parent + child must migrate together)

→ proceed to 02-migrate? (y/n)
```

## Test

Invoke on a Vue 2 or mixed-JS project; verify the manifest lists migration axes with file counts and flags breaking changes before proceeding.
