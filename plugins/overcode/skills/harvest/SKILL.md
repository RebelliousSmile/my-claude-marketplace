---
name: harvest
description: Global maintenance skill — reconciles tracker items with implemented AIDD plan directories and legacy processed plans, harvests durable decisions, purges eligible task artifacts, and reviews what remains
author: François-Xavier Guillois
version: 4.7.0
vibe_version: ">=1.0.0"
permissions:
  - files
  - bash
tags:
  - collection
  - workflow
  - automation
  - productivity
  - data-mining
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Harvest — global plan and tracker maintenance

## Purpose

Clean up the growing `aidd_docs/tasks/` tree, reconcile it with the product artifacts of `aidd_docs/backlog/`, close orphan tracker items, reconcile memory and rules accumulated by `/learn`, then methodically review every remaining artifact. Modern AIDD work is owned by a feature directory containing `plan.md` and `phase-<n>.md`; plan lifecycle is read from `plan.md` frontmatter, never from a filename suffix.

## Processing order

1. Completed plans and ephemeral files first (phases 2–5)
2. Remaining files next, by type (phase 6)

## Rules

- Never close a tracker item without showing the closing comment to the user
- Never delete files without explicit confirmation
- Use only the CLI detected in Phase 1 for tracker operations (never MCP)
- Shell commands adapted to the OS detected in Phase 1

## Configuration (defaults, overridable via argument)

| Parameter | Default | Description |
|---|---|---|
| `plan_warn_days` | 14 | Age above which an active plan is flagged |
| `plan_stale_days` | 60 | Age above which an active plan is proposed for deletion |
| `audit_stale_days` | 90 | Age above which an audit is flagged |
| `rule_elevation_threshold` | 3 | Minimum number of decisions on the same topic to propose rule elevation |

If the user passes an argument (e.g. `/harvest plan_stale_days=30`), use the provided value.

---

## Phase 1 — Full inventory

Detect the OS from the session context **once** and remember it for all subsequent phases.

Detect the tracker type **once** and remember it:

| Priority | Tracker | Detection |
|---|---|---|
| 1 | **GitHub** | `gh repo view` returns without error |
| 2 | **GitLab** | `glab repo view` returns without error |
| 3 | **Local** | User stories present in `aidd_docs/backlog/stories/` or, legacy, in `aidd_docs/tasks/` (type 10 below) |
| 4 | **None** | None of the above |

List every `.md` file in the two AIDD roots this skill owns — `aidd_docs/tasks/` (plan lifecycle) and `aidd_docs/backlog/` (product artifacts, `aidd-pm`). Skip either root when absent, without failing:

```bash
# macOS / Linux
find aidd_docs/tasks aidd_docs/backlog -type f -name "*.md" 2>/dev/null | sort

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.md" aidd_docs/tasks, aidd_docs/backlog -ErrorAction SilentlyContinue |
  Sort-Object Name | Select-Object -ExpandProperty FullName
```

Build **feature-directory records first** for every `aidd_docs/tasks/<yyyy_mm>/<yyyy_mm_dd>_<slug>/plan.md`: read its frontmatter `status`, enumerate its sibling `phase-<n>.md`, its optional `review.md`, and every other artifact the folder holds (spec, browser-QA report, notes), and treat that set as one plan unit. Do not count files owned by a feature directory again as loose plans, checklists or reviews.

The `status` set is owned by `aidd-dev:01-plan` — see its `references/plan-status.md` (`pending → in-progress → implemented → reviewed`, `blocked` reachable from any active state). Never invent a value outside it.

**A directory with no direct `plan.md` is never a plan unit.** It is classified by type 3 or 4 below and handled as one unit by age; its files are never age-deleted under the plan rules.

Then classify directories and remaining loose files in this order:

