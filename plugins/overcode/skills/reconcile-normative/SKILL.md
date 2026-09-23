---
name: reconcile-normative
description: Reconcile normative content across decision archives, project memory, and host-native project instructions. Use to detect redundancy, contradictions, uncodified patterns, or stale rules across AGENTS.md/.agents rules on Codex and .claude/rules on Claude Code.
author: François-Xavier Guillois
version: 4.8.0
vibe_version: ">=1.0.0"
permissions:
  - files
  - bash
tags:
  - productivity
  - workflow
  - automation
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Reconcile-normative — normative content reconciliation

## Purpose

Apply the project's normative-load rule to all normative sources: drain the archive, consolidate existing host instructions, move explanatory content to project memory, detect duplicates and contradictions, elevate recurring patterns when justified, and flag potentially stale rules.

## When to invoke

- As a sub-phase of `harvest` (global orchestration)
- Standalone when the user wants to audit normative content without triggering tracker/file lifecycle work

## Rules

- Never delete an archive file without explicit confirmation
- Never modify an existing rule without explicit confirmation
- Batch mode allowed: > 5 entries of the same nature → 3-sample preview then bulk
- Resolve `PROJECT_RULES_ROOT` from host portability. On Codex, include the nearest applicable `AGENTS.md` in every mapping and maintain a bounded index there for rules stored under `.agents/rules/`. On Claude Code, use `.claude/rules/`. When both exist, reconcile their semantics rather than treating one as stale by default.

## Configuration (overridable via argument)

| Parameter | Default | Description |
|---|---|---|
| `rule_elevation_threshold` | 3 | Minimum number of decisions on the same topic to elevate to a rule |
| `rule_freshness_days` | 90 | Beyond this age, an unmodified rule becomes a candidate for the freshness pass |

---

## Phase A — Mapping (incremental scan + archive sweep)

### Sources

- `aidd_docs/memory/internal/decisions/` — normative archive to drain (ADR destination of `aidd-context:10-learn`); legacy projects keep it at `aidd_docs/internal/decisions/` — sweep whichever exists
- `aidd_docs/memory/` — project memory bank, **flat**: `aidd_docs/memory/<bank>.md`, with `internal/` and `external/` reserved for on-demand notes (`aidd-context:02-project-memory`, `references/structure.md`)
- `${PROJECT_RULES_ROOT}/` — codified rule references (all categories 00-09)
- Every applicable `AGENTS.md` — auto-loaded Codex project instructions, when present; include ancestor and nested files that govern the project
- `.claude/rules/` and `.agents/rules/` when present — inspect both host surfaces, even when one is not the current host

### Reference rule

```markdown
${PROJECT_RULES_ROOT}/01-standards/1-normative-vs-archive.md
```

### Last-run detection

Read the most recent file in `aidd_docs/harvests/`:

```bash
# macOS / Linux
ls -t aidd_docs/harvests/*.md | head -1

# Windows (PowerShell)
Get-ChildItem aidd_docs/harvests\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
```

### Incremental scan

List files in `aidd_docs/memory/`, `${PROJECT_RULES_ROOT}/`, and the applicable `AGENTS.md` modified since that date (if no prior harvest: scan all). Skip absent optional paths without failing:

```bash
# macOS / Linux
find aidd_docs/memory ${PROJECT_RULES_ROOT} \
  -type f -name "*.md" -newer aidd_docs/harvests/<last-report>.md | sort

# Windows (PowerShell)
$lastHarvest = Get-ChildItem aidd_docs\harvests\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-ChildItem -Recurse -Filter "*.md" aidd_docs\memory, ${PROJECT_RULES_ROOT} |
  Where-Object { $_.LastWriteTime -gt $lastHarvest.LastWriteTime } | Sort-Object Name | Select-Object -ExpandProperty FullName
```

### Archive sweep

