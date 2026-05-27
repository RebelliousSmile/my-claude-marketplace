# Action 01 — scan

Detect project capabilities, map them to plugin rules, audit `.claude/rules/` to determine what is missing or outdated.

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

### Step 5 — Map capabilities to rules

For each capability, evaluate the detection condition and determine the rule to install.

#### Component patterns

| Capability | Condition | Reference → Target |
|---|---|---|
| Vue component scope | Vue or Nuxt detected | `capabilities/components/shared-scope.md` → `.claude/rules/capabilities/components/shared-scope.md` |

#### State management

| Capability | Condition | Reference → Target |
|---|---|---|
| Pinia store | `pinia` detected | `capabilities/state/pinia.md` → `.claude/rules/capabilities/state/pinia.md` |
| Alpine.store | Alpine.js detected | `capabilities/state/alpine-store.md` → `.claude/rules/capabilities/state/alpine-store.md` |

#### Code splitting

| Capability | Condition | Reference → Target |
|---|---|---|
| Vite dynamic imports | Vite detected (any framework with vite) | `capabilities/code-splitting/dynamic-import.md` → `.claude/rules/capabilities/code-splitting/dynamic-import.md` |
| Vue async components | Vue or Nuxt detected | `capabilities/code-splitting/defineAsyncComponent.md` → `.claude/rules/capabilities/code-splitting/defineAsyncComponent.md` |

#### Styling

| Capability | Condition | Reference → Target |
|---|---|---|
| Design system tokens | `tailwindcss` detected | `capabilities/styling/design-system.md` → `.claude/rules/capabilities/styling/design-system.md` |
| CSS transitions | always | `capabilities/styling/css-transitions.md` → `.claude/rules/capabilities/styling/css-transitions.md` |

#### Icons

| Capability | Condition | Reference → Target |
|---|---|---|
| lucide-vue-next | `lucide-vue-next` detected | `capabilities/icons/lucide-vue.md` → `.claude/rules/capabilities/icons/lucide-vue.md` |
| SVG inline / Iconify | Alpine.js detected, or no Vue/Nuxt | `capabilities/icons/svg-inline.md` → `.claude/rules/capabilities/icons/svg-inline.md` |

#### Images (web runtime only)

| Capability | Condition | Reference → Target |
|---|---|---|
| Web image optimization | `runtime = "web"` | `capabilities/images/web-optimization.md` → `.claude/rules/capabilities/images/web-optimization.md` |

#### Networking (web runtime only)

| Capability | Condition | Reference → Target |
|---|---|---|
| preconnect / dns-prefetch | `runtime = "web"` | `capabilities/networking/preconnect.md` → `.claude/rules/capabilities/networking/preconnect.md` |

#### Server (Nuxt only)

| Capability | Condition | Reference → Target |
|---|---|---|
| Nitro server imports | Nuxt detected | `capabilities/server/nitro-imports.md` → `.claude/rules/capabilities/server/nitro-imports.md` |

#### SSR guards (isomorphic JS only)

| Capability | Condition | Reference → Target |
|---|---|---|
| SSR storage guards | Nuxt detected | `capabilities/ssr/storage-guards.md` → `.claude/rules/capabilities/ssr/storage-guards.md` |

#### Perf pivots (consumed by `web-optimize`)

| Condition | Reference → Target |
|---|---|
| Nuxt detected | `capabilities/perf/nuxt.md` → `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| Vue SPA detected | `capabilities/perf/vue-spa.md` → `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| Vite hybrid detected | `capabilities/perf/vite.md` → `.claude/rules/07-quality/perf-pivots-vite.md` |
| Alpine.js detected | `capabilities/perf/alpine.md` → `.claude/rules/07-quality/perf-pivots-alpine.md` |
| Astro or 11ty detected | `capabilities/perf/static.md` → `.claude/rules/07-quality/perf-pivots-static.md` |

#### Data pivots (consumed by `data-optimize`)

| Condition | Reference → Target |
|---|---|
| Prisma detected | `capabilities/data/prisma.md` → `.claude/rules/07-quality/data-pivots-prisma.md` |
| Drizzle detected | `capabilities/data/drizzle.md` → `.claude/rules/07-quality/data-pivots-drizzle.md` |
| TypeORM / Sequelize detected | `capabilities/data/typeorm.md` → `.claude/rules/07-quality/data-pivots-typeorm.md` |
| Mongoose detected | `capabilities/data/mongoose.md` → `.claude/rules/07-quality/data-pivots-mongoose.md` |
| GraphQL detected | `capabilities/data/graphql.md` → `.claude/rules/07-quality/data-pivots-graphql.md` |
| tRPC detected | `capabilities/data/trpc.md` → `.claude/rules/07-quality/data-pivots-trpc.md` |

### Step 6 — Status each rule

For each required rule, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE** (do not install, do not audit)

### Step 7 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching rule or skill.

Check: are there libraries in `package.json` representing a capability not covered by any entry in Step 5?

Examples of gaps to report:
- `vue-router` detected but no routing rule in plugin
- `@vueuse/core` detected but no composables rule in plugin
- `i18n` / `vue-i18n` detected but no localization rule in plugin

List all gaps explicitly in the output.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-js sniff — capability scan

Runtime: web

Framework:
  ✅ Vue SPA (vue ^3.5.13)
  ✅ Vite (vite ^6.2.6)
  ❌ Nuxt — not detected
  ❌ Alpine.js — not detected

ORM / data layer:
  ❌ None detected

Capabilities → rules:
  Component patterns   ✅ shared-scope.md
  State (Pinia)        ✅ state/pinia.md (pinia ^3.0.3)
  Code splitting       ✅ code-splitting/dynamic-import.md
                       ✅ code-splitting/defineAsyncComponent.md
  Styling              ✅ styling/design-system.md (tailwindcss ^3)
                       ✅ styling/css-transitions.md
  Icons                ✅ icons/lucide-vue.md (lucide-vue-next ^0.511.0)
  Images               ✅ images/web-optimization.md
  Networking           ✅ networking/preconnect.md
  Perf pivot           ✅ perf/vue-spa.md → 07-quality/perf-pivots-vue-spa.md
                       ✅ perf/vite.md → 07-quality/perf-pivots-vite.md
  SSR guards           — N/A (no SSR)
  Data pivots          — none detected

Skills support:
  /web-optimize  ✅ (perf-pivots-vue-spa.md + perf-pivots-vite.md ready)
  /data-optimize ✗  (no ORM detected)

Gaps (no plugin rule):
  vue-router (routing) — no routing rule in plugin

Rule audit:
  MISSING  .claude/rules/capabilities/components/shared-scope.md
  MISSING  .claude/rules/capabilities/state/pinia.md
  ...
  NOT-APPLICABLE  server/nitro-imports.md (Nuxt not detected)
  NOT-APPLICABLE  ssr/storage-guards.md (Nuxt not detected)

→ sync will install 10 files, update 0 files.
```

Then proceed to action `02-sync`.
