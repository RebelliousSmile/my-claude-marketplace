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
| `fastify`, `express`, `koa`, `@nestjs/core`, `hapi`, `@hapi/hapi` — AND no frontend framework (no nuxt/vue/svelte/astro/alpinejs) | `node` — backend |
| (none of the above) | `web` — frontend |

`runtime = "web"` means a browser-targeting frontend project. A pure Node.js backend with no frontend framework is `node`, not `web` — skip all browser-specific capability pivots for `node` runtime.

### Step 3 — Classify framework

| Signal (package.json) | Framework |
|---|---|
| `nuxt` | Nuxt 3 (SSR/SSG) |
| `@sveltejs/kit` | SvelteKit (SSR/SSG/SPA) |
| `svelte` (without `@sveltejs/kit`) | Svelte SPA |
| `vue` (without `nuxt`) | Vue SPA |
| `vite` (without `nuxt`, `vue`, `@sveltejs/kit`, `svelte`) | Vite hybrid (Laravel, Django, etc.) |
| `alpinejs` or `@alpinejs/core` | Alpine.js |
| `astro` | Astro |
| `@11ty/eleventy` | 11ty |

A project may match multiple (e.g. Vue + Vite → Vue SPA).

**SvelteKit adapter detection** — when SvelteKit is detected, read `svelte.config.js` or `svelte.config.ts` to identify the adapter import:

| Adapter import | Mode |
|---|---|
| `@sveltejs/adapter-static` | SSG / SPA (no SSR at runtime) |
| `@sveltejs/adapter-node` | SSR — Node.js server |
| `@sveltejs/adapter-auto` | auto (Vercel / Netlify / Node fallback) |
| `@sveltejs/adapter-cloudflare` | SSR — Cloudflare Workers |
| `@sveltejs/adapter-vercel` | SSR — Vercel Edge/Serverless |
| (not found or unreadable) | unknown |

Include the adapter in the framework output line: `SvelteKit (adapter-static — SPA mode)` or `SvelteKit (adapter-node — SSR)`.

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
| Svelte stores | `svelte` or `@sveltejs/kit` in dependencies | `state/svelte-stores.md` |

#### Code splitting

| Capability | Condition | Pivot path |
|---|---|---|
| Vite dynamic imports | Vite detected (any framework with vite) | `code-splitting/dynamic-import.md` |
| Vue async components | Vue or Nuxt detected | `code-splitting/defineAsyncComponent.md` |

#### Styling

| Capability | Condition | Pivot path |
|---|---|---|
| CSS transitions | `runtime = "web"` (frontend framework detected) | `styling/css-transitions.md` |

#### Icons

| Capability | Condition | Pivot path |
|---|---|---|
| lucide-vue-next | `lucide-vue-next` detected | `icons/lucide-vue.md` |
| SVG inline / Iconify | `runtime = "web"` AND (Alpine.js detected, or no Vue/Nuxt) | `icons/svg-inline.md` |

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
| SSR storage guards | Nuxt or SvelteKit detected | `ssr/storage-guards.md` |

#### TypeScript

| Capability | Condition | Pivot path |
|---|---|---|
| TypeScript | `typescript` or `vue-tsc` in devDependencies, or Nuxt 3 detected | `typescript.md` |

#### Tools

| Capability | Condition | Pivot path |
|---|---|---|
| Biome | `@biomejs/biome` in devDependencies | `tools/biome.md` |

#### Perf pivots — install targets (consumed by `web-optimize`)

These pivots are installed to `.claude/rules/07-quality/` by `02-install-pivots`. Unlike capability pivots, they ARE written to disk.

| Condition | Source | Target |
|---|---|---|
| Nuxt detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| Vue SPA detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| Vite hybrid detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| Alpine.js detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| Astro or 11ty detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |
| SvelteKit detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/sveltekit.md` | `.claude/rules/07-quality/perf-pivots-sveltekit.md` |

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

Scan **all** entries in `dependencies` and `devDependencies` — not just framework libraries. For every package that represents a capability (state management, data access, UI, tooling, networking, i18n, file formats, etc.) and has no matching pivot in Step 5, report it as a gap.

**Do not omit gaps because they seem minor or niche** — list every one so the caller can decide. A gap reported consistently across runs is more useful than one that disappears.

Examples (non-exhaustive):
- `vue-router` — routing, no pivot
- `vue-i18n` / `i18next` / homemade lang store — localisation, no pivot
- `yaml` / `js-yaml` — YAML parsing, no pivot
- `socket.io-client` — WebSocket, no pivot
- `konva` — canvas rendering, no pivot
- `@vueuse/core` — composables, no pivot

List all gaps explicitly in the output. Never silently drop a gap between runs.

## Output

Emit a structured pivot manifeste:

```
📊 sc-js sniff — capability scan

Runtime: web

Framework:
  ✅ SvelteKit (adapter-static — SPA mode) (@sveltejs/kit ^2.16.0)
  ✅ Vite (vite ^6.2.6)
  ❌ Nuxt — not detected
  ❌ Vue SPA — not detected
  ❌ Alpine.js — not detected

ORM / data layer:
  ❌ None detected

Pivot manifeste — applicable capability references:
  ⚠️  READ-ONLY — do NOT install these to .claude/rules/capabilities/ or anywhere else
  ⚠️  These paths are loaded at audit time from the plugin; they are never written to disk
  (load via ${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>)
  state/svelte-stores.md
  ssr/storage-guards.md
  code-splitting/dynamic-import.md
  styling/css-transitions.md
  icons/svg-inline.md
  images/web-optimization.md
  networking/preconnect.md
  typescript.md
  tools/biome.md

Perf pivots (→ 02-install-pivots will write to .claude/rules/07-quality/):
  perf/sveltekit.md → perf-pivots-sveltekit.md

Data pivots:
  — none detected

Gaps (no plugin pivot):
  — none detected

→ Proceed to 02-install-pivots to write perf/data pivots.
→ Use pivot manifeste as input for /sc-js:audit.
```

Then proceed to action `02-install-pivots`.
