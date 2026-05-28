# Action 02 — migrate

Apply upgrade transformations file by file based on the manifest from `01-scan`.

## Process

### Step 1 — Confirm breaking changes

For any breaking change flagged in the manifest, show:
- The current code snippet
- The required transformation
- The risk (runtime behavior change)

Ask for confirmation before proceeding. Do not apply breaking changes without explicit user approval.

### Step 2 — Apply transformations per axis

Process axes in dependency order:
1. CommonJS→ESM first (affects import resolution)
2. TypeScript strictness (affects type inference)
3. Vuex→Pinia (must complete before Vue 2→3 component migration)
4. Vue 2→3 Composition API (last — depends on store migration)
5. ES5→Modern JS (safe, apply throughout)

For each file:
- Read the file
- Apply all applicable transformations for the current axis
- Write the file
- Report the change

### Step 3 — Post-migration checks

After all transformations:
- Run `grep -r "require(" src/` to verify no CommonJS remains (if ESM axis applied)
- Run `grep -r "this\.\$store" src/` to verify no Vuex references remain (if Pinia axis applied)
- Run `grep -r "export default {" src/` to count remaining Options API components

## Output

```
✅ sc-js legacy — migration complete

Axis: Vuex → Pinia
  src/stores/user.js    → src/stores/user.ts   (converted)
  src/stores/cart.js    → src/stores/cart.ts   (converted)
  src/stores/auth.js    → src/stores/auth.ts   (converted)

Axis: Vue 2 → Composition API (12 files)
  src/components/UserCard.vue    (migrated)
  src/components/Header.vue      (migrated)
  ...

Post-migration checks:
  require() remaining:      0 ✅
  $store references:        0 ✅
  Options API remaining:    2 (skipped — flagged as intentional)
```

## Test

Invoke after `01-scan` with at least one migration axis; verify files are written, breaking changes were confirmed before application, and post-migration checks are reported.
