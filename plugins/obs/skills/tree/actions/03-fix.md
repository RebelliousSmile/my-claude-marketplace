# 03 - Fix

Apply **safe** corrections for the anomalies and drift surfaced by `check`. Rename and move only — never delete, never overwrite. Always dry-run + confirm before touching disk.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discovered anchor. Honor `delete-safety`.

## Inputs

- `<target>` (optional, positional) — subtree to fix. Default: current working directory.
- **Scope is strict.** Only anomalies/drift whose path is inside `<target>` go into the plan — never sibling domains elsewhere under the anchor, even if the shared cache lists anomalies there too. To fix the whole anchor, pass the anchor itself as `<target>`.

## Outputs

```markdown
# Tree Fix — <anchor>

## Plan (dry-run)
- [invariant] <from> → <to>
- [drift]     <from> → <to>   (opt-in)

## Applied
- <from> → <to>   ✓
## Skipped
- <from> → <to>   ⚠ destination exists / declined
## Untouched drift
- <domain> — <left as-is>
```

## Process

1. Resolve the anchor; load/refresh the cache (run `index` if missing/stale).
2. Run the `check` logic to collect anomalies (hard) and drift (soft) with their suggested corrections, **filtered to `<target>`** — discard cache entries outside it.
3. **Build a dry-run plan** — an ordered list of `mv`/rename operations, each as `from → to`, grouped:
   - **Invariant fixes** (default ON): add `_` prefix to working dirs, kebab-case free slugs, zero-pad/repair dates, un-prefix wrongly-prefixed content.
   - **Drift fixes** (default OFF — propose, the user opts in): relocate a unit onto its domain's dated axis, move durable knowledge out of a dated unit into `_univers/`, `_systeme/`, etc.
4. **Present the plan and require explicit confirmation.** Show the full `from → to` list. Do nothing until the user approves (they may approve a subset).
5. **Safety gate before each operation:**
   - Destination already exists → **skip and flag the collision** (never overwrite/merge silently).
   - Operation is a rename/move only — **never `rm`/delete** user content.
   - Prefer `git mv` when the subtree is a git repo; else plain move.
6. Execute the approved operations. Re-run `index` to refresh the cache.
7. Report what was done, what was skipped (with reasons), and what drift was left untouched.

## Rules

- **Never delete, never overwrite.** Moves/renames only; collisions are flagged, not resolved by force.
- **Confirm before disk.** No write without an approved dry-run plan. Partial approval is allowed.
- Invariant fixes are proposed ON; drift fixes are proposed OFF (the human decides whether to reshape an evolving tree).
- Refresh the cache after applying.

## Test

Dry-run `fix` on a tree with `Mon Dossier/` (space — I3) and a working dir `brief/` missing its `_`. Confirm the plan lists `Mon Dossier → mon-dossier` and `brief → _brief`, that nothing is moved before confirmation, and that a pre-existing `_brief/` at the destination is reported as a skipped collision rather than overwritten.
