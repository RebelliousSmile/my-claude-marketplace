---
name: project
description: Manages Obsidian project notes stored in Pro/Projets — create, fill, reorganize, log sessions and meetings, add invoices, distill dated communication into structured information, and export RAG context. Use when the user invokes /obs:project with a project management intent. Do NOT use for code project scaffolding — use `aidd-context:project-init` instead.
disable-model-invocation: true
---

# Project

Manages project notes stored under the vault's `Pro/Projets/` directory. Routes to the appropriate action based on user intent: create a new project, fill or reorganize its files, update it after a session, log a meeting, add an invoice, **distill its dated communication into structured information**, or export a RAG context file.

## Model — communication → information

A project splits into two layers:

- **Dated communication (transient).** `Pro/Projets/<name>/YYYY/MM/` holds raw, dated content — emails **and other documents**. It is communication, not yet knowledge, and it **decays**: the older a month, the more likely its content is obsolete.
- **Distilled information (durable).** The structural files (`projet.md`, `commercial.md`, `backlog.md`, …) hold the project's durable, classified knowledge.

`distill` runs the continuous pipeline that turns the first into the second: **`obs:filler` reduces** communication to information (delete noise, summarize, digest), then **`project` classifies** what survives into the structural files, and **prunes the past** (still-current items brought forward to the current month, obsolete ones archived/deleted). The dated month directories are meant to empty out over time — the date is kept **inside** each document, not in a pile of past folders.

## Available actions

| #   | Action        | Role                                                       | Input                       |
| --- | ------------- | --------------------------------------------------------- | --------------------------- |
| 01  | `create`      | Create project folder + template files                    | project name, type          |
| 02  | `fill`        | Fill project files from external sources                  | project name                |
| 03  | `reorganize`  | Redistribute content to the standard structure            | project name, type          |
| 04  | `log-session` | Update project notes after a work session                 | project name, session notes |
| 05  | `log-meeting` | Add a meeting report to the appropriate file              | project name, meeting info  |
| 06  | `add-invoice` | Add an invoice entry to `commercial.md`                   | project name, invoice info  |
| 07  | `export-rag`  | Generate a RAG context file from project notes            | project name, flags         |
| 08  | `distill`     | Reduce (filler) + classify + prune dated communication    | project name, `[--month]`   |

## Default flow

Router — dispatches based on user intent:

- "new project", "create project", "create <name>" → `create`
- "fill project", "fill <name>", "complete the files" → `fill`
- "reorganize", "restructure <name>" → `reorganize`
- "log session", "update after session", "session done" → `log-session`
- "log meeting", "add meeting", "CR réunion" → `log-meeting`
- "add invoice", "new invoice", "add facture" → `add-invoice`
- "distill", "distiller", "classer le mois", "réduire les communications", "trier les emails du projet" → `distill`
- "export RAG", "export context", "project notes" → `export-rag`

## Transversal rules

- **Projects root — discovered, never hardcoded.** Resolve the `Pro/` anchor the way `obs:tree` does (walk up to a `Pro` segment), then operate under `Pro/Projets/<name>/`. No absolute path baked into the skill; the real vault lives under `Documents/`, not `Public/Notes/`.
- **Templates ship with the skill.** File templates live at `references/projet-template/` (skill-local, self-contained) — never in the vault. `create`/`reorganize` read them from there.
- **Redistribution & classification rules** live at `references/redistribution-rules.md` — the single source of truth for what content goes into which file/section. Consumed by `reorganize` and `distill`.
- **Delegate content lifecycle to `obs:filler`.** `fill`, `reorganize`, `export-rag` and `distill` invoke filler (survey / synthesize / digest / condense / clean) for reduction rather than re-implementing it — filler keeps its contract (dry-run before destructive, digest never on human messages, no silent overwrite, non-recursive by default).
- Ask for the project name if not supplied via `$ARGUMENTS`.
- Date format: `YYYY-MM-DD` throughout all files.
- Never write credentials, tokens, or passwords to any `.md` file — the `## Accès` section uses `→ BW: [Description]` references only.
- **Link integrity on move.** Never move, rename, or delete a file in a way that leaves a broken link. When a document changes directory (e.g. `distill` bringing an item forward to the current month, or `reorganize` redistributing content), update every wikilink (`[[…]]`), embed (`![[…]]`), and relative attachment path (images, PDFs, other assets) that points to it or that it references — co-moving assets when needed — and verify no dangling reference remains afterwards.

## External data

- `references/projet-template/` — file templates per type (`projet.md`, `memory.md`, `backlog.md`, + `commercial.md`/`communication.md`/`objectifs.md`).
- `references/redistribution-rules.md` — standard structure per type + information-classification contract (where each kind of content belongs).
