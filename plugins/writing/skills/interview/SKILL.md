---
name: interview
model: opus
description: Applies the Mikado method to construct a text's progression from a bare subject via iterative Q&A, generating a standalone YAML dependency graph in interview/<subject>/ — no <brief>/<output> project required. Use when starting from just a topic/idea and wanting to surface its writing beats/arguments and their prerequisites before drafting anything: "interview me about", "explore how to structure this piece", "apply Mikado to this text", "build the progression for", "what needs to be established before I can write about X". Do NOT use to challenge an existing overview — use `forge` instead; do NOT use to generate a chapter breakdown from a validated brief — use `toc` instead; do NOT use to write the actual prose — use `write` instead.
---

# Interview

Applies the Mikado method to a bare subject: walks a depth-first iterative Q&A to surface every idea/beat that must land in the reader's mind before another can be written, displays a Mermaid subtree after each iteration, and finally generates a YAML dependency graph under `interview/<subjectSlug>/`. Each leaf node is a beat draftable in a single writing pass.

This is the writing-side equivalent of `overcode:decompose`: same DFS-Q&A / Mermaid / YAML-after-validation mechanics, applied to a text's argumentative or narrative progression instead of a code dependency graph.

**Standalone artifact, no project required**: `interview` never reads or requires `<brief>/` or `<output>/` (cf. `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`). It runs from a bare subject string and writes only to `interview/<subjectSlug>/`, portable and independent of any writing project. If a `<brief>/` happens to exist, `interview` still ignores it — the graph is meant to be consulted afterward by `forge` (to seed `overview.md`), `toc` (as an alternative source for the chapter breakdown), or `write` directly for short-form (skip `toc` entirely, draft straight from the leaf list).

## Available actions

| #  | Action   | Role                                                                 | Input                       |
|----|----------|------------------------------------------------------------------------|------------------------------|
| 01 | `mikado` | Full Mikado decomposition of a text's progression: name graph → DFS loop → generate YAML | Subject string (`$ARGUMENTS`) |

## Default flow

Single action. Dispatch to `mikado` on any trigger.

Trigger-to-action mapping:
- "interview me about", "explore the structure of", "apply Mikado to this text", "build the progression for", "what needs to be set up before I can write X" → `mikado`

## Transversal rules

- Node IDs must be in kebab-case (lowercase, accents stripped, semantically-empty articles/prepositions dropped, collisions disambiguated with a numeric suffix — see `actions/01-mikado.md` step 1 for the exact rule).
- Each leaf node must be draftable in a single writing pass (one sitting, no other idea needed first); leaf nodes still get a recorded `purpose` and a displayed subtree, same as internal nodes.
- Traverse the graph in DFS order.
- Display a Mermaid subtree after each iteration.
- Never write YAML files until the user validates the final complete graph.
- The graph is a **standalone artifact** — `interview` itself never drafts prose, never touches `<brief>/overview.md`, and never writes chapters. Handing the result to `forge`/`toc`/`write` is the user's next explicit step, not something `interview` does automatically.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — documents the (separate) brief → output model and the "mode document libre" boundary `interview` sits outside of.
- `overcode:decompose`'s `mcp-server/src/resources/guide.md` — Mikado method guide (same underlying method, different domain).
