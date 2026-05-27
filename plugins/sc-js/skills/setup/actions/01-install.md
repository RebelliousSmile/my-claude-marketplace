# Action 01 — install

Write JavaScript ecosystem rule files (coding rules + perf pivots + data pivots) to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

### Coding rules

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

### Perf pivots (consumed by `web-optimize`)

| Reference file | Target path |
|---|---|
| `references/07-perf-pivots-nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| `references/07-perf-pivots-vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| `references/07-perf-pivots-vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| `references/07-perf-pivots-alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| `references/07-perf-pivots-static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |
| `references/07-perf-storage-ssr.md` | `.claude/rules/07-quality/perf-storage-ssr.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/08-data-pivots-prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| `references/08-data-pivots-drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| `references/08-data-pivots-typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| `references/08-data-pivots-mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| `references/08-data-pivots-graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| `references/08-data-pivots-trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

## Output

After all files are written, confirm:

```
✅ sc-js rules installed — 22 files written to .claude/rules/
  Coding rules (10):
    - .claude/rules/00-architecture/00-shared-component-scope.md
    - .claude/rules/03-frameworks-and-libraries/03-icons.md
    - .claude/rules/03-frameworks-and-libraries/03-image-optimization.md
    - .claude/rules/03-frameworks-and-libraries/03-pinia.md
    - .claude/rules/03-frameworks-and-libraries/3-nitro-plugin-imports.md
    - .claude/rules/03-frameworks-and-libraries/3-vite-dynamic-imports.md
    - .claude/rules/06-design-patterns/03-design-system.md
    - .claude/rules/07-quality/07-async-components-marketing.md
    - .claude/rules/07-quality/07-preconnect-strategy.md
    - .claude/rules/07-quality/7-css-transitions.md
  Perf pivots (6):
    - .claude/rules/07-quality/perf-pivots-nuxt.md
    - .claude/rules/07-quality/perf-pivots-vue-spa.md
    - .claude/rules/07-quality/perf-pivots-vite.md
    - .claude/rules/07-quality/perf-pivots-alpine.md
    - .claude/rules/07-quality/perf-pivots-static.md
    - .claude/rules/07-quality/perf-storage-ssr.md
  Data pivots (6):
    - .claude/rules/07-quality/data-pivots-prisma.md
    - .claude/rules/07-quality/data-pivots-drizzle.md
    - .claude/rules/07-quality/data-pivots-typeorm.md
    - .claude/rules/07-quality/data-pivots-mongoose.md
    - .claude/rules/07-quality/data-pivots-graphql.md
    - .claude/rules/07-quality/data-pivots-trpc.md
```
