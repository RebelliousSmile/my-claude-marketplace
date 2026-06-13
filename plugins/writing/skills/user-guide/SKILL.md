---
name: user-guide
model: sonnet
description: >-
  Writes end-user documentation — user guides, manuals, getting-started and how-to content for the people who
  *use* a product, not the ones who build it. Task-oriented and plain-language, organized by what the user wants
  to do. Use for onboarding guides, feature walkthroughs, troubleshooting and FAQ. Do NOT use for developer/API/
  architecture docs (use technical-document); for a project's requirements (use specification); for a repository
  README (use aidd-overlay:readme); or for narrative/creative writing (use the writing plugin).
---

# user-guide

Produces documentation for end users: clear, task-oriented, assuming no internal knowledge. Organizes content around the reader's goals (what they want to accomplish) rather than the product's feature list or menu structure.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `outline` | Clarify the subject, audience and tasks; build a task-based table of contents | subject (`$ARGUMENTS`) + audience + tasks |
| 02 | `write` | Write the guide sections from the outline | approved outline |
| 03 | `review` | Usability/readability pass (jargon, task completeness, consistency) | a draft guide |

## Default flow

Linear: `01 → 02 → 03`. Stop after `01` to validate the outline, or run `03` standalone on an existing guide.

Trigger-to-action mapping:

- "write a user guide / manual for <product>", "onboarding doc", "how-to for <feature>" → full flow from `outline`
- "outline the user guide", "what should the manual cover" → `outline`
- "review / improve this user guide", "is this readable for users" → `review`

## Transversal rules

- Read `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` first.
- The **subject** (the product, feature or area to document) is given up front via `$ARGUMENTS`; if it's missing, ask for it once before starting.
- **Rédaction en français par défaut** — le guide est écrit en français (sauf demande explicite d'une autre langue) ; seuls les libellés d'UI gardent leur forme d'origine.
- **Output style**: follow `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/output-style.md` for voice and formatting by default. To inject a different one, pass `--style <path>` in `$ARGUMENTS`; load that file and follow it instead.
- **Output format**: Markdown by default. `--format icml` exports the finished guide to ICML (Adobe InCopy/InDesign) via pandoc — see `${CLAUDE_PLUGIN_ROOT}/references/export-icml.md`. Markdown stays the source.
- **Task-oriented**: one section per user goal, titled by the goal ("Send an invoice"), not by the UI ("The Invoices screen").
- Plain language; assume no internal/technical knowledge; define any unavoidable term.
- Steps are numbered, imperative, one action each, and state the expected result.
- Mark where a screenshot or visual is needed with a placeholder (`[screenshot: …]`) — never fabricate UI that you have not seen.
- Keep wording aligned with the product's actual UI labels.
- Never invent features or behavior; if unknown, ask or flag in an assumptions note.

## References

- `references/user-guide-structure.md` — the sections of a complete user guide and what each contains
- `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/output-style.md` — default voice/formatting (override with `--style <path>`)
- `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` — shared documentation ethos

## Evals

- `evals/scenarios.json`