List **every** file in `aidd_docs/memory/internal/decisions/`, in the legacy `aidd_docs/internal/decisions/`, and in any detected `*/decisions/`, `*/adr/`, `*/archive/`, with no date filter — their mere presence is the anomaly to resolve.

**The incremental scan is NOT a sweep replacement.** A prior harvest may have audited DEC-001 to DEC-024 and a new run may be tempted to scan only DEC-025+. Every file must be **classified** at every run (normative / historical / mixed) — even if previously seen. If a file was classified `historical` in a prior report and remains unchanged, log it as "skipped — historical, audited YYYY-MM-DD" rather than silently ignoring it. Never skip without explicit log entry.

**If both incremental scans return nothing and the archive sweep is empty, still run Phase D (existing-rule consolidation) before the freshness pass and report.** Existing rules may be bloated or duplicated without having changed since the last Harvest.

Read each returned file. Build a topic map (lib/technology, functional domain) recording for each file: main topic, identified normative content, identified historical content.

Independently inventory **every current rule file and applicable `AGENTS.md`**, regardless of modification date or last-run status. Record host, path scope, and whether the content is always loaded, conditionally loaded, or only reached through an explicit index. The incremental scan limits archive/memory work; it never limits existing-rule consolidation.

---

## Phase B — Detection

For each scanned file, look for:

| Issue | Definition | Action |
|---|---|---|
| **Normative in archive** | File in `decisions/`, `adr/` or `archive/` — content with `must / never / always / required` or names a file/function/flag binding the future | Classify as `normative \| historical \| mixed`. Migrate the normative slice. See Phase C. |
| **Duplicate** | Same constraint repeated in 2+ effective instruction locations for the same host and scope | Merge without removing the only effective copy for another host |
| **Contradiction** | Two files prescribe opposite behaviors | Keep the most recent or specific, annotate the choice |
| **Recurring pattern** | Same constraint type in ≥ `rule_elevation_threshold` files in `memory/`, absent from host instructions | Elevate under `${PROJECT_RULES_ROOT}/<category>/` and index it from `AGENTS.md` on Codex |
| **Obsolete decision** | References a lib, function or pattern that no longer exists | Flag to user |

The `rule_elevation_threshold` only applies to patterns observed in `memory/`. For archive files, **a single normative occurrence is enough** to trigger migration.

---

## Phase C — Consolidation

Apply Phase B actions. For each change:

- **Migrate a normative entry from archive**:
  0. **Verify no existing rule already covers the topic**: `rg` with **≥ 2 terms** in `${PROJECT_RULES_ROOT}/` — functional topic AND named technical symbol (file, flag, function, constant). Read the matched passage and check **normative force**, not just term presence:
     - **Full coverage** → matched passage uses `must` / `always` / `never` / `required` to enforce the same constraint. Do not duplicate, skip to next entry (count under "rule already covers")
     - **Partial coverage** → matched passage mentions the term but is descriptive (table, example, narrative) without imperative enforcement, OR rule's `paths:` does not cover the surface where the constraint applies. Enrich the **existing** rule (not memory), keep its `paths:` or extend it
     - **No coverage** → no match or matched passage is unrelated. Continue to step 1

