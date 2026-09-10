# Harvest remaining-artifact contract

## Classification order

After feature-directory records are reserved, classify directories and loose files in this order:

| Priority | Type | Detection |
|---:|---|---|
| 1 | Completed feature directory | direct `plan.md` is `implemented` or `reviewed` |
| 2 | Active feature directory | direct `plan.md` is `pending`, `in-progress`, or `blocked` |
| 3 | Audit run | `tasks/YYYY_MM/YYYY_MM_DD_audit/` or legacy `tasks/audits/` |
| 4 | Non-plan output | any other directory without direct `plan.md`, including memory check, browser QA, `status/`, and `memory/` |
| 5 | Legacy completed plan | loose `*.processed.md` |
| 6 | Loose review | `*.review*.md` outside a feature directory |
| 7 | Journey | `*.journey.md` outside a feature directory |
| 8 | Autonomous tracking | loose task file with `success_condition` or `iteration` frontmatter |
| 9 | Product artifact | `*-prd.md` or backlog artifact outside `stories/` |
| 10 | User story | backlog story or legacy story markers |
| 11 | Legacy checklist or phase | loose checklist or numbered phase |
| 12 | Legacy sub-plan | `-part-N` or `-master` with a matching legacy master |
| 13 | Legacy active plan | any remaining loose task Markdown file |

Product artifacts are counted and reported only. Never purge them.

## Review decisions

### User stories

- closed tracker item or `status: done`: propose delete;
- open tracker item: keep and flag;
- no tracker item: needs clarification.

### Loose checklists and phases

Feature-directory phases inherit their directory decision. For loose legacy files: delete with a completed root, keep with an active root, otherwise mark orphan and ask.

### Legacy sub-plans

With a processed master, delete associated parts. With an unprocessed master and closed tracker item, propose master and parts for deletion. With an open or absent tracker item, keep. A part without a master falls back to active-plan review.

### Active plans

Compute age from a leading date or modification time:

- younger than `plan_warn_days`: keep;
- from `plan_warn_days` through `plan_stale_days`: needs clarification;
- older than `plan_stale_days`: propose delete.

A closed associated tracker item always proposes delete. An active feature directory containing `review.md` needs clarification; never infer completion. A loose plan with a same-day loose review also needs clarification. Active plans without tracker in the warning band ask whether they remain active, are abandoned, or need a tracker item.

### Audit runs

Treat the whole run as one unit. Compute age from directory date or newest file. Keep through `audit_stale_days`; above it, ask whether it remains relevant or should be deleted. Never apply active-plan bands to pillar files.

### Non-plan outputs

For a dated month-level output directory, use the audit-run unit rule. For direct report roots `status/` and `memory/`, age files independently and always retain the newest file regardless of age. Never classify these as plans.

### Autonomous tracking

Decide only from status, never age: `done` or `completed` proposes delete; `pending`, `in-progress`, or `blocked` keeps and reports iteration; missing or unknown status needs clarification.

## Consolidated action

Collect every proposed action before acting in a table with path, type, action, and reason. Resolve clarification rows in grouped questions. Then ask once to apply the final deletions, explicitly marking them irreversible. Delete only after confirmation.

