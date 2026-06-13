# 01 - outline

Clarify the product, audience and tasks, then build a task-based table of contents.

## Inputs

- `subject` (required, from `$ARGUMENTS`) — the product, feature or area to document, given up front (name + access to it: app, docs, the codebase/UI, or a description). If absent, ask for it once before proceeding.
- `audience` — who the readers are and their starting knowledge (ask if unknown).
- `tasks` — the goals users need to accomplish (derive from the subject if not given).

## Process

1. **Identify the reader and their goals** for the given subject (per `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md`). If audience or the key tasks are unclear, ask in one short numbered list.
2. **Inventory the user goals**: list what a user actually wants to do with the product. Phrase each as a goal in the user's words, not a feature name.
3. **Map to the structure** in `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/user-guide-structure.md`: intro, prerequisites, getting started, one section per goal, troubleshooting, FAQ/glossary as needed.
4. **Order** the task sections by frequency or logical progression.
5. **Flag gaps**: goals you cannot document without more info (missing access, unknown behavior) go in an assumptions/questions note.

## Outputs

A task-based table of contents (goal-titled sections) plus a short note of assumptions and any access/info still needed. Present for approval before writing.

## Test

Every section is titled by a user goal (not a UI element), the core tasks are covered, and unknowns are listed rather than guessed.