| Priority | Type | Detection | Action |
|---|---|---|---|
| 1 | **Completed feature directory** | direct `plan.md` has `status: implemented` or `status: reviewed` | Harvest the directory → purge its enumerated files if eligible |
| 2 | **Active feature directory** | direct `plan.md` has `status: pending`, `in-progress`, or `blocked` | Review as active or abandoned; never infer completion from phase contents |
| 3 | **Audit run** | `aidd_docs/tasks/<yyyy_mm>/<yyyy_mm_dd>_audit/` (`<pillar>.md` + optional `report.md`, `aidd-dev:04-audit`), or legacy `aidd_docs/tasks/audits/**` | Review by age as one unit (Phase 6f) |
| 4 | **Non-plan output directory** | any other directory with no direct `plan.md`, whether under `aidd_docs/tasks/<yyyy_mm>/` — e.g. `<yyyy_mm_dd>_memory-check/` (`aidd-context:02-project-memory`), a standalone browser-QA run — or directly under `aidd_docs/tasks/`: the report roots `status/`, `memory/`, `audits/` (`overcode:status`) | Review by age as one unit (Phase 6g) |
| 5 | **Legacy completed plan** | loose `*.processed.md` | Harvest → purge if eligible |
| 6 | **Loose review** | `*.review*.md` outside a feature directory | Purge if eligible |
| 7 | **Journey** | `*.journey.md` outside a feature directory | Purge if eligible |
| 8 | **Autonomous tracking file** | loose `aidd_docs/tasks/<task-name>.md` whose frontmatter carries `success_condition` or `iteration` (`aidd-dev:09-for-sure`) | Status-driven, never age-driven (Phase 6h) |
| 9 | **Product artifact** | `*-prd.md` (`aidd-pm:03-prd`), or any file under `aidd_docs/backlog/` other than a story (`tasks/`, `defects/`, `spikes/`, `epics/`) | **Never purged** — report only |
| 10 | **User story** | `aidd_docs/backlog/stories/*.md`; legacy: frontmatter `type: user-story`, or `# User Story` / `## Acceptance Criteria` in content, or `story-` prefix under `aidd_docs/tasks/` | Purge if tracker item closed or `status: done` |
| 11 | **Legacy checklist / phase** | loose `*checklist*` or `*phase-[0-9]*`; sibling phases inside a feature directory stay owned by it | Purge if tracker item closed |
| 12 | **Legacy sub-plan** | `-part-[0-9]` or `-master` in name **AND** a sibling `-master.md` or `-master.processed.md` exists | Apply legacy master rules |
| 13 | **Legacy active plan** | remaining loose `.md` file under `aidd_docs/tasks/` | Review as active or abandoned |

Any other `status` value or malformed/missing frontmatter on a feature `plan.md` is **invalid**, not active: report it and exclude the directory from closure and purge until corrected.

Detect the project source directories here too (e.g. `src/`, `app/`, `components/`, `lib/`), from the repository layout: Phase 5b needs them.

Print the per-type summary: N completed feature directories, N active feature directories, N audit runs, N non-plan output directories, N legacy processed plans, N loose reviews, N journeys, N autonomous tracking files, N product artifacts, N user stories, N legacy checklists, N legacy sub-plans and N legacy active plans.

---

## Phase 2 — Tracker reconciliation

This phase's behavior depends on the tracker detected in Phase 1.

### Tracker: GitHub

Check the total item count:

```bash
# macOS / Linux
gh issue list --state all --json number | jq 'length'

# Windows (PowerShell)
gh issue list --state all --json number | ConvertFrom-Json | Measure-Object | Select-Object -ExpandProperty Count
```

If total ≤ 200: single query:

```bash
gh issue list --state all --limit 200 --json number,state,title,url
```

If total > 200: two separate queries, concatenate results:

```bash
gh issue list --state open   --limit 500 --json number,state,title,url
gh issue list --state closed --limit 500 --json number,state,title,url
```

### Tracker: GitLab

```bash
glab issue list --all --output json
```

If pagination is needed, use `--page` and `--per-page 100`.

### Tracker: Local (user stories only)

Read each user story — `aidd_docs/backlog/stories/*.md` first, legacy stories under `aidd_docs/tasks/` second. An item is considered **closed** if its frontmatter contains `status: done` or `status: closed`. No network calls.

### Tracker: None

All completed feature directories and legacy `.processed.md` files are treated as group C — Phase 3 is skipped.

---

### Extracting the associated tracker item

For each completed plan root — modern `<feature-directory>/plan.md` first, legacy `.processed.md` second — extract the tracker identifier in this order:
1. Frontmatter `issue_number:` or `tracker_id:`
2. Filename: `issue-42` prefix, `#42-` segment, or `story-slug`
3. Content: `Fixes #42`, `Closes #42`, `**Issue:** #42`, `**Story:**`
4. Fully-numeric isolated segment (`-42-` only if not preceded by a `YYYY_MM_DD` date)

