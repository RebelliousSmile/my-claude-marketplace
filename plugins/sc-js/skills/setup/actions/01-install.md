# Action 01 — install

Write all JavaScript capability rule files to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path. Create parent directories as needed.

### Capability rules

| Reference file | Target path |
|---|---|
| `references/capabilities/components/shared-scope.md` | `.claude/rules/capabilities/components/shared-scope.md` |
| `references/capabilities/state/pinia.md` | `.claude/rules/capabilities/state/pinia.md` |
| `references/capabilities/state/alpine-store.md` | `.claude/rules/capabilities/state/alpine-store.md` |
| `references/capabilities/code-splitting/dynamic-import.md` | `.claude/rules/capabilities/code-splitting/dynamic-import.md` |
| `references/capabilities/code-splitting/defineAsyncComponent.md` | `.claude/rules/capabilities/code-splitting/defineAsyncComponent.md` |
| `references/capabilities/styling/design-system.md` | `.claude/rules/capabilities/styling/design-system.md` |
| `references/capabilities/styling/css-transitions.md` | `.claude/rules/capabilities/styling/css-transitions.md` |
| `references/capabilities/icons/lucide-vue.md` | `.claude/rules/capabilities/icons/lucide-vue.md` |
| `references/capabilities/icons/svg-inline.md` | `.claude/rules/capabilities/icons/svg-inline.md` |
| `references/capabilities/images/web-optimization.md` | `.claude/rules/capabilities/images/web-optimization.md` |
| `references/capabilities/networking/preconnect.md` | `.claude/rules/capabilities/networking/preconnect.md` |
| `references/capabilities/server/nitro-imports.md` | `.claude/rules/capabilities/server/nitro-imports.md` |
| `references/capabilities/ssr/storage-guards.md` | `.claude/rules/capabilities/ssr/storage-guards.md` |

### Perf pivots (consumed by `web-optimize`)

| Reference file | Target path |
|---|---|
| `references/capabilities/perf/nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| `references/capabilities/perf/vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| `references/capabilities/perf/vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| `references/capabilities/perf/alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| `references/capabilities/perf/static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/capabilities/data/prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| `references/capabilities/data/drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| `references/capabilities/data/typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| `references/capabilities/data/mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| `references/capabilities/data/graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| `references/capabilities/data/trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

## Output

After all files are written, confirm:

```
✅ sc-js rules installed — 24 files written to .claude/rules/

  Capability rules (13):
    + .claude/rules/capabilities/components/shared-scope.md
    + .claude/rules/capabilities/state/pinia.md
    + .claude/rules/capabilities/state/alpine-store.md
    + .claude/rules/capabilities/code-splitting/dynamic-import.md
    + .claude/rules/capabilities/code-splitting/defineAsyncComponent.md
    + .claude/rules/capabilities/styling/design-system.md
    + .claude/rules/capabilities/styling/css-transitions.md
    + .claude/rules/capabilities/icons/lucide-vue.md
    + .claude/rules/capabilities/icons/svg-inline.md
    + .claude/rules/capabilities/images/web-optimization.md
    + .claude/rules/capabilities/networking/preconnect.md
    + .claude/rules/capabilities/server/nitro-imports.md
    + .claude/rules/capabilities/ssr/storage-guards.md
  Perf pivots (5):
    + .claude/rules/07-quality/perf-pivots-nuxt.md
    + .claude/rules/07-quality/perf-pivots-vue-spa.md
    + .claude/rules/07-quality/perf-pivots-vite.md
    + .claude/rules/07-quality/perf-pivots-alpine.md
    + .claude/rules/07-quality/perf-pivots-static.md
  Data pivots (6):
    + .claude/rules/07-quality/data-pivots-prisma.md
    + .claude/rules/07-quality/data-pivots-drizzle.md
    + .claude/rules/07-quality/data-pivots-typeorm.md
    + .claude/rules/07-quality/data-pivots-mongoose.md
    + .claude/rules/07-quality/data-pivots-graphql.md
    + .claude/rules/07-quality/data-pivots-trpc.md
```
