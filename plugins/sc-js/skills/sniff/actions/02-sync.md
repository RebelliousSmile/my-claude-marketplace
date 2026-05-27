# Action 02 — sync

Install missing rules and update outdated ones identified by `01-scan`.

## Process

Read the manifest emitted by `01-scan`. For each rule file listed:

### MISSING files — install

1. Read the corresponding reference file from the plugin's `references/` directory (path listed in the manifest)
2. Write it verbatim to the target path in `.claude/rules/` of the current project
3. Create parent directories as needed

### OUTDATED files — update

1. Read the corresponding reference file from the plugin's `references/` directory
2. Overwrite the existing target file with the updated content
3. Do not ask for confirmation — overwrite silently

### UP-TO-DATE files — skip

Do not write. Do not read again. Skip entirely.

### NOT-APPLICABLE files — skip

Do not write. Do not remove if already present. Skip entirely.

## Reference mapping

### Capability rules

| Reference | Target |
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

### Perf pivots (consumed by `web-optimize` — legacy target paths)

| Reference | Target |
|---|---|
| `references/capabilities/perf/nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| `references/capabilities/perf/vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| `references/capabilities/perf/vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| `references/capabilities/perf/alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| `references/capabilities/perf/static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |

### Data pivots (consumed by `data-optimize` — legacy target paths)

| Reference | Target |
|---|---|
| `references/capabilities/data/prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| `references/capabilities/data/drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| `references/capabilities/data/typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| `references/capabilities/data/mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| `references/capabilities/data/graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| `references/capabilities/data/trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

## Output

After all operations, report:

```
✅ sc-js sniff — sync complete

  Installed (10):
    + .claude/rules/capabilities/components/shared-scope.md
    + .claude/rules/capabilities/state/pinia.md
    + .claude/rules/capabilities/code-splitting/dynamic-import.md
    + .claude/rules/capabilities/code-splitting/defineAsyncComponent.md
    + .claude/rules/capabilities/styling/design-system.md
    + .claude/rules/capabilities/styling/css-transitions.md
    + .claude/rules/capabilities/icons/lucide-vue.md
    + .claude/rules/capabilities/images/web-optimization.md
    + .claude/rules/capabilities/networking/preconnect.md
    + .claude/rules/07-quality/perf-pivots-vue-spa.md
    + .claude/rules/07-quality/perf-pivots-vite.md
  Updated (0): —
  Not applicable (4):
    ✗ capabilities/server/nitro-imports.md (Nuxt not detected)
    ✗ capabilities/ssr/storage-guards.md (Nuxt not detected)
    ✗ capabilities/icons/svg-inline.md (Vue detected — use lucide-vue instead)
    ✗ 07-quality/data-pivots-*.md (no ORM detected)
  Skipped — already up-to-date (0): —

Gaps reported (no plugin rule):
  vue-router (routing)
```