Build the association table. Files inside a modern feature directory inherit that directory's group directly. For every loose review variant, `.journey.md`, user story, checklist and legacy sub-plan, find a modern feature directory or legacy processed/active plan with the same slug and inherit its group.

**Base matching for loose legacy artifacts** — use the modern feature-directory name or the legacy filename, then strip the leading date prefix and lifecycle suffix before comparing. Reviews and plans may have different `YYYY_MM_DD`:

- `2026_05_07-#83-firebase-bundle-split.review_code.md` → slug `#83-firebase-bundle-split`
- `2026_05/2026_05_06_#83-firebase-bundle-split/plan.md` → directory slug `#83-firebase-bundle-split`
- `2026_05_06-#83-firebase-bundle-split.processed.md` → slug `#83-firebase-bundle-split`
- → either plan form matches the loose review, which inherits its group

Only fall back to "orphan" if no modern feature directory or legacy active/processed plan shares the slug.

### Groups

- **A — Tracker item open with completed plan** → close in Phase 3, then purge the completed feature directory or legacy processed plan in Phase 5
- **B — Tracker item closed** → purge directly in Phase 5
- **C — No tracker item detected** → purge directly in Phase 5 (Phase 3 skipped — internal or direct task)

---

## Phase 3 — Tracker item closure (group A)

**If group A is empty → skip directly to Phase 4.**

For each item in group A, build the closing comment from this format:

```markdown
## Travaux terminés

**Branche :** `{Branch}`
**PR / MR :** {PR}
**Résumé :** {Done}

---

**Changelog :** `{Changelog}`
**Plan :** `{Plan}`

{Notes}
```

If the project declares its own closing-comment convention (project VCS memory, e.g. `aidd_docs/memory/vcs.md` or `aidd_docs/memory/core/vcs.md`), follow it instead — never fail because a project template is absent.

Fill the variables in this order:
- `{Branch}`: from the plan (`**Branch name**`)
- `{PR}` / `{MR}`: search for a PR/MR associated with the branch — if none, set to `none`
- `{Done}`: summary line from `## Summary` or `## Objectif` in the plan
- `{Changelog}`: scope and type inferred from the plan
- `{Plan}`: relative path of the modern feature directory's `plan.md`, or of the legacy `.processed.md`
- `{Notes}`: summary of the associated `.review.md` if present, otherwise omit the section

Write the comment to a temporary file:

```bash
# macOS / Linux: /tmp/harvest-close-<n>.md
# Windows     : $env:TEMP\harvest-close-<n>.md
```

Show it to the user and **wait for confirmation** before posting.

**GitHub:**
```bash
# macOS / Linux
gh issue comment <n> --body-file /tmp/harvest-close-<n>.md && gh issue close <n>

# Windows
gh issue comment <n> --body-file "$env:TEMP\harvest-close-<n>.md" && gh issue close <n>
```

**GitLab:**
```bash
# macOS / Linux
glab issue note <n> --message "$(cat /tmp/harvest-close-<n>.md)" && glab issue close <n>

# Windows
glab issue note <n> --message (Get-Content "$env:TEMP\harvest-close-<n>.md" -Raw) && glab issue close <n>
```

**Local (user story):**
Update the user story's frontmatter: `status: done`.

The `&&` ensures the item is only closed if the comment was posted successfully.

---

## Phase 4 — Memory & normative-load reconciliation (sub-skill)

This phase is delegated to the `reconcile-normative` skill:

```markdown
@../reconcile-normative/SKILL.md
```

Invoke the skill, wait for its user confirmations, collect the returned metrics (entries migrated, rules enriched, duplicates merged, contradictions resolved, patterns elevated, obsolete decisions, rules flagged in the freshness pass) and merge them into the Phase 7 final report.

`reconcile-normative` can also be invoked standalone outside harvest when the user wants a normative audit without tracker/file lifecycle work.

---

## Phase 5 — Purge of ephemeral files

**Order constraint**: Phase 4 must complete before Phase 5. A completed feature directory or legacy `.processed.md` may contain a normative slice that Phase 4 needs to elevate — purging first destroys the source. Never reorder.

