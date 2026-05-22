# Vue — obsolescence detection patterns

Extensions: `.vue`

---

## Detector A — Import extraction

Vue SFCs (Single-File Components) use JavaScript/TypeScript imports in the `<script>` or `<script setup>` block. Apply the TypeScript patterns if `lang="ts"`, JavaScript patterns otherwise.

```regex
# Extract <script> block first
<script(?:\s+setup)?(?:\s+lang=["']ts["'])?\s*>([\s\S]*?)<\/script>
```

Then apply `@../references/lang-typescript.md` or `@../references/lang-javascript.md` import patterns on the extracted block.

**Additional: component auto-imports** — if the project uses Nuxt or `unplugin-vue-components`, some components are auto-imported and won't appear as explicit imports. Skip "missing import" findings for PascalCase component names matching the auto-import directories (`components/`, `pages/`, configured dirs in `nuxt.config.ts` or `vite.config.ts`).

---

## Detector B — Symbol declaration patterns

### Component name

```regex
# Options API
name:\s*['"](\w+)['"]

# defineComponent with name
defineComponent\(\{\s*name:\s*['"](\w+)['"]

# File-based name (fallback)
# Use the filename (PascalCase) if no explicit name
```

### Composable / function declarations in `<script setup>`

Apply TypeScript `const` / `function` patterns on the `<script setup>` block.

### Props and emits

```regex
# defineProps
defineProps<\{([^}]+)\}>
defineProps\(\{([^}]+)\}\)

# defineEmits
defineEmits<\{([^}]+)\}>
defineEmits\(\[([^\]]+)\]\)
```

Props and emits are not cross-referenced externally — flag only if a prop type references a non-existent imported type.

---

## Detector — Template references

Scan the `<template>` block for:

```regex
# Component usage (PascalCase or kebab-case)
<([A-Z]\w+|[a-z]+-[a-z-]+)
```

For each component used, check:
1. Is it explicitly imported in `<script>`?
2. Is it auto-imported (see above)?
3. If neither → Finding type: `Missing component`; suggested action: `Import or register component`.

---

## Notes

- `<style>` blocks: apply CSS-specific grep for rule violations (see `.claude/rules/` with `paths: **/*.vue`).
- Composition API `ref`, `computed`, `watch`, `onMounted` etc. — these are Vue built-ins, never flag as missing.
- Pinia / Vuex store usage: `useStore()`, `useSomeStore()` — grep in `stores/` or `store/` for the corresponding `defineStore`.
