# Action 01 — scan

Detect legacy JS/TS patterns, version gaps, and deprecated APIs. Emit a structured manifest for `02-migrate`.

## Process

### Step 1 — Read project manifests

Read `package.json`:
- `engines.node` — target Node version
- `type` field — `"module"` (ESM) or absent/`"commonjs"`
- Dependency versions: Vue, Nuxt, Vite, TypeScript, Vuex, Pinia

Read `tsconfig.json` if present:
- `target` — ES version
- `strict` mode status

Read `.nvmrc` or `.node-version` if present.

### Step 2 — Load version references

Load the applicable reference documents before scanning:

@../references/js-versions.md
@../references/vue-migration.md
@../references/typescript-strictness.md

### Step 3 — Classify migration axes

Determine which axes apply based on detected versions. Use the loaded references to identify patterns.

| Axis | Trigger |
|---|---|
| ES5→Modern JS | `var`, callbacks, `prototype` patterns detected |
| CommonJS→ESM | `require()` in files when `"type": "module"` present or target is ESM |
| Vue 2→3 | `vue` version < 3 OR Options API + `vuex` detected |
| Vuex→Pinia | `vuex` in dependencies |
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

## Test

Invoke on a Vue 2 or mixed-JS project; verify the manifest lists migration axes with file counts and flags breaking changes before proceeding.
