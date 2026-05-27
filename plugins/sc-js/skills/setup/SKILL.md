---
name: setup
model: sonnet
description: >-
  Installs the complete JavaScript ecosystem capability rules and perf/data
  pivots to the current project's .claude/rules/. Use when starting a fresh JS
  project (Nuxt, Vue SPA, Vite, Alpine, Astro/11ty) or when all rules are
  missing. Covers all capabilities: component scope, state management (Pinia,
  Alpine.store), code splitting, design system, icons, image optimization,
  networking, Nitro server imports, SSR storage guards, CSS transitions, and
  perf pivots per JS stack and data pivots for all detected ORMs.
  Do NOT use to update a single rule — edit it directly instead.
  Prefer /sc-js:sniff on already-configured projects (detects capabilities,
  installs only relevant rules, updates outdated ones).
---

# sc-js Setup

Installs the full set of JavaScript capability rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's `references/capabilities/` directory.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all JS capability rule files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-js:setup` triggers `install`.

## Companion skill

- `/sc-js:sniff` — detects capabilities and installs only relevant rules. Use instead of `setup` on projects that are already partially configured.

## References

### Capability rules

- `references/capabilities/components/shared-scope.md` — Vue component optional props pattern
- `references/capabilities/state/pinia.md` — Pinia store patterns, TTL cache, SSR safety, storeToRefs
- `references/capabilities/state/alpine-store.md` — Alpine.store() patterns, $persist, namespace
- `references/capabilities/code-splitting/dynamic-import.md` — Vite code-splitting, full graph conversion rule
- `references/capabilities/code-splitting/defineAsyncComponent.md` — Vue async components, non-critical lazy loading
- `references/capabilities/styling/design-system.md` — Theme token conventions, semantic colors, component patterns
- `references/capabilities/styling/css-transitions.md` — Avoid transition:all, GPU-composited properties only
- `references/capabilities/icons/lucide-vue.md` — lucide-vue-next, tree-shaking, CSS svg selectors
- `references/capabilities/icons/svg-inline.md` — Iconify web component, SVG sprite, inline SVG (Alpine/Vanilla)
- `references/capabilities/images/web-optimization.md` — WebP, above/below-fold, LCP, CLS prevention
- `references/capabilities/networking/preconnect.md` — preconnect vs dns-prefetch decision guide
- `references/capabilities/server/nitro-imports.md` — Nitro server plugin module imports (~~/alias)
- `references/capabilities/ssr/storage-guards.md` — localStorage/sessionStorage SSR guards (isomorphic JS)

### Perf pivots (consumed by `web-optimize`)

- `references/capabilities/perf/nuxt.md` — Nuxt 3 SSR/SSG pivots
- `references/capabilities/perf/vue-spa.md` — Vue SPA (Vite, no SSR) pivots
- `references/capabilities/perf/vite.md` — Vite as hybrid build tool (Laravel/Django + Vite)
- `references/capabilities/perf/alpine.md` — Alpine.js hybrid backend SSR pivots
- `references/capabilities/perf/static.md` — Astro / 11ty static site pivots

### Data pivots (consumed by `data-optimize`)

- `references/capabilities/data/prisma.md` — Prisma ORM
- `references/capabilities/data/drizzle.md` — Drizzle ORM
- `references/capabilities/data/typeorm.md` — TypeORM / Sequelize
- `references/capabilities/data/mongoose.md` — Mongoose (MongoDB)
- `references/capabilities/data/graphql.md` — GraphQL (Apollo / Yoga / Mercurius)
- `references/capabilities/data/trpc.md` — tRPC

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
