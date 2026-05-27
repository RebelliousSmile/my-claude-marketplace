# Action 02 — sync

Install missing rules and update outdated ones identified by `01-scan`.

## Process

Read the manifest emitted by `01-scan`. For each rule file listed:

### MISSING files — install

1. Read the corresponding reference file from the plugin's `references/` directory (path listed in the manifest)
2. Write it verbatim to the target path in `.claude/rules/` of the current project
3. Create parent directories as needed (`mkdir -p` equivalent)

### OUTDATED files — update

1. Read the corresponding reference file from the plugin's `references/` directory
2. Overwrite the existing target file with the updated content
3. Do not ask for confirmation — overwrite silently

### UP-TO-DATE files — skip

Do not write. Do not read again. Skip entirely.

## Reference mapping

### Coding rules (always required)

| Reference file | Target path |
|---|---|
| `references/00-shared-component-scope.md` | `.claude/rules/00-architecture/00-shared-component-scope.md` |
| `references/03-icons.md` | `.claude/rules/03-frameworks-and-libraries/03-icons.md` |
| `references/03-image-optimization.md` | `.claude/rules/03-frameworks-and-libraries/03-image-optimization.md` |
| `references/03-pinia.md` | `.claude/rules/03-frameworks-and-libraries/03-pinia.md` |
| `references/3-nitro-plugin-imports.md` | `.claude/rules/03-frameworks-and-libraries/3-nitro-plugin-imports.md` |
| `references/3-vite-dynamic-imports.md` | `.claude/rules/03-frameworks-and-libraries/3-vite-dynamic-imports.md` |
| `references/03-design-system.md` | `.claude/rules/06-design-patterns/03-design-system.md` |
| `references/07-async-components-marketing.md` | `.claude/rules/07-quality/07-async-components-marketing.md` |
| `references/07-preconnect-strategy.md` | `.claude/rules/07-quality/07-preconnect-strategy.md` |
| `references/7-css-transitions.md` | `.claude/rules/07-quality/7-css-transitions.md` |

### Perf pivots (conditional on detected framework)

| Condition | Reference file | Target path |
|---|---|---|
| Nuxt detected | `references/07-perf-pivots-nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| Vue SPA detected | `references/07-perf-pivots-vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| Vite hybrid detected | `references/07-perf-pivots-vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| Alpine.js detected | `references/07-perf-pivots-alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| Astro or 11ty detected | `references/07-perf-pivots-static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |
| Nuxt or Vue detected | `references/07-perf-storage-ssr.md` | `.claude/rules/07-quality/perf-storage-ssr.md` |

### Data pivots (conditional on detected ORM)

| Condition | Reference file | Target path |
|---|---|---|
| Prisma detected | `references/08-data-pivots-prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| Drizzle detected | `references/08-data-pivots-drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| TypeORM / Sequelize detected | `references/08-data-pivots-typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| Mongoose detected | `references/08-data-pivots-mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| GraphQL detected | `references/08-data-pivots-graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| tRPC detected | `references/08-data-pivots-trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

## Output

After all operations, report:

```
✅ sc-js sniff — sync complete

  Installed (5):
    + .claude/rules/03-frameworks-and-libraries/03-icons.md
    + .claude/rules/07-quality/perf-pivots-nuxt.md
    + .claude/rules/07-quality/perf-storage-ssr.md
    + .claude/rules/07-quality/data-pivots-prisma.md
    + .claude/rules/07-quality/data-pivots-trpc.md
  Updated (1):
    ↺ .claude/rules/03-frameworks-and-libraries/03-pinia.md
  Skipped — already up-to-date (X):
    - .claude/rules/00-architecture/00-shared-component-scope.md
    ...
```
