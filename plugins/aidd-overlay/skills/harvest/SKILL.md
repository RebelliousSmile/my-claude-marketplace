---
name: harvest
description: Global maintenance skill — reconciles tracker items with processed plans, harvests non-obvious decisions into memory/rules, purges ephemeral task files, reviews all remaining files methodically
model: opus
---

# Harvest — global plan and tracker maintenance

## Purpose

Clean up the growing `aidd_docs/tasks/` directory, close orphan tracker items, reconcile memory and rules accumulated by `/learn`, then methodically review every remaining file.

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
| 3 | **Local** | User stories present in `aidd_docs/tasks/` (type 5 below) |
| 4 | **None** | None of the above |

List every `.md` file in `aidd_docs/tasks/`:

```bash
# macOS / Linux
find aidd_docs/tasks -type f -name "*.md" | sort

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.md" aidd_docs/tasks | Sort-Object Name | Select-Object -ExpandProperty FullName
```

Classify each file (priority decreasing on the compound extension, then on directory and name):

| Priority | Type | Detection | Action |
|---|---|---|---|
| 1 | **Completed plan** | `*.processed.md` | Harvest → purge if eligible |
| 2 | **Review** | `*.review*.md` (covers `.review.md`, `.review_code.md`, `.review_functional.md`, future variants) | Purge if eligible |
| 3 | **Journey** | `*.journey.md` | Purge if eligible |
| 4 | **Audit** | `aidd_docs/tasks/audits/**` (directory) | Review by age |
| 5 | **User story** | frontmatter `type: user-story`, or `# User Story` / `## Acceptance Criteria` in content, or `story-` prefix | Purge if tracker item closed or `status: done` |
| 6 | **Checklist / phase** | `*checklist*`, `*phase-[0-9]*` in name | Purge if tracker item closed |
| 7 | **Sub-plan** | `-part-[0-9]` or `-master` in name **AND** a sibling `-master.md` or `-master.processed.md` exists | Purge if master plan `.processed.md` exists |
| 8 | **Active plan** | `.md` without any of the above suffixes (including `-part-N` or `-master` with no detectable master — fallback) | Review: active or abandoned? |

Print the per-type summary: N processed, N reviews, N journeys, N audits, N user stories, N checklists, N sub-plans, N active plans.

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

Read each user story. An item is considered **closed** if its frontmatter contains `status: done` or `status: closed`. No network calls.

### Tracker: None

All `.processed.md` files are treated as group C — Phase 3 is skipped.

---

### Extracting the associated tracker item

For each `.processed.md`, extract the tracker identifier in this order:
1. Frontmatter `issue_number:` or `tracker_id:`
2. Filename: `issue-42` prefix, `#42-` segment, or `story-slug`
3. Content: `Fixes #42`, `Closes #42`, `**Issue:** #42`, `**Story:**`
4. Fully-numeric isolated segment (`-42-` only if not preceded by a `YYYY_MM_DD` date)

Build the association table: for each review variant, `.journey.md`, user story, checklist and sub-plan, find the `.processed.md` or plan with the same base and inherit its group.

**Base matching** — slug post-date, not full filename. Reviews and processed plans often have different `YYYY_MM_DD` (review created the day reviewer ran, plan created earlier). Strip the leading date prefix before comparing:

- `2026_05_07-#83-firebase-bundle-split.review_code.md` → slug `#83-firebase-bundle-split`
- `2026_05_06-#83-firebase-bundle-split.processed.md` → slug `#83-firebase-bundle-split`
- → match (same slug, different date) — review inherits the processed group

Only fall back to "orphan" if no plan or processed shares the slug.

### Groups

- **A — Tracker item open with completed plan** → close in Phase 3, then purge in Phase 5
- **B — Tracker item closed** → purge directly in Phase 5
- **C — No tracker item detected** → purge directly in Phase 5 (Phase 3 skipped — internal or direct task)

---

## Phase 3 — Tracker item closure (group A)

**If group A is empty → skip directly to Phase 4.**

For each item in group A, read the template:

```
aidd_docs/templates/custom/close-issue.md
```

Fill the variables in this order:
- `{Branch}`: from the plan (`**Branch name**`)
- `{PR}` / `{MR}`: search for a PR/MR associated with the branch — if none, set to `none`
- `{Done}`: summary line from `## Summary` or `## Objectif` in the plan
- `{Changelog}`: scope and type inferred from the plan
- `{Plan}`: relative path of the `.processed.md`
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

**Order constraint**: Phase 4 must complete before Phase 5. A `.processed.md` may contain a normative slice that Phase 4 needs to elevate — purging first destroys the source. Never reorder.

Since `/learn` already ran at `end_plan`, `.processed.md` files can be purged as soon as the tracker item is confirmed closed — no extra marker needed.

Eligibility criteria:

