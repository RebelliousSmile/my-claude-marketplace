# 02 - Check

Verify the tree against the **invariants** and against each domain's **learned convention** (from the cache). Report-only — zero writes (beyond refreshing the cache if stale).

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discovered anchor.

## Inputs

- `<target>` (optional, positional) — subtree to check. Default: current working directory.

## Process

1. Resolve the anchor (walk up to `Perso`/`Pro`). No anchor → report and stop.
2. Load `<anchor>/_tree/cache.json`. If missing or **stale** (target changed since `scanned_at`), run `index` first to refresh it.
3. **Invariant check (hard)** — flag every violation of I1–I4:
   - I1 working dir without `_` prefix · I2 prefixed content inside a working dir · I3 non-portable slug (space/accent/uppercase in a free segment) · I4 malformed year/month.
   - **Exception `pro-projet`:** inside `_code/`, I2 and I3 are skipped (code repos have their own conventions).
4. **Drift check (soft)** — compare against the domain's learned `convention` in the cache: units off the dated axis, unexpected extra levels, durable knowledge mixed into a dated unit, etc. Report as *drift*, not violation.
   - **Exception `pro-projet`:** the following are never reported as drift or anomaly — absence of INDEX.md at any level; presence of `_code/`; months (`<AAAA>/<MM>/`) without `_brief/` or `_output/`; no central index file. A subdirectory inside `<projet>/` that is neither `_code/` nor a well-formed `<AAAA>/<MM>/` is reported as soft drift (unknown structure).
5. **Unsorted** — list loose items outside any domain pattern (candidates for `sort`).
6. Produce the report. **Do not modify user content.**

## Output

```markdown
# Tree Check — <anchor>

**Date:** <date>   **Cache:** [fresh] / [refreshed] / [missing → indexed]

## Invariant anomalies (hard)
- <path> — I1: working dir missing `_` prefix → suggest `_<name>`
- <path> — I3: non-portable slug → suggest `<kebab-slug>`
(none → "✓ none")

## Convention drift (soft, vs learned convention)
- <domain> — <what diverges> (learned convention: <…>)
(none → "✓ aligned")

## Unsorted
- <path> — no domain match → run `tree sort`
(none → "✓ none")

## Verdict
CLEAN / DRIFT (N soft) / ANOMALIES (N hard) — run `tree fix` to correct.
```

## Rules

- **Report only.** The sole permitted write is refreshing `_tree/cache.json` (via `index`) when stale.
- Keep the hard/soft distinction explicit: invariants are anomalies; convention divergence is drift.
- Every flagged item carries a concrete suggested correction so `fix` can act on it.

## Test

Run `check` on a tree containing `Perso/RPG/Zombiology/` (uppercase — I3) and a unit placed off its domain's dated axis. Confirm the uppercase slug is reported under **Invariant anomalies** and the misplaced unit under **Convention drift**, that the verdict reflects both, and that no file was modified.

Run `check` on `Pro/Projets/aidd-overlay/` with `_code/` and `2026/06/`. Confirm that no anomaly is raised for the absence of INDEX.md, that `_code/` is not flagged as drift, and that `2026/06/` without `_brief/` is not reported.
