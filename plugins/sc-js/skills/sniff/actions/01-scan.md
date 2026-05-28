# Action 01 — scan

Detect project capabilities, map them to JS knowledge pivots, and emit a pivot manifeste for use by `02-install-pivots` and `/sc-js:audit`.

## Process

### Step 1 — Read package.json

Read `package.json` from the project root. Parse `dependencies` and `devDependencies`.

If `package.json` is absent, abort:
```
❌ sc-js sniff — no package.json found
   Aborting.
```

### Step 2 — Detect runtime

| Signal (package.json) | Runtime |
|---|---|
| `@tauri-apps/api` or `@tauri-apps/cli` | `desktop` — Tauri |
| `electron` or `electron-builder` or `electron-vite` | `desktop` — Electron |
| (none of the above) | `web` |

### Step 3 — Classify framework

| Signal (package.json) | Framework |
|---|---|
| `nuxt` | Nuxt 3 (SSR/SSG) |
| `vue` (without `nuxt`) | Vue SPA |
| `vite` (without `nuxt` and without `vue`) | Vite hybrid (Laravel, Django, etc.) |
| `alpinejs` or `@alpinejs/core` | Alpine.js |
| `astro` | Astro |
| `@11ty/eleventy` | 11ty |

A project may match multiple (e.g. Vue + Vite → Vue SPA).

### Step 4 — Classify ORMs

| Signal (package.json) | ORM |
|---|---|
| `prisma` or `@prisma/client` | Prisma |
| `drizzle-orm` | Drizzle |
| `typeorm` or `sequelize` | TypeORM / Sequelize |
| `mongoose` | Mongoose |
| `@apollo/server` or `graphql-yoga` or `mercurius` or `graphql` | GraphQL |
| `@trpc/server` | tRPC |

### Step 5 — Map capabilities to knowledge pivots

For each capability, evaluate the detection condition and record the applicable pivot path (under `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/`). These paths are **not installed** — they are loaded on demand by `/sc-js:audit`.

#### Component patterns

| Capability | Condition | Pivot path |
|---|---|---|
| Vue component scope | Vue or Nuxt detected | `components/shared-scope.md` |

#### State management

| Capability | Condition | Pivot path |
|---|---|---|
| Pinia store | `pinia` detected | `state/pinia.md` |
| Alpine.store | Alpine.js detected | `state/alpine-store.md` |

#### Code splitting

| Capability | Condition | Pivot path |
|---|---|---|
| Vite dynamic imports | Vite detected (any framework with vite) | `code-splitting/dynamic-import.md` |
| Vue async components | Vue or Nuxt detected | `code-splitting/defineAsyncComponent.md` |

#### Styling

| Capability | Condition | Pivot path |
|---|---|---|
| CSS transitions | always | `styling/css-transitions.md` |

#### Icons

| Capability | Condition | Pivot path |
|---|---|---|
| lucide-vue-next | `lucide-vue-next` detected | `icons/lucide-vue.md` |
| SVG inline / Iconify | Alpine.js detected, or no Vue/Nuxt | `icons/svg-inline.md` |

#### Images (web runtime only)

| Capability | Condition | Pivot path |
|---|---|---|
| Web image optimization | `runtime = "web"` | `images/web-optimization.md` |

#### Networking (web runtime only)

| Capability | Condition | Pivot path |
|---|---|---|
| preconnect / dns-prefetch | `runtime = "web"` | `networking/preconnect.md` |

#### Server (Nuxt only)

| Capability | Condition | Pivot path |
|---|---|---|
| Nitro server imports | Nuxt detected | `server/nitro-imports.md` |

#### SSR guards (isomorphic JS only)

| Capability | Condition | Pivot path |
|---|---|---|
| SSR storage guards | Nuxt detected | `ssr/storage-guards.md` |

#### Perf pivots — install targets (consumed by `web-optimize`)

These pivots are installed to `.claude/rules/07-quality/` by `02-install-pivots`. Unlike capability pivots, they ARE written to disk.

| Condition | Source | Target |
|---|---|---|
| Nuxt detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| Vue SPA detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| Vite hybrid detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| Alpine.js detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| Astro or 11ty detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |

#### Data pivots — install targets (consumed by `data-optimize`)

| Condition | Source | Target |
|---|---|---|
| Prisma detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| Drizzle detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| TypeORM / Sequelize detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| Mongoose detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| GraphQL detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| tRPC detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

### Step 6 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching pivot.

Check: are there libraries in `package.json` representing a capability not covered by any entry in Step 5?

Examples of gaps to report:
- `vue-router` detected but no routing pivot in plugin
- `@vueuse/core` detected but no composables pivot in plugin
- `vue-i18n` detected but no localization pivot in plugin

List all gaps explicitly in the output.

## Output

Emit a structured pivot manifeste:

```
📊 sc-js sniff — capability scan

Runtime: web | desktop (Tauri) | desktop (Electron)

Framework:
  ✅ Vue SPA (vue ^3.5.13)
  ✅ Vite (vite ^6.2.6)
  ❌ Nuxt — not detected
  ❌ Alpine.js — not detected

ORM / data layer:
  ❌ None detected

Pivot manifeste — applicable capability references:
  (load via ${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>)
  components/shared-scope.md
  state/pinia.md
  code-splitting/dynamic-import.md
  code-splitting/defineAsyncComponent.md
  styling/css-transitions.md
  icons/lucide-vue.md
  [runtime=desktop: images/web-optimization.md — NOT APPLICABLE]
  [runtime=desktop: networking/preconnect.md — NOT APPLICABLE]

Perf pivots (→ 02-install-pivots will write to .claude/rules/07-quality/):
  perf/vue-spa.md → perf-pivots-vue-spa.md
  perf/vite.md    → perf-pivots-vite.md

Data pivots:
  — none detected

Gaps (no plugin pivot):
  vue-router (routing) — no pivot in plugin

→ Proceed to 02-install-pivots to write perf/data pivots.
→ Use pivot manifeste as input for /sc-js:audit.
```

Then proceed to action `02-install-pivots`.
