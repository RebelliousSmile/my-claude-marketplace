# 05 - Judge

Arbitrate the content of `R` node by node in an **interactive session**. For each node, Claude analyses, proposes a verdict with motivation, and waits for confirmation before acting. Nothing changes without explicit human approval.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discovered anchor. Honor `delete-safety`.

## Inputs

- `<target>` (optional, positional) — the `R` directory to judge. Default: `R` discovered by walking up from CWD to the first directory containing a `_savoir/` marker — identical to how `research`, `extract-pdf`, and the rest of the ecosystem resolve `R`. No anchor found → STOP: "Aucun domaine R trouvé (marqueur `_savoir/` introuvable en remontant). Se placer dans un répertoire sous un domaine initialisé."

## Scope

**In scope:** every non-`_`-prefixed file and non-`_`-prefixed directory (project unit) inside `R`.
- **Project units** (`R/<AAAA>/<MM>/<projet>/`): treated as single nodes — judged and advanced as a whole.
- **Loose files** (at `R/` root or `R/<AAAA>/<MM>/`): each file is an individual node.

**Out of scope — never read, never moved:**
- Any directory or file prefixed `_` (`_savoir/`, `_brief/`, `_output/`, `_trash/`, `_code/`, etc.)
- `.git` directories and dotfiles (files/dirs whose name starts with `.`) — see Rules.
- **Media files**: images (`.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.heic` `.raw` `.psd` `.svg`), audio (`.mp3` `.wav` `.flac` `.m4a` `.ogg` `.aac`), video (`.mp4` `.mov` `.avi` `.mkv` `.wmv` `.webm`). These are silently skipped; their presence in a folder is noted in the session summary if they prevent a directory from being moved.

## Process

### Phase 0 — Credential guard (before any read)

Before reading any file content, check its **name** against the credential pattern list:
`.env`, `*.env`, `credentials.*`, `secrets.*`, `token.*`, `*.key`, `*.pem`, `*.p12`, `*.pfx`, `*.secret`, `*password*`, `*passwd*`, `*apikey*`.

- **Match + inside `_code/` at any depth** → silently exclude from the session queue (not a judge concern).
- **Match + outside `_code/`** → add to a `credentials[]` list; **do not read the file**. At the start of the session, display:

  ```
  ⚠ Credentials detected — not read, not judged:
  - <relative path>
  ```

  The user decides what to do with them manually.

### Phase 1 — Pre-scan (silent)

1. Resolve `R` via the `_savoir/` marker (walk up from target/CWD). Load/refresh the `tree` cache if available (run `index` if missing/stale — not mandatory, `judge` works without cache but is slower).
2. Enumerate all in-scope nodes. A node is either:
   - A **project unit** directory (`R/<AAAA>/<MM>/<projet>/`) — the whole directory is one node.
   - A **loose file** at `R/` root or `R/<AAAA>/<MM>/` (not inside a project unit).
   Apply the credential guard (Phase 0) and the media/dotfile exclusions — excluded items are never enqueued.
3. **Detect candidate groups** before the session starts:
   - Files/units with identical or near-identical headings/content → merge candidates.
   - Files/units clearly referencing the same subject → merge candidates.
   Record groups; present them first in Phase 2.
4. Build the ordered session queue: groups → then remaining individual nodes.

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
The node being advanced can be a **project unit** (directory) or a **loose file** — handled differently:

**Node is a project unit (`<projet>/` directory):**
1. Target: `R/<AAAA-courant>/<MM-courant>/<projet>/`.
2. Safety check: if the unit contains a `.git/` directory or any dotfile at root, it cannot be moved as individual items — the whole directory move carries them. Note this in the verdict card.
3. Check for collision: if target exists → **skip and flag** (never overwrite).
4. Move the whole directory. Prefer `git mv` if inside a git repo.

**Node is a loose file:**
1. Target: `R/<AAAA-courant>/<MM-courant>/<filename>`.
2. Create the month directory if absent.
3. Check for collision: if target exists → **skip and flag** (never overwrite).
4. Move the file. Prefer `git mv` if inside a git repo.
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
- **Never move `.git` or dotfiles directly.** A `.git/` directory or any file/dir whose name starts with `.` must never be moved as a standalone operation. They can only travel with their parent directory (when the whole project unit is moved). If a loose file adjacent to a `.git/` or dotfile needs to move, move only that file — never touch the dot items.
- **Media files are skipped silently.** Images, audio, and video are excluded from the session queue. If a directory contains only media (no text nodes to judge), it is listed in the summary as "répertoire médias — ignoré".
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
