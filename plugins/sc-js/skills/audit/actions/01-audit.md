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
JS Code Quality Criteria — sc-js 0.4.0

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

From the `01-scan` output:
- Project source directories (typically `src/`, `components/`, `pages/`, `stores/`, `composables/`)
- Framework entry points detected (`app.vue`, `main.ts`, `nuxt.config.ts`, `vite.config.ts`, etc.)

These form the `review_target` for the reviewer agent.

### Step 4 — Delegate to aidd-dev:reviewer

Spawn an Agent with `subagent_type: aidd-dev:reviewer`, passing:

- `review_target`: the project source files identified in Step 3 — the reviewer will read and analyze them
- `agreed_plan`: the acceptance criteria document built in Step 2 (JS capability pivots as the standard to verify against)

**Instructions to include verbatim in the reviewer prompt:**

> 1. **Every loaded pivot must appear in the report** — either as a finding (violation) or as an explicit "✅ verified, no violations" entry in the satisfied criteria table. No pivot section may be silently absent.
> 2. **Severity is fixed before emitting** — do not hedge a finding's severity in its body text ("à considérer MAJOR selon le contexte"). If severity is context-dependent, pick the more conservative severity and justify it in one line; then emit a single, definitive severity label.
> 3. **Score breakdown is required** — for completion_score < 100%, list the pivot sections that were not fully reviewed. For quality_score, name the top 1–2 categories pulling it down.

The reviewer returns a structured report with:
- items reviewed
- findings (violations of pivot best practices)
- completion score with breakdown
- quality score with breakdown

### Step 5 — Present results

Display the reviewer's report to the user. Verify that:
- Every loaded pivot appears either in findings or in the satisfied criteria table — flag any pivot silently absent.
- Each finding has exactly one severity label with no hedging in the body.
- Scores include a breakdown explaining what the remaining % represents.

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

[reviewer report here]
```
