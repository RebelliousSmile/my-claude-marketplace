# 05 - Judge

Arbitrate the content of `R` node by node in an **interactive session**. For each node, Claude analyses, proposes a verdict with motivation, and waits for confirmation before acting. Nothing changes without explicit human approval.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discovered anchor. Honor `delete-safety`.

## Inputs

- `<target>` (optional, positional) — the `R` directory to judge. Default: `R` resolved from the current working directory (walk up to the domain root, then into `R/`).

## Scope

**In scope:** every file and directory inside `R` that is **not** prefixed `_`.
This includes loose files at `R/` root, dated units (`R/AAAA/MM/…`), and their non-`_` contents.

**Out of scope (never touched):** `_savoir/`, `_brief/`, `_output/`, `_trash/`, and any other `_*` directory at any depth. These are working dirs — `judge` does not read or modify them.

## Process

### Phase 1 — Pre-scan (silent)

1. Resolve the anchor; load/refresh the cache (run `index` if missing/stale).
2. Enumerate all in-scope nodes (files first, deepest path first).
3. **Detect candidate groups** before the session starts:
   - Files with identical or near-identical headings/content → merge candidates.
   - Files clearly referencing the same subject → merge candidates.
   Record groups; present them first in Phase 2.
4. Build the ordered session queue: groups → then remaining individual files.

### Phase 2 — Interactive session

For each node (or group), present a **verdict card**:

```
─── Judge [N/Total] ───────────────────────────────────────
Fichier : <relative path from R>
Aperçu  : <first heading + 1-2 sentence excerpt>
───────────────────────────────────────────────────────────
Verdict proposé : **<VERDICT>**
Motivation : <one sentence — which criterion triggered>

Répondre : [O]ui · [Non, verdict alternatif] · [P]asser · [Q]uitter
```

Wait for the user's response before proceeding to the next node.

**Accepted responses:**
- `o` / `oui` / `yes` → execute the proposed verdict immediately, then move to next node.
- A different verdict (`résumer`, `supprimer`, `fusionner`, `garder`, `avancer`) → switch to that verdict, confirm, execute.
- `p` / `passer` / `skip` → leave the node untouched, mark as skipped.
- `q` / `quitter` / `stop` → end the session, produce the summary report.

### Phase 3 — Execution (per-node, immediately after confirmation)

#### Supprimer
1. Create `R/_trash/` if absent.
2. Move the file to `R/_trash/<original-filename>`. If a collision exists, append a timestamp suffix (`_<YYYYMMDD>`).
3. Never delete. `_trash/` is cleaned manually by the user.

#### Résumer
1. Read the full content.
2. Generate a condensed version: strip slop, marketing copy, code blocks (unless essential), redundant preamble. Keep the core factual content.
3. Ensure the file has YAML frontmatter. Add or update:
   ```yaml
   summarized: true
   summarized_at: <YYYY-MM-DD>
   ```
4. Replace the file content in place (frontmatter + condensed body). Original is gone — no archive.
5. Show the new content to the user for review before writing.

#### Fusionner
Applies only to a **group of ≥ 2 files**.
1. Read all files in the group.
2. Generate a merged document: unified structure, deduplicated content, no redundancy.
3. Show the merged result to the user for review before writing.
4. Replace the **first (most recent/relevant) file** in the group with the merged content. Add or update frontmatter:
   ```yaml
   merged_from:
     - <relative path of source 2>
     - <relative path of source 3>
   merged_at: <YYYY-MM-DD>
   ```
5. Move remaining source files to `R/_trash/` (collision → append timestamp suffix).

#### Garder + Avancer
1. Determine target: `R/<AAAA-courant>/<MM-courant>/<filename>`.
2. Create the month directory if absent.
3. Check for collision: if target exists → **skip and flag** (never overwrite).
4. Move the file to the target. Prefer `git mv` if inside a git repo.
5. If the original parent directory is now empty (and non-`_`), note it as a candidate for cleanup (do not auto-delete it).

## Output — Session summary (at end or on `q`)

```markdown
# Tree Judge — <anchor>/R

**Session:** <date>   **Nodes reviewed:** N / Total

## Applied
- [supprimer] <path> → R/_trash/<filename>
- [résumer]   <path>   (in-place, summarized_at: <date>)
- [fusionner] <group> → <primary file> (sources → _trash/)
- [avancer]   <path> → R/<AAAA>/<MM>/<filename>

## Skipped
- <path> — passed by user

## Not reached
- <path> — session ended early

## Next steps
⚠ Cache is now stale — run `tree index` to refresh.
```

## Rules

- **Never delete.** Supprimer = move to `R/_trash/`, not `rm`.
- **Never overwrite.** Collisions (advance, trash) → append timestamp suffix and flag.
- **Show before write.** For `résumer` and `fusionner`, always display the generated content for user review before replacing the file.
- **One node at a time.** Never batch-execute without per-node confirmation.
- **Out-of-scope nodes are invisible.** Never read, propose, or modify `_*` directories.
- Refresh prompt: after the session, remind the user to run `tree index`.

## Test

Run `judge` on an `R/` containing:
- `R/2025/03/notes-reunion.md` — a long meeting report with marketing copy (→ should propose **résumer**).
- `R/2025/01/idees-A.md` and `R/2025/01/idees-B.md` — same subject (→ should be presented as a **fusionner** group).
- `R/2024/11/dialogue-perso.md` — a fictional dialogue (→ should propose **garder + avancer**).
- `R/archive-vide.md` — empty file (→ should propose **supprimer**).

Confirm:
1. The merge group is presented first.
2. Each verdict card shows path, excerpt, proposed verdict, and motivation.
3. Nothing moves before user confirms.
4. After `[supprimer]`: file is in `R/_trash/`, not deleted.
5. After `[résumer]`: file is replaced in-place with `summarized: true` in frontmatter, content shown before write.
6. After `[avancer]`: file is in `R/<current-AAAA>/<current-MM>/`.
7. Session summary lists all actions taken and flags cache as stale.