`aidd-context:10-learn` normally ran at task closure (it is a step of the `endtask` alias chain), so a completed feature directory can be purged as soon as its tracker item is confirmed closed. `endtask` is not mandatory: a plan closed by a bare `aidd-dev:02-implement` never passed through learn. When no learn trace exists for the feature (no memory entry, ADR, or rule referencing its slug), say so before the purge confirmation and offer to run `aidd-context:10-learn` first — Phase 4 is the last chance to capture what the directory holds. `status: implemented|reviewed` in `plan.md` is the completion marker; no rename or extra suffix is expected. Legacy `.processed.md` remains eligible under the same rule.

Eligibility criteria:

| Type | Purge condition |
|---|---|
| Completed feature directory group A | Tracker item closed in Phase 3; enumerate `plan.md`, declared phases, `review.md` and other files in the directory for the confirmation |
| Completed feature directory group B | Tracker item already closed; enumerate the directory's files for the confirmation |
| Completed feature directory group C | No tracker item — enumerate the directory's files for the confirmation |
| Legacy `.processed.md` group A/B/C | Same group rules as before |
| Loose `.review*.md` | completed plan root of the same slug (any group) — or orphan with no completed **nor active** plan root of the same slug |
| `.journey.md` | completed plan root of the same slug (any group) — or orphan with no completed **nor active** plan root of the same slug |
| Audit runs, non-plan output directories | **Never purged here** — handled in Phase 6 |
| Autonomous tracking files (`09-for-sure`) | **Never purged here** — handled in Phase 6 |
| Product artifacts (`*-prd.md`, `aidd_docs/backlog/` outside `stories/`) | **Never purged** — owned by `aidd-pm`, reported only |
| Other types | **Never purged here** — handled in Phase 6 |

Build the eligible-files list. For a feature directory, list every file explicitly; never delete the directory recursively or include an unenumerated file. Display each relative path with its modification date. Ask for a single confirmation:

> "Delete these N files? (irreversible)"

```bash
# macOS / Linux
rm <file1> <file2> ...

# Windows (PowerShell)
Remove-Item -Path "<file1>", "<file2>", ...
```

---

## Phase 5b — Code and documentation freshness audit (taste)

This phase is delegated to the `taste` skill:

```markdown
@../taste/SKILL.md
```

Run both modes in sequence:

1. **assess-doc scan mode** — scan all `.md` files remaining after Phase 5 (oldest-first). Skip files already purged in Phase 5.
2. **assess-code** — scan the project source directories detected in Phase 1 (`src/`, `app/`, `components/`, `lib/`, …). Skip `node_modules/`, `.git/`, `vendor/`, `dist/`.

Collect the returned metrics and merge them into the Phase 7 final report:
- N docs Obsolète, N docs Partiel, N docs Current
- N code findings (by type: missing import, missing function, rule violation, stale comment)

`taste` can also be invoked standalone outside harvest when the user wants an obsolescence check without tracker/file lifecycle work.

---

## Phase 6 — Methodical review of remaining files

Analyze each type below and **collect** all proposed actions without acting. Present the consolidated table at the end of the phase, then wait for a single confirmation before acting.

### 6a — User stories

Cover `aidd_docs/backlog/stories/*.md` and legacy stories left under `aidd_docs/tasks/`. Other `aidd_docs/backlog/` artifacts (tasks, defects, spikes, epics) belong to `aidd-pm`: report their count, never propose an action on them.

For each user story, check the associated tracker item (same extraction as Phase 2):
- Tracker item **closed** or frontmatter `status: done` → collect: **delete**
- Tracker item **open** → collect: **keep**, flag
- **No tracker item** → collect: **needs clarification** (ask the user)

### 6b — Checklists and intermediate phases

For a `phase-<n>.md` inside a modern feature directory, inherit the directory decision; never classify or delete the phase independently. For each loose legacy checklist/phase file:

- Its modern plan root is completed, or its legacy master is `.processed.md` → collect: **delete**
- Its modern or legacy master plan is still active → collect: **keep**
- **No master found** → collect: **orphan — needs clarification**

### 6c — Sub-plans (`-part-N`, `-master`)

These are legacy-only rules; modern phased work uses a feature directory and is handled as one unit. For each loose master (`-master.md`):
- A `-master.processed.md` file **exists** → collect: **delete** all associated `-part-N`
- No `.processed.md` yet but **associated tracker item closed** (same extraction as Phase 2) → collect: **delete** the master AND all its `-part-N` (legacy work done, completion marker absent)
- No `.processed.md` yet and tracker item **open or absent** → collect: **keep**

