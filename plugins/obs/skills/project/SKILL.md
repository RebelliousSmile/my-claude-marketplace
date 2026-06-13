---
name: project
description: Manages Obsidian project notes stored in Pro/Projets — create, fill, reorganize projects, log sessions and meetings, add invoices, export RAG context. Use when the user invokes /obs:project with a project management intent. Do NOT use for code project scaffolding — use `aidd-context:project-init` instead.
disable-model-invocation: true
---

# Project

Manages project notes stored in `C:/Users/fxgui/Public/Notes/Pro/Projets/`. Routes to the appropriate action based on user intent: create a new project, fill or reorganize its files, update it after a session, log a meeting, add an invoice, or export a RAG context file.

## Available actions

| #   | Action        | Role                                                  | Input                       |
| --- | ------------- | ----------------------------------------------------- | --------------------------- |
| 01  | `create`      | Create project folder + template files                | project name, type          |
| 02  | `fill`        | Fill project files from external sources              | project name                |
| 03  | `reorganize`  | Redistribute content to the standard structure        | project name, type          |
| 04  | `log-session` | Update project notes after a work session             | project name, session notes |
| 05  | `log-meeting` | Add a meeting report to the appropriate file          | project name, meeting info  |
| 06  | `add-invoice` | Add an invoice entry to `commercial.md`               | project name, invoice info  |
| 07  | `export-rag`  | Generate a RAG context file from project notes        | project name, flags         |

## Default flow

Router — dispatches based on user intent:

- "new project", "create project", "create <name>" → `create`
- "fill project", "fill <name>", "complete the files" → `fill`
- "reorganize", "restructure <name>" → `reorganize`
- "log session", "update after session", "session done" → `log-session`
- "log meeting", "add meeting", "CR réunion" → `log-meeting`
- "add invoice", "new invoice", "add facture" → `add-invoice`
- "export RAG", "export context", "project notes" → `export-rag`

## Transversal rules

- Projects root: `C:/Users/fxgui/Public/Notes/Pro/Projets/`
- Templates root: `C:/Users/fxgui/Public/Notes/Patterns/projet-template/`
- Ask for the project name if not supplied via `$ARGUMENTS`.
- Date format: `YYYY-MM-DD` throughout all files.
- Never write credentials, tokens, or passwords to any `.md` file — the `## Accès` section uses `→ BW: [Description]` references only.

## External data

- `C:/Users/fxgui/Public/Notes/CLAUDE.md` — redistribution rules and project structure definition used by `reorganize`
