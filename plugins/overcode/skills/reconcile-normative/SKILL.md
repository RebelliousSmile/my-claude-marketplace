---
name: reconcile-normative
description: Reconciles normative content across archives (decisions/), project memory (memory/) and codified rules (.claude/rules/). Applies the normative-load rule, detects redundancy, contradictions, uncodified patterns and stale rules.
model: opus
---

# Reconcile-normative — normative content reconciliation

## Purpose

Apply the normative-load rule (`@.claude/rules/01-standards/1-normative-vs-archive.md`) to all normative sources in the project: drain the archive, detect duplicates and contradictions, elevate recurring patterns to rules, and flag existing rules potentially stale because newer memory or decision content has shifted under them.

## When to invoke

- As a sub-phase of `harvest` (global orchestration)
- Standalone when the user wants to audit normative content without triggering tracker/file lifecycle work

## Rules

- Never delete an archive file without explicit confirmation
- Never modify an existing rule without explicit confirmation
- Batch mode allowed: > 5 entries of the same nature → 3-sample preview then bulk

## Configuration (overridable via argument)

| Parameter | Default | Description |
|---|---|---|
| `rule_elevation_threshold` | 3 | Minimum number of decisions on the same topic to elevate to a rule |
| `rule_freshness_days` | 90 | Beyond this age, an unmodified rule becomes a candidate for the freshness pass |

---

## Phase A — Mapping (incremental scan + archive sweep)

### Sources

- `aidd_docs/internal/decisions/` — normative archive to drain
- `aidd_docs/memory/` — project memory (auto-loaded)
- `.claude/rules/` — codified rules (all categories 00-09)

### Reference rule

```markdown
@.claude/rules/01-standards/1-normative-vs-archive.md
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

List files in `aidd_docs/memory/` and `.claude/rules/` modified since that date (if no prior harvest: scan all):

```bash
# macOS / Linux
find aidd_docs/memory .claude/rules \
  -type f -name "*.md" -newer aidd_docs/harvests/<last-report>.md | sort

# Windows (PowerShell)
$lastHarvest = Get-ChildItem aidd_docs\harvests\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-ChildItem -Recurse -Filter "*.md" aidd_docs\memory, .claude\rules |
  Where-Object { $_.LastWriteTime -gt $lastHarvest.LastWriteTime } | Sort-Object Name | Select-Object -ExpandProperty FullName