For each `-part-N` with no detectable master → fall back to Active plan (Phase 6d).

### 6d — Active plans potentially abandoned

For each active modern feature directory (`plan.md` status `pending`, `in-progress`, or `blocked`), compute age from the directory's leading `YYYY_MM_DD` or its `plan.md` modification date. Apply the same age table below to the directory as a unit. Never treat `phase-<n>.md` as separate active plans.

Apply the same logic to each remaining loose legacy `.md` plan — that is, a file matched by no earlier type: not processed, user story, checklist, sub-plan, autonomous tracking file (6h), or product artifact (`*-prd.md`, `aidd_docs/backlog/`). Those last two never enter the age table.

Compute age from the date in the filename (`YYYY_MM_DD`) or from the modification date.

| Age | Collected action |
|---|---|
| < 14 days | **keep** — probably in progress |
| 14–60 days | **needs clarification** — still active, abandoned, or waiting for implementation? |
| > 60 days | **delete** — abandoned plan |

For plans whose associated tracker item is **closed** (regardless of age) → collect: **delete**. Apply the same extraction rules as Phase 2 (frontmatter, filename, content) to find the tracker identifier.

For a modern feature directory with `review.md` but a plan still `pending`, `in-progress`, or `blocked` → collect: **needs clarification** (ask whether implementation must resume or the plan status/report is inconsistent). Never infer `implemented` from the review file.

For loose legacy plans with a `.review*.md` of the same slug and created the same day → collect: **needs clarification**. A review file alone does not prove completion and never justifies an automatic delete or a `.processed.md` rename.

### 6e — Active plans without tracker item nor sufficient age

Completed feature directories and legacy `.processed.md` group C plans are purged in Phase 5 — this section no longer covers them.

For active modern feature directories or loose legacy plans with no detected tracker item and within the 14–60 day band (Phase 6d "needs clarification"): ask whether the plan is still active, abandoned, or whether a tracker item should be created to track it.

### 6e-bis — Group C cluster signal

If Phase 5 purged ≥ 5 completed feature directories and/or legacy `.processed.md` group C plans sharing a thematic prefix (same feature area, same `perf-*`, `psi-*`, etc. slug fragment), surface to the user:

> "N plans groupe C purgés sur le thème `<slug>`. Workflow drift possible : `endtask` exécuté sans tracker associé. Créer une issue de tracking rétroactif ?"

Never silent — recurring group C is a signal, not a normal mode.

### 6f — Audit runs

Cover both layouts: the modern run directory `aidd_docs/tasks/<yyyy_mm>/<yyyy_mm_dd>_audit/` (`aidd-dev:04-audit`) and the legacy `aidd_docs/tasks/audits/**`. Treat a run directory as **one unit** — never classify `<pillar>.md` or `report.md` separately, never let them fall back to the active-plan age table. Compute age from the directory's leading `YYYY_MM_DD`, or from the newest file's modification date.

| Age | Collected action |
|---|---|
| < 90 days | **keep** — recent snapshot |
| > 90 days | **needs clarification** — still relevant or to delete? |

### 6g — Non-plan output directories

Directories with no direct `plan.md` that are not audit runs, at either depth:

- under `aidd_docs/tasks/<yyyy_mm>/` — `<yyyy_mm_dd>_memory-check/` (`aidd-context:02-project-memory`), a standalone browser-QA run, any other report folder;
- directly under `aidd_docs/tasks/` — the report roots `status/` and `memory/` written by `overcode:status`, holding `<yyyy>_<mm>_<dd>_project_status.md` and `<yyyy>_<mm>_<dd>_project_memory.md`.

A report root is never one unit: its dated files accumulate independently, so age each file on its own name or mtime and offer the older ones for deletion together, keeping the most recent one whatever its age — `previously` and `status` read it. Everything else follows 6f: one unit, age from the directory's `YYYY_MM_DD` or its newest file, same 90-day table. Never a plan, never subject to the 14/60-day plan bands.

### 6h — Autonomous tracking files (`09-for-sure`)