A keyword grep that finds the term inside an example block or descriptive table is **not coverage** — the rule must impose the constraint, not merely mention it.
  1. Split normative slice / historical slice
  2. **Choose target — rule or memory** per the criterion below
  3. If **rule**: create/enrich a path-scoped rule; on Codex, also update the bounded normative index in `AGENTS.md` so the reference is discoverable
  4. If **memory**: pick the target file via the mapping below. For the expected sections, read the template shipped by `aidd-context:02-project-memory` (`skills/02-project-memory/assets/templates/memory/<capability>/<file>.md`, resolved through host portability; `references/memory-destinations.md` maps template → bank file). If the plugin is not reachable, infer the sections from the target file itself — never fail on a missing template
  5. Insert in the section's format (table row, 3-15 word bullet, H3 subtitle, mermaid block) — prefer existing sections; create a new section only if the file's spirit justifies it.

     **Content shaping rules** (apply to memory inserts only; for the rule branch at step 3, follow `${PROJECT_RULES_ROOT}/01-standards/1-rule-writing.md` — 3-7 word imperatives, no inline rationale):

     - **Normative memory only**: when a decision is intentionally retained as on-demand guidance rather than an active host rule, express its constraint clearly with `Always X` / `Never Y` / `Must Z`. Explanations, history, and runbooks moved out of existing rules remain descriptive; do not turn them into duplicate imperatives.
     - **Why-line for normative memory when needed**: place rationale on a separate indented line below the short constraint (`  **Why:** <reason>`). Explanatory memory can carry its rationale in normal prose.
     - **No source trace back to the deleted ADR**: a `(cf. DEC-XYZ)` pointer dies the moment the source is deleted, and keeping the source as archive pollutes memory load 100 % of the time for a revert that happens ~1 % of the time. The bullet's own rationale is what carries the rule forward; the ADR is git history.
     - **For chain migrations into a consolidated section**: place rationale once in the H3 intro paragraph, not per bullet — individual bullets stay terse.
  6. Preserve frontmatter, ordering and style **of the target file** (informed by its template, not slavishly copied)
  7. Show the user the content to insert + propose **full deletion of the source** as default. Memory load is paid 100 % of the time; an archive (or even a stub) is consulted ~1 % of the time and weighs against every future read — git history is the revert path, not a kept file. Stub only if the user explicitly asks. **Distinct confirmation** per decision (or per grouped chain). **Batch mode**: if > 5 entries of the same nature, present a sample of 3 full decisions; if the user validates, apply the rest in bulk with a single final confirmation
- **Merge duplicate**: target file is the most recent; on tie, the most complete. Show both files and the proposed merge → **distinct confirmation**: "Merge and delete source?" Rewrite the target, delete the source only after agreement.
- **Elevate to rule**: create `${PROJECT_RULES_ROOT}/<category>/<n>-<topic>.md` (category 00-09 per `1-rule-structure.md`) following the template and rule-writing convention. On Codex, add a concise `AGENTS.md` instruction naming when to read that file; preserve unrelated sections. Show the created rule and source list → **distinct confirmation**: "Does the rule fully cover these files? Delete sources?"

  **After creating any rule with a forbidden pattern**: grep the codebase scoped by the new rule's `paths:` to count violations. Forbidden patterns are bullets formed with `never`, `forbidden`, `must not`, `do not use`, etc.

  ```bash
  # Example — rule forbids `transition-all`, paths: **/*.vue, **/*.css
  rg -n "transition-all|transition: all" --glob "**/*.vue" --glob "**/*.css"
  ```

  If N > 0 violations: surface to the user as a separate signal — "Règle créée, mais N violations existent dans le code. Créer un audit / issue de cleanup ?". Never silent — a rule violated immediately at creation is dead weight.

### Target criterion — rule vs memory

| Pick a **rule** (`${PROJECT_RULES_ROOT}/...`) if | Pick **memory** (`aidd_docs/memory/...`) if |
|---|---|
| Topic is **path-scopable on a narrow surface** (glob isolating < ~30 % of code: `firebase.json`, `nuxt.config.ts`, `server/api/**`, `models/*.js`), or it is a genuinely universal constraint needed on every task and fits in a short host instruction | Topic is **transverse but explanatory** or conceptual, or the natural glob is too broad (`**/*.vue`, `**/*.ts` alone — cover almost all app code) without requiring an always-loaded instruction |
| Rule is **verifiable at write-time** (concrete convention, named anti-pattern, constant, required value) | Content is **explanatory**: why, context, principle, learning, runbook |
| Agent must obey it when touching the affected files; on Codex, `AGENTS.md` points to the scoped reference | Agent may consult it on demand for explanation, history, decisions or a runbook; memory is not assumed to auto-load |

