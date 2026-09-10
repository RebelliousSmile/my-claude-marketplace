# Harvest feature records

This small reference is shared only where directory ownership and lifecycle identity are needed. Tracker reconciliation and cleanup rules live in their owning actions so targeted routes do not load one large cross-pillar procedure.

## Feature directories

Build one record for every `aidd_docs/tasks/YYYY_MM/YYYY_MM_DD_slug/plan.md`. Read its direct frontmatter `status`, enumerate sibling `phase-N.md`, optional `review.md`, and every other file. Files owned by this directory are never counted again.

The status owner is `aidd-dev:01-plan` `references/plan-status.md`:

- completed: `implemented`, `reviewed`;
- active: `pending`, `in-progress`, `blocked`;
- missing, malformed, or any other value: invalid, reported and excluded from closure and purge.

A directory with no direct `plan.md` is never a plan unit.

## Association identity

For a modern feature directory use its directory name; for a loose legacy artifact use its filename. Normalize both by stripping the leading date and lifecycle/review suffix before comparing. A file inside a modern feature directory always inherits that directory's identity and decision.

Only fall back to orphan when no modern or legacy active/completed root shares the normalized slug. Never interpret a numeric date segment as a tracker identifier.
