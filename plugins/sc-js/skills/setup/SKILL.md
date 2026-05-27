---
name: setup
model: sonnet
description: >-
  Installs JavaScript ecosystem coding rules and perf/data pivots to the current
  project's .claude/rules/. Use when starting a JS project (Nuxt, Vue SPA, Vite,
  Alpine, Astro/11ty) or when JS-specific rules are missing. Covers: component
  scope, icons, image optimization, Nitro/Vite imports, design system tokens,
  async components, preconnect, CSS transitions, Pinia state management, perf
  pivots per JS stack, and data pivots for Prisma / Drizzle / TypeORM / Mongoose /
  GraphQL / tRPC.
  Do NOT use to update a single rule — edit it directly instead.
  Prefer /sc-js:sniff on already-configured projects (detects framework and ORMs, installs only relevant rules, updates outdated ones).
---

# sc-js Setup

Installs the full set of Nuxt 3 / JavaScript coding rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all Nuxt 3 / JS rule files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-js:setup` triggers `install`.

## Companion skill

- `/sc-js:sniff` — detects Nuxt/Vue/Vite/Alpine/Astro/11ty and ORMs, then installs/updates only the matching rules. Use instead of `setup` on projects that are already partially configured.

## References

### Coding rules

- `references/00-shared-component-scope.md` — Vue component optional props pattern
- `references/03-icons.md` — lucide-vue-next, tree-shaking, CSS svg selectors
- `references/03-image-optimization.md` — WebP, above/below-fold, LCP, CLS prevention
- `references/03-pinia.md` — Pinia store patterns, TTL cache, SSR safety, storeToRefs
- `references/3-nitro-plugin-imports.md` — Nitro server plugin module imports (~~/alias)
- `references/3-vite-dynamic-imports.md` — Vite code-splitting, full graph conversion rule
- `references/03-design-system.md` — Theme token conventions, semantic colors, component patterns
- `references/07-async-components-marketing.md` — defineAsyncComponent on marketing pages
- `references/07-preconnect-strategy.md` — preconnect vs dns-prefetch decision guide
- `references/7-css-transitions.md` — Avoid transition:all, GPU-composited properties only

### Perf pivots (consumed by `web-optimize`)

- `references/07-perf-pivots-nuxt.md` — Nuxt 3 SSR/SSG pivots
- `references/07-perf-pivots-vue-spa.md` — Vue SPA (Vite, no SSR) pivots
- `references/07-perf-pivots-vite.md` — Vite as hybrid build tool (Laravel/Django + Vite)
- `references/07-perf-pivots-alpine.md` — Alpine.js hybrid backend SSR pivots
- `references/07-perf-pivots-static.md` — Astro / 11ty static site pivots
- `references/07-perf-storage-ssr.md` — Client-side storage on isomorphic JS SSR

### Data pivots (consumed by `data-optimize`)

- `references/08-data-pivots-prisma.md` — Prisma ORM
- `references/08-data-pivots-drizzle.md` — Drizzle ORM
- `references/08-data-pivots-typeorm.md` — TypeORM / Sequelize
- `references/08-data-pivots-mongoose.md` — Mongoose (MongoDB)
- `references/08-data-pivots-graphql.md` — GraphQL (Apollo / Yoga / Mercurius)
- `references/08-data-pivots-trpc.md` — tRPC

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
