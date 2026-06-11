---
name: forge
model: sonnet
description: Iterates on a narrative writing project's overview — challenges concepts, proposes alternatives, and validates structure until the project is ready for TOC generation. Use when developing a novel, RPG scenario, or guide concept; when the overview is empty or needs challenging; when stuck on narrative structure. Do NOT use for software or code brainstorming — use aidd-refine:brainstorm instead; do NOT use once the overview is complete and validated — use toc instead.
---

# Forge

Conversational partner for narrative concept development. Reads the project's `bank.yml` and overview file, then enters a challenge loop: analyze → challenge → propose alternatives → update. Exits when the overview satisfies all required narrative elements (pitch, structure, characters, stakes, tone).

## Available actions

| #   | Action  | Role                                                      | Input                             |
| --- | ------- | --------------------------------------------------------- | --------------------------------- |
| 01  | `forge` | Challenge and iterate on a writing project's overview    | project path `<jeu>/_ecrits/<projet>` |

## Default flow

Single action: `01 → repeat until exit criteria met`.

Trigger-to-action mapping:
- "forge my novel", "forge the concept", "forge my scenario", "iterate on my overview", "challenge my concept", "brainstorm my writing project", "travaille mon synopsis" → `forge`

## Transversal rules

- Conversational mode: ask questions, do not impose.
- Maximum 2–3 questions per iteration — never overwhelm.
- Always update the overview file **only in the file pointed to by `overview:` in bank.yml**.
- Never invent content without user validation.
- Use universe docs to verify consistency; flag contradictions explicitly.
- If a topic lacks documentation, suggest `research "<topic>"`.
- Exit only when all required overview elements are present and 2–3 last iterations produced only minor adjustments.

## References

- `references/overview-checklist.md` — exit criteria per document type (novel / scenario / roleplaying / guide)
- `setup/references/vault-layout.md` — path-variable convention (`<univers-root>`, `<projet-root>`, …)

## Evals

- `evals/scenarios.json`
