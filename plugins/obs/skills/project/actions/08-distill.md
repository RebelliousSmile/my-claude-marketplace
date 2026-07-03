# 08 - Distill

Turn a project's dated communication into structured information: **reduce** with `obs:filler`, **classify** what survives into the structural files, and **prune the past**.

## Inputs

- `name` (required) - string, project folder name
- `--month <YYYY/MM>` (optional) - restrict to one month; default: sweep all past `YYYY/MM/` directories (oldest first), excluding the current month

## Outputs

- Structural files (`projet.md` / `commercial.md` / `backlog.md` / `memory.md` / …) updated with classified information.
- Past `YYYY/MM/` directories reduced and emptied where possible; still-current non-structural documents moved to the **current month**, with their original date preserved **inside** the document.

## Process

1. Ask for `name` if not provided via `$ARGUMENTS`. Resolve `Pro/Projets/<name>/` via the `obs:tree` anchor.
2. List the dated `YYYY/MM/` directories; process oldest → newest (skip the current month unless `--month` targets it). **The current month = today's `YYYY/MM`.** The older a month, the more likely its content is obsolete.
3. **Reduce (filler).** For each month directory, invoke `obs:filler`: `survey` → `synthesize`/`digest` (emails & communications) → `condense`/`clean` (verbose docs, noise). Filler's contract applies (dry-run + confirmation before any destructive step; digest never on human messages; no silent overwrite; non-recursive). Note: a `YYYY/MM/` may hold documents that are **not emails** — filler reduces those too.
4. **Classify (project).** Read each surviving information item and route it per `references/redistribution-rules.md`:
   - **fonctionnement / technique** → `projet.md`
   - **gestion** (devis/facture → `## Historique devis`/`## Facturation`; CR → `## CR Réunions`; accès → `## Accès` as `→ BW:`) → `commercial.md` (or `communication.md`/`projet.md` per type for CR)
   - **tâche à planifier** → `backlog.md` (`## En attente`)
   - **décision durable** → `memory.md` (`## Décisions`)
   - **still-current, non-structural** → keep as a document, **moved to the current month**, date preserved inside it
   - **obsolete** → archive or delete
5. **Prune forward.** After classification, a processed past month should be empty (or hold only explicitly-kept items); remove empty month directories. Never delete a still-current item; never delete without dry-run + confirmation.
6. Present the full plan (reduce + classify + prune) and **wait for validation before writing** any structural file or moving/deleting anything.

## Guards

- **Date preserved in the document** when it changes directory (frontmatter or dated header) — the dated folder is disposable, the date is not.
- **Link integrity on move.** Bringing an item forward to the current month must not break any wikilink (`[[…]]`), embed (`![[…]]`), or relative attachment path (images, PDFs) into or out of it — update paths or co-move assets, and verify no dangling reference remains.
- **Validation before structural writes** — classification is a proposal, not an automatic commit.
- **No loss of current information**; no destructive move/delete without confirmation.
- `project` **never mutates the global mailbox** — it consumes what `filler` leaves in the project's directories; mailbox triage stays `obs:mail`'s job.

## Test

After distilling a past month: the structural files gained the classified information; the processed `YYYY/MM/` directory is empty or holds only items explicitly kept; any moved document carries its original date in-file; nothing was deleted without confirmation.