For each loose `aidd_docs/tasks/<task-name>.md` carrying `success_condition` or `iteration` in its frontmatter, decide on **status only**, never on age — an autonomous loop can idle for months and stay live:

| Frontmatter `status` | Collected action |
|---|---|
| `done` / `completed` | **delete** — the success condition was met |
| `pending`, `in-progress`, `blocked` | **keep**, flag with its `iteration` count |
| absent or unknown | **needs clarification** |

### Consolidated confirmation

Present the table of all collected actions:

| File | Type | Proposed action | Reason |
|---|---|---|---|
| `{path}` | feature directory / legacy plan / user story / checklist / sub-plan / group C / audit run / non-plan output / autonomous tracking | delete / keep / needs clarification | {short reason} |

Resolve **needs clarification** rows first by asking grouped questions. Once all decisions are made, ask for a single confirmation:

> "Apply these N deletions? (irreversible)"

---

## Phase 7 — Final report

Fill this report template:

````markdown
# Harvest — {YYYY_MM_DD}

## Tracker

| Groupe | Items fermés | Fichiers purgés |
|--------|-------------|-----------------|
| A — issue ouverte + plan terminé | {tracker_a_closed} | {tracker_a_purged} |
| B — issue déjà fermée | — | {tracker_b_purged} |
| C — sans issue | — | {tracker_c_purged} |
| **Total** | **{tracker_total_closed}** | **{tracker_total_purged}** |

## Normative (`reconcile-normative`)

| Métrique | Valeur |
|----------|--------|
| Entrées migrées depuis l'archive | {norm_migrated} |
| Règles existantes enrichies (couverture partielle) | {norm_enriched} |
| Entrées déjà couvertes (skip) | {norm_skipped} |
| Doublons fusionnés | {norm_duplicates} |
| Contradictions résolues | {norm_contradictions} |
| Patterns élevés en règles | {norm_elevated} |
| Décisions obsolètes signalées | {norm_obsolete} |
| Règles passées en freshness (mises à jour / touchées / supprimées) | {norm_freshness} |

## Fraîcheur (`taste`)

### Documentation

| Statut | N |
|--------|---|
| Obsolète | {taste_doc_obsolete} |
| Partiel | {taste_doc_partial} |
| Current | {taste_doc_current} |

### Code

| Type de finding | N |
|----------------|---|
| Import manquant | {taste_code_missing_import} |
| Fonction manquante | {taste_code_missing_function} |
| Violation de règle | {taste_code_rule_violation} |
| Commentaire périmé | {taste_code_stale_comment} |

## Fichiers revus (Phase 6)

| Type | Supprimés | Conservés | Clarification demandée |
|------|-----------|-----------|------------------------|
| User stories | {p6_story_del} | {p6_story_keep} | {p6_story_ask} |
| Checklists / phases | {p6_check_del} | {p6_check_keep} | {p6_check_ask} |
| Sub-plans | {p6_sub_del} | {p6_sub_keep} | {p6_sub_ask} |
| Plans actifs | {p6_plan_del} | {p6_plan_keep} | {p6_plan_ask} |
| Audits | {p6_audit_del} | {p6_audit_keep} | {p6_audit_ask} |
| Sorties non-plan | {p6_out_del} | {p6_out_keep} | {p6_out_ask} |
| Suivis autonomes (`09-for-sure`) | {p6_loop_del} | {p6_loop_keep} | {p6_loop_ask} |

## Notes

<!-- Observations ponctuelles, dérives signalées (group C cluster, violations de règle créée, etc.) -->
````

Write the report to:

```
aidd_docs/harvests/YYYY_MM_DD-harvest.md
```

`aidd_docs/harvests/` is a reports directory — it is never scanned by Phase 1 and its files are never purged.

The report must include the metrics returned by Phase 4 (`reconcile-normative`) and Phase 5b (`taste`):

| Section | Metrics to include |
|---|---|
| Tracker | Items closed, files purged (by group) |
| Normative | Entries migrated, rules enriched, duplicates merged, patterns elevated, obsolete decisions, rules refreshed |
| Freshness | Docs Obsolète / Partiel / Current; code findings by type (missing import, missing function, rule violation, stale comment) |
| Files reviewed | Actions taken per type (Phase 6), including audit runs, non-plan output directories and autonomous tracking files |

Display the full report. If 0 actions taken → "Nothing to do — directory clean."