```

### Archive sweep

List **every** file in `aidd_docs/internal/decisions/` (and any detected `*/decisions/`, `*/adr/`, `*/archive/`), with no date filter — their mere presence is the anomaly to resolve.

**The incremental scan is NOT a sweep replacement.** A prior harvest may have audited DEC-001 to DEC-024 and a new run may be tempted to scan only DEC-025+. Every file must be **classified** at every run (normative / historical / mixed) — even if previously seen. If a file was classified `historical` in a prior report and remains unchanged, log it as "skipped — historical, audited YYYY-MM-DD" rather than silently ignoring it. Never skip without explicit log entry.

**If both scans return nothing AND the archive sweep is empty → Phase A complete, skip to Phase D (freshness pass) then Phase E (report).**

Read each returned file. Build a topic map (lib/technology, functional domain) recording for each file: main topic, identified normative content, identified historical content.

---

## Phase B — Detection

For each scanned file, look for:

| Issue | Definition | Action |
|---|---|---|
| **Normative in archive** | File in `decisions/`, `adr/` or `archive/` — content with `must / never / always / required` or names a file/function/flag binding the future | Classify as `normative \| historical \| mixed`. Migrate the normative slice. See Phase C. |
| **Duplicate** | Same rule described in 2+ auto-loaded files | Merge into the most appropriate file |
| **Contradiction** | Two files prescribe opposite behaviors | Keep the most recent or specific, annotate the choice |
| **Recurring pattern** | Same constraint type in ≥ `rule_elevation_threshold` files in `memory/`, absent from rules | Elevate to a rule under `.claude/rules/<category>/` |
| **Obsolete decision** | References a lib, function or pattern that no longer exists | Flag to user |

The `rule_elevation_threshold` only applies to patterns observed in `memory/`. For archive files, **a single normative occurrence is enough** to trigger migration.

---

## Phase C — Consolidation

Apply Phase B actions. For each change:

- **Migrate a normative entry from archive**:
  0. **Verify no existing rule already covers the topic**: `rg` with **≥ 2 terms** in `.claude/rules/` — functional topic AND named technical symbol (file, flag, function, constant). Read the matched passage and check **normative force**, not just term presence:
     - **Full coverage** → matched passage uses `must` / `always` / `never` / `required` to enforce the same constraint. Do not duplicate, skip to next entry (count under "rule already covers")
     - **Partial coverage** → matched passage mentions the term but is descriptive (table, example, narrative) without imperative enforcement, OR rule's `paths:` does not cover the surface where the constraint applies. Enrich the **existing** rule (not memory), keep its `paths:` or extend it
     - **No coverage** → no match or matched passage is unrelated. Continue to step 1

A keyword grep that finds the term inside an example block or descriptive table is **not coverage** — the rule must impose the constraint, not merely mention it.
  1. Split normative slice / historical slice
  2. **Choose target — rule or memory** per the criterion below
  3. If **rule**: create/enrich a path-scoped rule
  4. If **memory**: pick the target file via the mapping below, read the template `aidd_docs/templates/aidd/memory/<file>.md` for the expected section
  5. Insert in the section's format (table row, 3-15 word bullet, H3 subtitle, mermaid block) — prefer existing sections; create a new section only if the file's spirit justifies it.

     **Content shaping rules** (apply to memory inserts only; for the rule branch at step 3, follow `.claude/rules/01-standards/1-rule-writing.md` — 3-7 word imperatives, no inline rationale):

     - **Imperative phrasing required**: write `Always X` / `Never Y` / `Must Z`. A descriptive bullet ("X is preferred", "we use Y") is read as a suggestion, not a constraint.
     - **Why-line when the rule isn't self-evident**: place rationale on a separate indented line below the bullet (`  **Why:** <reason>`), so the bullet itself keeps its 3-15 word cap. Skip the why-line when (a) the rule is already encoded in its section header (e.g. under `## Critical Patterns`, the imperative is implied) or (b) the constraint is universally known in the ecosystem (e.g. Firestore `limit()` quota cost). Without rationale, a rule is more easily downweighted when conflicting signals appear.
     - **No source trace back to the deleted ADR**: a `(cf. DEC-XYZ)` pointer dies the moment the source is deleted, and keeping the source as archive pollutes memory load 100 % of the time for a revert that happens ~1 % of the time. The bullet's own rationale is what carries the rule forward; the ADR is git history.
     - **For chain migrations into a consolidated section**: place rationale once in the H3 intro paragraph, not per bullet — individual bullets stay terse.
  6. Preserve frontmatter, ordering and style **of the target file** (informed by its template, not slavishly copied)
  7. Show the user the content to insert + propose **full deletion of the source** as default. Memory load is paid 100 % of the time; an archive (or even a stub) is consulted ~1 % of the time and weighs against every future read — git history is the revert path, not a kept file. Stub only if the user explicitly asks. **Distinct confirmation** per decision (or per grouped chain). **Batch mode**: if > 5 entries of the same nature, present a sample of 3 full decisions; if the user validates, apply the rest in bulk with a single final confirmation
- **Merge duplicate**: target file is the most recent; on tie, the most complete. Show both files and the proposed merge → **distinct confirmation**: "Merge and delete source?" Rewrite the target, delete the source only after agreement.
- **Elevate to rule**: create `.claude/rules/<category>/<n>-<topic>.md` (category 00-09 per `1-rule-structure.md`) following the template `aidd_docs/templates/aidd/rule.md` and the convention `1-rule-writing.md` (3-7 word bullets, `paths:` scoped to the affected files). Show the created rule and the source file list → **distinct confirmation**: "Does the rule fully cover these files? Delete sources?"

  **After creating any rule with a forbidden pattern**: grep the codebase scoped by the new rule's `paths:` to count violations. Forbidden patterns are bullets formed with `never`, `forbidden`, `must not`, `do not use`, etc.

  ```bash
  # Example — rule forbids `transition-all`, paths: **/*.vue, **/*.css
  rg -n "transition-all|transition: all" --glob "**/*.vue" --glob "**/*.css"
  ```

  If N > 0 violations: surface to the user as a separate signal — "Règle créée, mais N violations existent dans le code. Créer un audit / issue de cleanup ?". Never silent — a rule violated immediately at creation is dead weight.

### Target criterion — rule vs memory

| Pick a **rule** (`.claude/rules/...`) if | Pick **memory** (`aidd_docs/memory/...`) if |
|---|---|
| Topic is **path-scopable on a narrow surface** (glob isolating < ~30 % of code: `firebase.json`, `nuxt.config.ts`, `server/api/**`, `models/*.js`) | Topic is **transverse** or conceptual, or the natural glob is too broad (`**/*.vue`, `**/*.ts` alone — cover almost all app code) |
| Rule is **verifiable at write-time** (concrete convention, named anti-pattern, constant, required value) | Content is **explanatory**: why, context, principle, learning, runbook |
| Agent should see it **only** when touching the affected files | Agent should see it **always** (auto-loaded via `@aidd_project_memory`) |

On ambiguity: if the decision can be expressed as a testable code convention **and** scoped to a narrow surface, prefer **rule**. Otherwise **memory**.

### Topic → memory file mapping

