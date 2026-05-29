---
name: research
model: sonnet
description: Performs cross-referenced documentary research for writing projects — web research on historical, cultural, or world-building topics, plus terminology extraction from universe source files. Use when a topic lacks documentation in the universe docs, when forge identifies a knowledge gap, or when extracting terminology from a PDF extraction result. Do NOT use for general software research — use web search directly; do NOT use for reviewing chapter content — use `review` instead.
---

# Research

Two documentary tools for writing projects: **research** performs structured web research (minimum 3 searches, cross-referenced sources, comparison with existing docs, contradiction flagging) and saves a report to `docs/research/`; **extract-terminology** distills terminology, proper nouns, and world-building elements from universe source documents into a canonical `terminologie.md`.

## Available actions

| #   | Action                | Role                                                               | Input                                        |
| --- | --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| 01  | `research`            | Web research with cross-referencing and existing-doc comparison    | research topic or question                   |
| 02  | `extract-terminology` | Extract and classify terminology from universe source files        | `<univers>` + source file(s)                 |

## Default flow

Trigger-to-action mapping:
- "research", "web research", "look up", "find documentation about", "documentary research" → `research`
- "extract terminology", "extract terms", "univers-extract", "terminology from source", "build terminologie.md" → `extract-terminology`

## Transversal rules

- `research` IS a canon producer: cross-verified findings go to `<univers-root>/.docs/canon/`; the working report goes to `<projet-root>/research/<slug>-<date>.md`.
- `research`: minimum 3 distinct web searches; cross-reference ≥ 3 different sources; compare ALL findings with existing universe docs under `<univers-root>/.docs/canon/`; flag contradictions explicitly.
- `extract-terminology`: never invent terms not present in the source; organize output by category (proper nouns, places, organizations, concepts, mechanics); append to or create `<univers-root>/.docs/canon/terminologie.md`. It is the terminology-focused complement of `lore-extract` (both write `canon/`).
- Both actions must validate before writing files.
- If web search is unavailable, state clearly and suggest manual research fallback.

> Path variables: see `setup/references/vault-layout.md`.
