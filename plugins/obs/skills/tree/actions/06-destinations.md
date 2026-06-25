# 06 - Destinations

Export the current tree as a `destinations.txt` routing map — the curated list consumed by the `email-to-markdown` router. `tree` derives the **durable** part of the arborescence (`(Perso|Pro)/category/subcategory`, i.e. the parent of the dated `AAAA/MM` levels) from the cache and emits one line per destination, grouped and ready for the user to add matching rules.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` and `${CLAUDE_PLUGIN_ROOT}/references/destinations-template.md` first. Local paths only — discovered anchor, never hardcoded.

## Inputs

- `<target>` (optional, positional) — subtree to export from. Default: current working directory. Its anchor (`Perso`/`Pro`) is resolved as usual; the export covers that **one** anchor.
- `--out <path>` (optional) — write the result to `<path>`. Default: print to stdout and remind the user of the app config location (`%APPDATA%\email-to-markdown\destinations.txt` on Windows, `~/.config/email-to-markdown/destinations.txt` on Linux, `~/Library/Application Support/email-to-markdown/destinations.txt` on macOS).

## Outputs

The generated file content (a `destinations.txt` per `${CLAUDE_PLUGIN_ROOT}/references/destinations-template.md`), preceded by a short report:

```markdown
# Tree Destinations — <anchor>

**Date:** <date>   **Cache:** [fresh] / [refreshed] / [missing → indexed]
**Destinations:** <N>   **Commented out (non-email):** <M>

\`\`\`text
# destinations.txt — second-brain routing map
# Generated from <anchor> on <YYYY-MM-DD> (obs:tree convention).
# Format: <path>  [ | <attr>, <attr>... ]   — path relative to notes_dir,
#   /<Year>/<Month> appended automatically. Priority = file order.

# ── <Category> ───────────────────────────────────────────────────
<anchor>/<category>/<subcategory>
...
\`\`\`

## Next steps
- notes_dir = <parent of the anchor>
- Add domain:/from:/subject: rules per real correspondents (never invented here).
```

## Process

1. **Resolve the anchor** (walk up from `<target>` to `Perso`/`Pro`). No anchor → report and stop (offer to treat `<target>` as a managed root via `index`, as elsewhere). `notes_dir` is the **parent of the anchor**.
2. **Load `<anchor>/_tree/cache.json`.** If missing or **stale** (target changed since `scanned_at`), run `index` first.
3. **Derive destination candidates.** From `domains[]`, take each domain at the `category/subcategory` level — the immediate parent of an `AAAA` (4-digit year) directory:
   - Prefix each with the anchor segment (`Perso/` or `Pro/`) → `<anchor>/<domain.path>`.
   - **Never include `AAAA`/`MM`** in a destination — the router appends `/<Year>/<Month>` itself.
   - Dedup; keep deterministic order (group by top `category`, then alphabetical subcategory).
4. **Group and format** per the template:
   - One `# ── <Category> ──` header per top-level category, then its destinations.
   - Empty attributes — a line with no rule is a valid folder, AI-routed (if enabled) else default.
5. **Comment out (`#`) categories that never receive email** — media/photos/music/video/games and `pro-projet` code domains (`Projets/<projet>`): they stay visible without cluttering deterministic routing.
6. **Add a commented catch-all** placeholder (`# <anchor>/Communication/Emails  | default`) so the user can opt into overriding the hard-coded `Perso/Messy/Emails` fallback.
7. **Never invent matching rules** (`domain:`/`from:`/`subject:`) — only the user knows their senders. Emit attributes empty.
8. **Emit.** Print the content. If `--out <path>` is given: write it — but **never overwrite** an existing destinations.txt silently; on collision, show a diff against the existing file and ask before replacing (the file is **manually curated** — the router never rewrites it).

## Rules

- **Derived artifact, not user content.** This action only produces a `destinations.txt`; it never moves, renames, or deletes anything in the tree. Like `index`, it reads the cache and writes a derived file only.
- **One anchor per run.** The output starts with a single anchor segment. To cover both `Perso` and `Pro`, run once per anchor and concatenate.
- **Durable level only.** A destination is `(Perso|Pro)/category/subcategory` — the parent of `AAAA/MM`. Year/month never appear in a path.
- **Curation stays human.** Empty rules, commented non-email categories, no invented senders. The file is a *starting point* the user refines.
- **Never overwrite a curated file** without an explicit confirmation + diff.

## Test

Run `destinations` on a `Perso/` anchor whose cache holds `RPG/zombiology` (dated), `Bank/example` (dated) and a `photos/2026/...` media domain. Confirm: the output begins with the template header carrying the anchor and date; `Perso/RPG/zombiology` and `Perso/Bank/example` appear as active lines with **no** `AAAA/MM` suffix and **no** invented attributes; the `photos` category is **commented out**; and a commented `| default` catch-all line is present. No file under the tree is modified.

Run `destinations` on a `Pro/` anchor containing `Projets/overcode/` (`pro-projet`). Confirm the `Projets/overcode` line is emitted **commented out** (code domain, not an email target) and that no `_code/` or `AAAA/MM` segment leaks into any path.