| Type | Purge condition |
|---|---|
| `.processed.md` group A | Tracker item closed in Phase 3 |
| `.processed.md` group B | Tracker item already closed |
| `.processed.md` group C | No tracker item — purge directly |
| `.review.md` | `.processed.md` of the same base (any group) — or orphan with no `.processed.md` **nor active plan** of the same base |
| `.journey.md` | `.processed.md` of the same base (any group) — or orphan with no `.processed.md` **nor active plan** of the same base |
| Audits | **Never purged here** — handled in Phase 6 |
| Other types | **Never purged here** — handled in Phase 6 |

Build the eligible-files list. Display with relative path and modification date. Ask for a single confirmation:

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
2. **assess-code** — scan the project source directories detected in Phase 1 (e.g., `src/`, `app/`, `components/`). Skip `node_modules/`, `.git/`, `vendor/`, `dist/`.

Collect the returned metrics and merge them into the Phase 7 final report:
- N docs Obsolète, N docs Partiel, N docs Current
- N code findings (by type: missing import, missing function, rule violation, stale comment)

`taste` can also be invoked standalone outside harvest when the user wants an obsolescence check without tracker/file lifecycle work.

---

## Phase 6 — Methodical review of remaining files

Analyze each type below and **collect** all proposed actions without acting. Present the consolidated table at the end of the phase, then wait for a single confirmation before acting.

### 6a — User stories

For each user story, check the associated tracker item (same extraction as Phase 2):
- Tracker item **closed** or frontmatter `status: done` → collect: **delete**
- Tracker item **open** → collect: **keep**, flag
- **No tracker item** → collect: **needs clarification** (ask the user)

### 6b — Checklists and intermediate phases

For each checklist/phase file:
- Its master plan (same base without `-phase-N` or `-checklist`) is **`.processed.md`** → collect: **delete**
- Master plan **still active** → collect: **keep**
- **No master found** → collect: **orphan — needs clarification**

### 6c — Sub-plans (`-part-N`, `-master`)

For each master (`-master.md`):
- A `-master.processed.md` file **exists** → collect: **delete** all associated `-part-N`
- No `.processed.md` yet but **associated tracker item closed** (same extraction as Phase 2) → collect: **delete** the master AND all its `-part-N` (work done, `end_plan` not run)
- No `.processed.md` yet and tracker item **open or absent** → collect: **keep**

For each `-part-N` with no detectable master → fall back to Active plan (Phase 6d).

### 6d — Active plans potentially abandoned

For each `.md` plan with no suffix (not processed, not user story, not checklist, not sub-plan):

Compute age from the date in the filename (`YYYY_MM_DD`) or from the modification date.

| Age | Collected action |
|---|---|
| < 14 days | **keep** — probably in progress |
| 14–60 days | **needs clarification** — still active, abandoned, or to archive? |
| > 60 days | **delete** — abandoned plan |

For plans whose associated tracker item is **closed** (regardless of age) → collect: **delete**. Apply the same extraction rules as Phase 2 (frontmatter, filename, content) to find the tracker identifier.

For plans with a `.review*.md` of the same slug AND created the same day → collect: **needs clarification** (ask: "plan terminé — lancer end_plan ? ou en cours ?"). Never auto-keep — same-day review without `.processed.md` is a signal that `end_plan` was forgotten.

For plans with a `.review.md` of the same base → collect: **delete** the plan and its `.review.md` (work done, `end_plan` not run).

### 6e — Active plans without tracker item nor sufficient age

`.processed.md` group C files are purged in Phase 5 — this section no longer covers them.

For active plans (raw `.md`) with no detected tracker item and within the 14–60 day band (Phase 6d "needs clarification"): ask whether the plan is still active, abandoned, or whether a tracker item should be created to track it.

### 6e-bis — Group C cluster signal

If Phase 5 purged ≥ 5 `.processed.md` group C files sharing a thematic prefix (same feature area, same `perf-*`, `psi-*`, etc. slug fragment), surface to the user:

> "N plans groupe C purgés sur le thème `<slug>`. Workflow drift possible : `end_plan` exécuté sans tracker associé. Créer une issue de tracking rétroactif ?"

Never silent — recurring group C is a signal, not a normal mode.

### 6f — Audits

For each file in `audits/`:

| Age | Collected action |
|---|---|
| < 90 days | **keep** — recent snapshot |
| > 90 days | **needs clarification** — still relevant or to delete? |

### Consolidated confirmation

Present the table of all collected actions:

| File | Type | Proposed action | Reason |
|---|---|---|---|
| `{path}` | user story / checklist / sub-plan / active plan / group C / audit | delete / keep / needs clarification | {short reason} |

Resolve **needs clarification** rows first by asking grouped questions. Once all decisions are made, ask for a single confirmation:

> "Apply these N deletions? (irreversible)"

---

## Phase 7 — Final report

Fill the report template:

```
aidd_docs/templates/harvest.md
```

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
| Files reviewed | Actions taken per type (Phase 6) |

Display the full report. If 0 actions taken → "Nothing to do — directory clean."
