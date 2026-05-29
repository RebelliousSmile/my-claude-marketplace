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
| (none of the above, `runtime = "web"`) | Vanilla web (no JS framework) |

A project may match multiple (e.g. Vue + Vite → Vue SPA).

**Vanilla web** is a real classification, not a fallback to improvise around. When no framework signal matches and the runtime is `web`, emit `✅ Vanilla web (no JS framework)` and, if present, name the build/dev tooling in parentheses for context only — e.g. `Vanilla web (no JS framework) — build: Gulp, dev server: BrowserSync`. Do **not** invent framework labels like "Gulp SPA": Gulp and BrowserSync are build/dev tooling, not frameworks. There is no perf pivot for vanilla web today (the perf pivots in Step 5 cover Nuxt/Vue/Vite/Alpine/SvelteKit/Astro/11ty only) — so `02-install-pivots` installs nothing for a vanilla project, which is expected, not a defect.

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

For each capability, evaluate the detection condition **against `package.json` only** and record the applicable pivot path (under `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/`). These paths are **not installed** — they are loaded on demand by `/sc-js:audit`.

**Never inspect source files to decide whether to include a pivot.** If the `package.json` condition matches, the pivot goes in the manifeste — even if the pattern is not yet used in the codebase. It is `/sc-js:audit`'s job to check whether the pattern is missing, misused, or correct. The sniff only maps what is available.

**Only list pivots that physically exist in the plugin.** Before including a pivot, verify it exists at `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>`. Do NOT invent a pivot path because it would be useful — if no file exists at that path, the capability goes in **Gaps**, not in the manifeste. Listing a non-existent pivot as available misleads `/sc-js:audit` into trying to load a file that isn't there.

#### Component patterns

| Capability | Condition | Pivot path |
|---|---|---|
| Vue component scope | Vue or Nuxt detected | `components/shared-scope.md` |
| Alpine.js component patterns | Alpine.js detected | `components/alpine-x-data.md` |

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

#### Server

| Capability | Condition | Pivot path |
|---|---|---|
| Nitro server imports | Nuxt detected | `server/nitro-imports.md` |
| Express MVC patterns | `express` in dependencies | `server/express-mvc.md` |

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
| ESLint | `eslint` in devDependencies | `tools/eslint.md` |
| Playwright perf | `@playwright/test` or `playwright` or `playwright-core` in devDependencies | `tools/playwright.md` |
| Vitest | `vitest` in devDependencies | `tools/vitest.md` |

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

A **gap** is a package detected in `dependencies`/`devDependencies` that has no matching pivot in Step 5. Scan **all** entries — not just framework libraries — then sort each gap into one of three buckets. The buckets exist so the single actionable signal (capability gaps worth authoring a pivot for) is not drowned out by noise.

**Companion packages — not gaps.** Before bucketing, drop any package that is a companion/peer of a capability **already covered by a pivot in the manifeste**. A covered pivot accounts for its whole toolchain, so its satellites must not be re-listed as gaps. Examples:
- `@vitest/coverage-v8`, `@vitest/ui` — covered by `tools/vitest.md`
- `@eslint/js`, `globals`, `eslint-config-prettier` — covered by `tools/eslint.md`
- `playwright-core`, `@playwright/test` (whichever did not trigger detection) — covered by `tools/playwright.md`

A companion is dropped silently (it is neither a gap nor "excluded") — it is simply part of the covered capability. If a package looks like a companion but the parent pivot is **not** in the manifeste, treat it normally (it is not covered, so it may be a real gap).

#### Bucket A — Capability gaps (pivot candidates)

A package that represents an **application capability** the plugin could plausibly cover with a future pivot: state management, data access, UI widgets, networking, i18n, file formats, rich-text/canvas rendering, etc.

These are the actionable gaps. List **every one explicitly** — do not omit a capability gap because it seems minor or niche. A capability gap reported consistently across runs is the signal that tells the maintainer which pivot to author next.

Examples (non-exhaustive):
- `vue-router` — routing
- `vue-i18n` / `i18next` / homemade lang store — localisation
- `yaml` / `js-yaml` — YAML parsing
- `socket.io-client` — WebSocket
- `konva` — canvas rendering
- `quill` / `@tiptap/core` — rich-text editor
- `@vueuse/core` — composables

#### Bucket B — Tooling / infra (no pivot expected)

Build systems, dev servers, test runners without a pivot, env loaders, DOM emulators, bundler plugins — infrastructure, not application capability. A pivot here is unlikely, so these are **context, not actionable gaps**. Report them grouped and condensed (one line per family), e.g. `gulp + gulp-* plugins (build)`, `browser-sync (dev server)`, `jsdom (test DOM)`, `dotenv (env)`. Never expand a tooling family into one line per plugin.

#### Bucket C — Private / workspace packages (excluded)

Packages internal to this repository or its monorepo — a pivot can **never** exist for them, so they are **not gaps**. Exclude (do not list) any dependency whose scope matches the project's own scope: read the `name` field of `package.json`; if it is scoped (`@scope/...`), exclude every dependency under that same `@scope/`. Also exclude `workspace:`-protocol dependencies and `file:`/`link:` local paths. If any were excluded, note only the count, e.g. `2 private @smartlockers/* workspace packages excluded`.

Never silently drop a **capability gap** (bucket A) between runs. Buckets B and C are summarized by design, not dropped silently — the output still accounts for them.

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

Gaps — capability (pivot candidates):
  — none detected

Gaps — tooling / infra (no pivot expected):
  — none detected

Excluded:
  — none (no private/workspace packages)

→ Proceed to 02-install-pivots to write perf/data pivots.
→ Use pivot manifeste as input for /sc-js:audit.
```

### Closing summary constraint

If a free-text summary is emitted after the structured output, it **must not contradict the manifeste**: never describe as a "gap" any capability that appears in the pivot manifeste above (e.g. if `tools/playwright.md` is listed as applicable, Playwright is covered — it is not a gap). Only bucket-A capability gaps may be called gaps in prose. When in doubt, defer to the structured manifeste, which is authoritative.

Then proceed to action `02-install-pivots`.