On ambiguity: if the decision can be expressed as a testable code convention **and** scoped to a narrow surface, prefer **rule**. Keep a truly universal mandatory constraint as a short host instruction. Put its rationale in memory. Otherwise prefer **memory**.

### Topic → memory file mapping

Bank files are **flat** — `aidd_docs/memory/<file>.md`, kebab-case, never nested. `memory/internal/` and `memory/external/` hold on-demand notes and ADRs, never a bank file. The canonical file list is `aidd-context:02-project-memory`, `references/memory-destinations.md`; a bank only holds the files its capabilities warranted, so a row's file may legitimately be absent.

The mapping below is a starting point, not exhaustive. When a topic spans multiple rows (e.g. auth ∈ {auth, api}), pick the file whose **template section** most closely matches the decision's substance. When no row fits, follow the fallback heuristic at the bottom.

| Decision topic | Memory file | Template sections to favor |
|---|---|---|
| Stack, naming, modules, service organization, i18n | `architecture.md` | Language/Framework, Naming Conventions, Services communication |
| Internal API surface, request/response types, validation, error handling | `api.md` | Services, Data Flow, Error Handling, Validation |
| Third-party integrations, SDK wiring, webhooks | `integration.md` | existing sections |
| Auth flows, security rules, custom claims, session handling | `auth.md` — prefer a path-scoped rule if the convention is verifiable at write-time | existing sections |
| Real-time listeners, websocket / `onSnapshot` patterns | `realtime.md` | existing sections |
| DB schema, entities, migrations, seeding | `database.md` | Main entities, Migrations, Seeding |
| Data modeling, pipelines, storage formats | `data.md` | existing sections |
| Design system, theme, tokens, UI components, accessibility | `design.md` | Design Implementation, Component Standards, Layout System |
| Forms, client validation, form state | `forms.md` | State Management, Validation, Error handling, Form Flow |
| Navigation, browsing flow, lists/filters, product UX | `navigation.md` | existing sections |
| CI/CD, hosting, env vars, URLs, monitoring, observability, tracking, consent/RGPD | `deployment.md` | CI/CD Pipeline, Environments Variables, URLs, Monitoring & Logging |
| Runtime topology, containers, provisioning | `infra.md` | existing sections |
| Caching strategy (HTTP headers, hosting cache, store TTL, query result cache) | `deployment.md` (hosting/CDN angle) or `architecture.md` (in-app cache angle) | CI/CD Pipeline, Services |
| Feature flags, kill switches, gradual rollout | `deployment.md` | Environments Variables |
| Notifications (transactional email, marketing flows, push) | `messaging.md` | existing sections |
| Test strategy, fixtures, mocks, test types | `testing.md` | Testing Strategy, Tools and Frameworks, Mocking |
| Repo overview | `codebase-map.md` | single flowchart |
| VCS, branches, commit conventions | `vcs.md` | template sections |
| Constants binding the future, business value assertions, transverse guardrails | `coding-assertions.md` | existing sections |
| Product context, vision, target audience | `project-brief.md` | existing sections |
| Backlog conventions, refinement workflow | `backlog.md` | existing sections |
| Vendor ecosystem, external services in use | `ecosystem.md` | existing sections |
| Packaging, publishing, versioning, release channels | `package.md` | existing sections |
| CLI surface, commands, flags conventions | `cli.md` | existing sections |
| Mobile-specific conventions | `mobile.md` | existing sections |
| Desktop-specific conventions | `desktop.md` | existing sections |
| Performance decisions accumulated within an iteration | custom file, e.g. `iteration-N-perf-learnings.md` | dedicated section per chain |
| Multi-agent coordination, sub-agent invocation rules | custom file, e.g. `agents-coordination.md` | dedicated section |
| Project-specific orchestration deviating from the default AIDD flow | custom file, e.g. `custom-main-workflow.md` | dedicated section |
| Outside the taxonomy above | **First**: scan existing custom bank files (`aidd_docs/memory/*.md` not listed above) for a thematic fit. **Only if no fit**: propose creation to the user, justifying the new file against the canonical list in `references/memory-destinations.md`. | dedicated section |