The mapping below is a starting point, not exhaustive. When a topic spans multiple rows (e.g. auth ∈ {security, backend}), pick the file whose **template section** most closely matches the decision's substance. When no row fits, follow the fallback heuristic at the bottom.

| Decision topic | Memory file | Template sections to favor |
|---|---|---|
| Stack, naming, modules, service organization | `architecture.md` | Language/Framework, Naming Conventions, Services communication |
| Frontend ↔ backend API, request types, validation, error handling | `internal/backend_communication.md` | Services, Data Flow, Error Handling, Validation |
| Auth flows, security rules, custom claims, session handling, listener cleanup | `internal/backend_communication.md` (auth angle) — prefer a path-scoped rule if the convention is verifiable at write-time | Services, Error Handling |
| Real-time listeners, websocket / `onSnapshot` patterns | `internal/backend_communication.md` | Data Flow |
| DB schema, entities, migrations, seeding | `internal/database.md` | Main entities, Migrations, Seeding |
| Design system, theme, tokens, UI components, accessibility | `internal/design.md` | Design Implementation, Component Standards, Layout System |
| Forms, client validation, form state | `internal/forms.md` | State Management, Validation, Error handling, Form Flow |
| Navigation, browsing flow, lists/filters, product UX | `internal/browsing.md` | existing sections |
| CI/CD, hosting, env vars, monitoring, URLs | `deployment.md` | CI/CD Pipeline, Environments Variables, URLs, Monitoring & Logging |
| Caching strategy (HTTP headers, hosting cache, store TTL, query result cache) | `deployment.md` (hosting/CDN angle) or `architecture.md` (in-app cache angle) | CI/CD Pipeline, Services |
| Feature flags, kill switches, gradual rollout | `deployment.md` | Environments Variables |
| Test strategy, fixtures, mocks, test types | `testing.md` | Testing Strategy, Tools and Frameworks, Mocking |
| Repo overview | `codebase_map.md` | single flowchart |
| VCS, branches, commit conventions | `vcs.md` | template sections |
| Constants binding the future, business value assertions | `coding_assertions.md` | existing sections |
| Transverse principles, golden rules, general guardrails | `golden_principles.md` | existing sections |
| Product context, vision, target audience | `project_brief.md` | existing sections |
| i18n, localization, locale routing | `architecture.md` | Language/Framework |
| Performance decisions accumulated within an iteration | `iteration-N-perf-learnings.md` (or custom equivalent) | dedicated section per chain |
| Observability, tracking, operational metrics | `analytics_runbook.md` (or custom equivalent) | dedicated section |
| Consent, RGPD, tracking opt-in, cookie banners | `analytics_runbook.md` | dedicated section |
| Notifications (transactional email, marketing flows, push) | `analytics_runbook.md` or `internal/backend_communication.md` depending on angle | dedicated section |
| Multi-agent coordination, sub-agent invocation rules, parallel work conventions | `agents_coordination.md` | dedicated section |
| Custom main workflow, project-specific orchestration deviating from default AIDD flow | `custom-main-workflow.md` | dedicated section |
| Outside the taxonomy above | **First**: scan existing custom memory files (top-level `memory/*.md` not listed above) for a thematic fit. **Only if no fit**: propose creation to the user, justifying both the new file and the matching new template under `aidd_docs/templates/aidd/memory/`. | dedicated section |

If no file fits, **propose creation** to the user before acting: every new memory file must align with an existing template under `aidd_docs/templates/aidd/memory/` or justify adding a new template.

Any other deletion of a memory file → **user confirmation** before acting.

When several archive entries form a chain (supersession, shared topic), propose a grouped migration into **a single consolidated section** of the target file rather than per-entry inserts.

---

## Phase D — Existing-rules freshness pass

### Goal

Detect rules in `.claude/rules/` whose content may have been invalidated by a more recent decision or memory entry. This is the **inverse** of Phase C step 0: instead of asking "does a rule cover this new input?", ask "is this rule still consistent with recent inputs?"

### Candidate rule selection

List rules unmodified for `rule_freshness_days` days:

```bash
# macOS / Linux
find .claude/rules -type f -name "*.md" -mtime +90 | sort

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.md" .claude\rules |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) } |
  Sort-Object Name | Select-Object -ExpandProperty FullName
```

### For each candidate rule

1. Extract **key terms**: technical symbols named in the rule (file, flag, function, constant, lib). Ignore generic words (`must`, `never`, `pattern`, etc.).
2. For each term, grep in `aidd_docs/memory/` and `aidd_docs/internal/decisions/`:
   ```bash
   rg "<term>" aidd_docs/memory aidd_docs/internal/decisions
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
- N rules flagged in freshness pass (updated / touched / deleted)

If invoked as a sub-phase of `harvest`, return these metrics to the orchestrator. Otherwise, write a standalone report at `aidd_docs/harvests/YYYY_MM_DD-reconcile-normative.md`.
