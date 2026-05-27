# Action 01 — scan

Detect the JavaScript stack in the current project and audit `.claude/rules/` to determine which rules are missing or outdated.

## Process

### Step 1 — Read package.json

Read `package.json` from the project root. Parse `dependencies` and `devDependencies`.

If `package.json` is absent, abort:
```
❌ sc-js sniff — no package.json found
   Aborting.
```

### Step 2 — Classify framework

Evaluate the following signals to determine the primary JS framework. A project can match multiple.

| Signal (package.json key) | Framework |
|---|---|
| `nuxt` | Nuxt 3 |
| `vue` (without `nuxt`) | Vue SPA |
| `vite` (without `nuxt` and without `vue`) | Vite hybrid (e.g. Laravel + Vite) |
| `alpinejs` or `@alpinejs/core` | Alpine.js hybrid |
| `astro` | Astro static |
| `@11ty/eleventy` | 11ty static |

If nuxt is detected, also check for:
- `pinia` → Pinia state management detected
- SSR-capable → `perf-storage-ssr.md` required

### Step 3 — Classify ORMs and data libraries

| Signal (package.json key) | ORM / data layer |
|---|---|
| `prisma` or `@prisma/client` | Prisma |
| `drizzle-orm` | Drizzle ORM |
| `typeorm` or `sequelize` | TypeORM / Sequelize |
| `mongoose` | Mongoose (MongoDB) |
| `@apollo/server` or `graphql-yoga` or `mercurius` or `graphql` | GraphQL |
| `@trpc/server` | tRPC |

### Step 4 — Audit installed rules

#### Coding rules (always required — install regardless of framework)

| Rule file | Reference |
|---|---|
| `.claude/rules/00-architecture/00-shared-component-scope.md` | `references/00-shared-component-scope.md` |
| `.claude/rules/03-frameworks-and-libraries/03-icons.md` | `references/03-icons.md` |
| `.claude/rules/03-frameworks-and-libraries/03-image-optimization.md` | `references/03-image-optimization.md` |
| `.claude/rules/03-frameworks-and-libraries/03-pinia.md` | `references/03-pinia.md` |
| `.claude/rules/03-frameworks-and-libraries/3-nitro-plugin-imports.md` | `references/3-nitro-plugin-imports.md` |
| `.claude/rules/03-frameworks-and-libraries/3-vite-dynamic-imports.md` | `references/3-vite-dynamic-imports.md` |
| `.claude/rules/06-design-patterns/03-design-system.md` | `references/03-design-system.md` |
| `.claude/rules/07-quality/07-async-components-marketing.md` | `references/07-async-components-marketing.md` |
| `.claude/rules/07-quality/07-preconnect-strategy.md` | `references/07-preconnect-strategy.md` |
| `.claude/rules/07-quality/7-css-transitions.md` | `references/7-css-transitions.md` |

#### Perf pivots (conditional on detected framework)

| Required when | Rule file | Reference |
|---|---|---|
| Nuxt detected | `.claude/rules/07-quality/perf-pivots-nuxt.md` | `references/07-perf-pivots-nuxt.md` |
| Vue SPA detected | `.claude/rules/07-quality/perf-pivots-vue-spa.md` | `references/07-perf-pivots-vue-spa.md` |
| Vite hybrid detected | `.claude/rules/07-quality/perf-pivots-vite.md` | `references/07-perf-pivots-vite.md` |
| Alpine.js detected | `.claude/rules/07-quality/perf-pivots-alpine.md` | `references/07-perf-pivots-alpine.md` |
| Astro or 11ty detected | `.claude/rules/07-quality/perf-pivots-static.md` | `references/07-perf-pivots-static.md` |
| Nuxt or Vue detected | `.claude/rules/07-quality/perf-storage-ssr.md` | `references/07-perf-storage-ssr.md` |

#### Data pivots (conditional on detected ORM)

| Required when | Rule file | Reference |
|---|---|---|
| Prisma detected | `.claude/rules/07-quality/data-pivots-prisma.md` | `references/08-data-pivots-prisma.md` |
| Drizzle detected | `.claude/rules/07-quality/data-pivots-drizzle.md` | `references/08-data-pivots-drizzle.md` |
| TypeORM / Sequelize detected | `.claude/rules/07-quality/data-pivots-typeorm.md` | `references/08-data-pivots-typeorm.md` |
| Mongoose detected | `.claude/rules/07-quality/data-pivots-mongoose.md` | `references/08-data-pivots-mongoose.md` |
| GraphQL detected | `.claude/rules/07-quality/data-pivots-graphql.md` | `references/08-data-pivots-graphql.md` |
| tRPC detected | `.claude/rules/07-quality/data-pivots-trpc.md` | `references/08-data-pivots-trpc.md` |

### Step 5 — Status each rule

For each required rule file, determine its status:
- File does not exist → **MISSING**
- File exists and content matches the plugin reference (ignore trailing whitespace) → **UP-TO-DATE**
- File exists but content differs from the plugin reference → **OUTDATED**

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-js sniff — scan results

Framework detected:
  ✅ Nuxt 3 (nuxt ^3.12.0)
  ✅ Pinia (pinia ^2.1.0)
  ❌ Vue SPA — not detected (nuxt present)
  ❌ Vite hybrid — not detected
  ❌ Alpine.js — not detected
  ❌ Astro / 11ty — not detected

ORM / data layer:
  ✅ Prisma (@prisma/client ^5.0.0)
  ✅ tRPC (@trpc/server ^11.0.0)
  ❌ Drizzle — not detected
  ❌ TypeORM — not detected
  ❌ Mongoose — not detected
  ❌ GraphQL — not detected

Rule audit:
  Coding rules (10 required):
    UP-TO-DATE  .claude/rules/00-architecture/00-shared-component-scope.md
    MISSING     .claude/rules/03-frameworks-and-libraries/03-icons.md
    OUTDATED    .claude/rules/03-frameworks-and-libraries/03-pinia.md
    ...
  Perf pivots (2 required):
    MISSING     .claude/rules/07-quality/perf-pivots-nuxt.md
    MISSING     .claude/rules/07-quality/perf-storage-ssr.md
  Data pivots (2 required):
    MISSING     .claude/rules/07-quality/data-pivots-prisma.md
    MISSING     .claude/rules/07-quality/data-pivots-trpc.md

→ sync will install 5 files, update 1 file.
```

Then proceed to action `02-sync`.
