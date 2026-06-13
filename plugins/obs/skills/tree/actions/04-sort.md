# 04 - Sort

Decide where loose items belong and place them — **by arbitration**. `tree` proposes a destination from the cache (where similar things already live); the human arbitrates ambiguous cases; nothing moves without confirmation.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discovered anchor. Honor `delete-safety`.

## Inputs

- `<items…>` (positional) — files/dirs to sort. Default: the `unsorted[]` from the cache.
- `--into <target>` (optional) — restrict placement to a subtree (its anchor is resolved as usual).

## Process

1. Resolve the anchor; load/refresh the cache (run `index` if missing/stale).
2. For each item, **propose a destination** using the cache:
   - Match against existing domains (`domains[].path`) and their learned conventions — where do comparable items already live?
   - If the item is a dated work unit, target `<domain>/<AAAA>/<MM>/<unit>/` (date from the item's own metadata/content, else ask).
   - If it is durable knowledge, target `<domain>/_univers/`, `<domain>/_systeme/`, or `<domain>/_subsystems/` as appropriate.
   - **`pro-projet` domains:** route by content type — source code / project file → `<projet>/_code/` ; note / task / tracking document → `<projet>/<AAAA-courant>/<MM-courant>/`. If the current month dir does not exist yet, propose creating it.
   - Apply invariants to the proposed name (kebab-case, `_` prefix for working dirs).
3. **Arbitrate:**
   - **Confident, single match** → propose it directly.
   - **Ambiguous / multiple candidates** → present the ranked options and **ask the user to choose** (this is the arbitration step). Never guess silently on a real ambiguity.
   - **No domain fits** → propose creating a new `subcategory` (and confirm category), or leave the item unsorted with a note.
4. **Confirm the full plan** (`item → destination`) before any move.
5. **Move** approved items (collision → skip + flag; never overwrite; never delete). Prefer `git mv` in a repo.
6. Re-run `index` to refresh the cache; report placements, arbitrations made, and anything left unsorted.

## Output

```markdown
# Tree Sort — <anchor>

## Proposed placements
- <item> → <domain>/<…>/<dest>     [confident]
- <item> → ? (choose)              [arbitrated → <chosen>]
- <item> → (new domain proposed)   [confirm]

## Applied
- <item> → <dest>   ✓
## Left unsorted
- <item> — <reason>
```

## Rules

- **Arbitration, not automation**: confident matches are proposed; genuine ambiguities are escalated to the user, never resolved by guess.
- **Never delete/overwrite**: moves only; collisions flagged.
- **Confirm before disk**; partial approval allowed.
- Proposals respect invariants (slugs, `_` prefix) and the target domain's learned convention.
- Refresh the cache after sorting.

## Test

Sort a loose `Scenario Final.md` with no obvious domain. Confirm `tree` proposes a kebab-case destination, that because the domain is ambiguous it **asks the user to arbitrate** between candidate domains rather than picking one, and that the file is moved only after confirmation.