Team-owned documents — `aidd_docs/README.md`, `GUIDELINES.md`, `CONTRIBUTING.md` — are never a migration target: their placeholders belong to a human.

If no file fits, **propose creation** to the user before acting: every new bank file must either match a capability row of `references/memory-destinations.md` or be justified as a custom bank file.

Any other deletion of a memory file → **user confirmation** before acting.

When several archive entries form a chain (supersession, shared topic), propose a grouped migration into **a single consolidated section** of the target file rather than per-entry inserts.

---

## Phase D — Existing-rule consolidation, then freshness

### Full consolidation pass

Use Phase A's **complete** rule inventory on every run, including unchanged files. Work at the level of individual instructions and sections, not whole files. For each item, record its host and path scope, the behavior it requires, any exceptions, its source, and whether a current memory bank already covers its explanation.

Classify each item:

| Class | Criterion | Destination |
|---|---|---|
| **Keep as rule** | A current, actionable constraint that changes agent behavior on a future task; concrete enough to check, with the narrowest applicable scope | One concise effective host instruction or scoped rule; retain necessary cross-host equivalents |
| **Narrow scope** | A current, write-time-verifiable rule whose declared `paths:` cover significantly more files than the measured call sites of the technical symbol(s) it names, or whose path list contains an entry wholly covered by another entry | Keep the rule, remove redundant entries, and propose the smallest measured scope that still contains every current site; do not move the constraint to memory |
| **Move to memory** | Rationale, decision history, architecture explanation, examples, troubleshooting steps, or runbook material without an independent enforceable constraint | Existing thematic `aidd_docs/memory/<bank>.md` section, following Phase C's memory mapping and format |
| **Resolve** | Duplicate, overlapping, contradictory, obsolete, or superseded instruction | Merge, narrow, update, or remove only after checking the surviving effective instruction and required confirmations |

Before assigning a class to a path-scoped rule, extract the concrete technical symbols it names
(function, constant, flag, command, configuration key; never generic prose) and measure its effective
population:

```bash
node "${OVERCODE_PLUGIN_ROOT}/skills/reconcile-normative/tools/scope-audit.mjs" \
  --root <project-root> --rule <rule.md> --symbol <literal> --json
```

Pass one `--symbol` per independently named mechanism. The report compares the union of files matched
by `paths:` with the union of literal symbol sites, lists sites outside the scope, and compares every
path entry with its siblings. A path whose measured file set is wholly contained by another entry is
redundant even when their glob strings look different. A declared population at least twice the symbol
population, or carrying at least three files with no site, is a **Narrow scope candidate**, not an
automatic edit: inspect dynamic dispatch, generated calls, conventions that apply before the first call,
and non-literal use before proposing the narrower paths. A symbol site outside the current scope is a
coverage defect and blocks narrowing until the surviving scope includes it.

Imperative wording alone does not prove that content is a current rule. Verify the current code, decisions, and supported workflow before retaining or elevating it. A mixed file may need a short surviving rule plus a memory entry. Preserve exceptions, paths, and host-specific syntax when shortening; do not silently weaken a constraint. Do not move a real constraint only to on-demand memory.

Compare rules **within each host and applicable path scope**. A Codex `AGENTS.md` index and `.agents/rules/` reference form one effective path; Claude's `.claude/rules/` may need an equivalent constraint. Cross-host equivalents are not redundant copies to delete. For Codex, keep the `AGENTS.md` entry bounded to when and where the scoped file should be read. Remove index entries that no longer point to an active rule.

