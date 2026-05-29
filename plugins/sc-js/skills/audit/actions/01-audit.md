# Action 01 — audit

Orchestrate a JS code quality review: detect applicable pivots, load them from the plugin, and delegate analysis to `aidd-dev:reviewer`.

## Transversal rules

- Invoke `01-scan` only — never `02-install-pivots` or `03-clean`. Audit is read-only.
- Never install any file to `.claude/rules/` or any project path.
- All knowledge is read from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/` at runtime.

## Process

### Step 1 — Detect stack (invoke 01-scan only)

Run sniff `01-scan` on the project to detect the stack and obtain the pivot manifeste.

**Important**: invoke `01-scan` only. Do not invoke `02-install-pivots` or `03-clean`. Audit never triggers side effects.

Output: pivot manifeste listing applicable capability reference paths (e.g. `state/pinia.md`, `icons/lucide-vue.md`, `code-splitting/dynamic-import.md`, etc.)

If `package.json` is not found, abort with:
```
❌ sc-js audit — no package.json found. Run from the project root.
```

### Step 2 — Load capability pivots

For each pivot path in the manifeste, read the corresponding reference file:

```
${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<pivot-path>
```

Example: for `state/pinia.md` → read `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/state/pinia.md`

Collect all loaded pivot contents into an acceptance criteria document. Structure it as:

```
JS Code Quality Criteria — sc-js capability pivots

## Vue component scope
<content of components/shared-scope.md>

## Pinia state management
<content of state/pinia.md>

## Code splitting
<content of code-splitting/dynamic-import.md>
<content of code-splitting/defineAsyncComponent.md>

## CSS transitions
<content of styling/css-transitions.md>

## Icons (lucide-vue-next)
<content of icons/lucide-vue.md>

[...additional pivots from manifeste...]
```

### Step 3 — Identify review targets

Pick targets by the stack `01-scan` detected — do not assume a framework layout. Use the rows that match; combine when several apply.

| Stack (from `01-scan`) | Typical review targets |
|---|---|
| Vue / Nuxt | `src/`, `components/`, `pages/`, `stores/`, `composables/`, `app.vue`, `nuxt.config.*`, `vite.config.*` |
| SvelteKit / Svelte | `src/`, `src/routes/`, `src/lib/`, `*.svelte`, `svelte.config.*`, `vite.config.*` |
| Alpine.js | `src/`, the HTML templates carrying `x-data`, the bundler entry |
| **Vanilla web (no framework)** | `index.html` + other `*.html`, `lib/` / `js/` / `src/` JS, `css/`, the build config (`gulpfile.*`, bundler config) |
| Node backend | `src/`, `routes/`, `controllers/`, `services/`, server entry |
| Any stack — always include | linter config (`eslint.config.*`, `biome.json`), test config (`vitest.config.*`, `playwright.config.*`), and `tests/` when present |

These form the `review_target` for the reviewer agent. For vanilla web, **do not skip inline styles/scripts inside `*.html` and JS-generated DOM** — pivots like `css-transitions` and `images` apply to inline/dynamic markup, not just `.css` files.

### Step 4 — Delegate to aidd-dev:reviewer

Spawn an Agent with `subagent_type: aidd-dev:reviewer`, passing:

- `review_target`: the project source files identified in Step 3 — the reviewer will read and analyze them
- `agreed_plan`: the acceptance criteria document built in Step 2 (JS capability pivots as the standard to verify against)

**Instructions to include verbatim in the reviewer prompt:**

> 1. **Every loaded pivot must appear in the report** — either as a finding (violation) or as an explicit "✅ verified, no violations" entry in the satisfied criteria table. No pivot section may be silently absent.
> 2. **Severity is fixed before emitting** — do not hedge a finding's severity in its body text ("à considérer MAJOR selon le contexte"). If severity is context-dependent, pick the more conservative severity and justify it in one line; then emit a single, definitive severity label.
> 3. **Score breakdown is required** — for completion_score < 100%, list the pivot sections that were not fully reviewed. For quality_score, name the top 1–2 categories pulling it down.
> 4. **quality_score uses this fixed rubric** (so the score is reproducible, not a vibe): start at 100, subtract **10 per MAJOR** finding and **3 per MINOR** finding, floor at 0. A pivot flagged N/A or "scope mismatch" (e.g. a perf pivot against a purely functional suite) costs **0** — it is not a violation. State the arithmetic in the breakdown, e.g. `100 − 3×10 (major) − 4×3 (minor) = 58`.

The reviewer returns a structured report with:
- items reviewed
- findings (violations of pivot best practices)
- completion score with breakdown
- quality score with breakdown

### Step 5 — Present results

Display the reviewer's report to the user. Verify that:
- Every loaded pivot appears either in findings or in the satisfied criteria table — flag any pivot silently absent.
- Each finding has exactly one severity label with no hedging in the body.
- Scores include a breakdown explaining what the remaining % represents, and quality_score matches the rubric arithmetic (100 − 10×major − 3×minor).

**Always print a per-pivot status table covering all loaded pivots** — not only the clean ones. One row per pivot, so a reader can audit the 100% completion claim at a glance:

```
Per-pivot status (7/7):
  styling/css-transitions.md   ⚠️  1 major
  icons/svg-inline.md          ✅ verified
  images/web-optimization.md   ⚠️  1 major · 1 minor
  networking/preconnect.md     ⚠️  1 minor
  tools/eslint.md              ⚠️  1 major · 1 minor
  tools/playwright.md          ➖ N/A (functional suite — perf pivot)
  tools/vitest.md              ⚠️  2 major · 1 minor
```

Use `✅ verified` (no findings), `⚠️ N major · M minor` (counts), or `➖ N/A` (pivot does not apply to this stack/usage).

## Output format

```
🔍 sc-js audit — JS code quality review

Stack detected: Vue SPA + Vite + Pinia + lucide-vue-next (desktop/Tauri)

Pivots loaded (6):
  components/shared-scope.md
  state/pinia.md
  code-splitting/dynamic-import.md
  code-splitting/defineAsyncComponent.md
  styling/css-transitions.md
  icons/lucide-vue.md

Review scope: src/, components/, stores/, pages/

→ Delegating to aidd-dev:reviewer...

[reviewer report — scores with rubric arithmetic, per-pivot status table (all loaded pivots), findings]
```