For each proposed consolidation, show the current instruction, the concise surviving rule, the memory destination and text, the affected hosts/scopes, and any source removal. Follow the existing-rule edit and file-deletion confirmation boundaries. Apply the memory and surviving-rule updates before removing duplicate or obsolete instructions; if an approval is declined, leave the current instruction effective and report the proposal as pending. Use the Phase C memory-target rule when no suitable bank exists.

Measure context load **before and after** each accepted set of edits: report bytes or tokens for applicable always-loaded `AGENTS.md` content and Claude rule content, plus separately the size of conditionally loaded rule references. Do not count on-demand memory as auto-loaded. If an exact host token count is unavailable, use byte counts with the method stated. Report no reduction when no edit was made or when effective load is unchanged.

For every accepted **Narrow scope** edit, Phase E names the before/after file populations, the symbols
used for the measurement, any redundant path removed, and this tradeoff explicitly: the tighter scope
reduces irrelevant automatic loading but a future legitimate call site outside it will not load the rule.
That risk is reported in prose, not hidden in the consolidation count.

This pass is complete only after every existing rule file and applicable `AGENTS.md` has been classified, including files unchanged since the last run. Record counts for rules inspected, consolidated, retained, moved to memory, and pending approval.

### Existing-rules freshness pass

### Goal

Detect rules in `${PROJECT_RULES_ROOT}/` and normative `AGENTS.md` sections whose content may have been invalidated by a more recent decision or memory entry. This is the **inverse** of Phase C step 0: instead of asking "does a rule cover this new input?", ask "is this rule still consistent with recent inputs?"

### Candidate rule selection

List rules unmodified for `rule_freshness_days` days:

```bash
# macOS / Linux
find ${PROJECT_RULES_ROOT} -type f -name "*.md" -mtime +90 | sort

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.md" ${PROJECT_RULES_ROOT} |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) } |
  Sort-Object Name | Select-Object -ExpandProperty FullName
```

### For each candidate rule

1. Extract **key terms**: technical symbols named in the rule (file, flag, function, constant, lib). Ignore generic words (`must`, `never`, `pattern`, etc.).
2. For each term, grep in `aidd_docs/memory/` (bank + `internal/decisions/`) and in the legacy `aidd_docs/internal/decisions/`:
   ```bash
   rg "<term>" aidd_docs/memory aidd_docs/internal/decisions 2>/dev/null
   ```
3. Filter hits with `mtime` > rule's modification date.
4. **If hits found**: flag "rule potentially stale — verify contradiction" with:
   - rule path
   - rule date
   - list of newer files mentioning the same terms
   - excerpt of relevant passages
5. **Distinct confirmation** per flagged rule: show to user, ask:
   - "Update rule?" → manual or guided edit
   - "Rule still valid?" → touch the file (`touch` / `(Get-Item).LastWriteTime = Get-Date`) to push the next freshness deadline
   - "Rule obsolete?" → deletion after explicit confirmation

### Why this pass

The Phase A incremental scan covers what moved recently. A rule written 6 months ago and never edited since **will never be in the scan** — even if newer memory and decisions have rendered it obsolete. The freshness pass plugs that hole by starting from the rules themselves.

---

## Phase E — Report

List:
- N normative entries migrated from archive
- N existing rules enriched (partial coverage)
- N entries already covered by a rule (skip)
- N duplicates merged
- N contradictions resolved
- N patterns elevated to rules
- N obsolete decisions flagged
- N existing rules inspected, consolidated, retained, and moved to memory; N proposals pending approval
- Always-loaded bytes or tokens before and after, with conditional-rule size reported separately
- N rules flagged in freshness pass (updated / touched / deleted)

If invoked as a sub-phase of `harvest`, return these metrics to the orchestrator. Otherwise, write a standalone report at `aidd_docs/harvests/YYYY_MM_DD-reconcile-normative.md`.

## Evals

- [Existing-rule consolidation scenarios](evals/rule-load-scenarios.md)
