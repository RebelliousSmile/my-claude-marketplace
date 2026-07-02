---
name: research
model: sonnet
description: Performs cross-referenced documentary research for writing projects — web research on historical, cultural, or world-building topics, plus terminology extraction from universe source files. Use when a topic lacks documentation in the universe docs, when `writing:forge` identifies a knowledge gap, or when extracting terminology from a PDF extraction result. Do NOT use for general software research — use web search directly; do NOT use for reviewing chapter content — use `writing:review` instead.
---

# Research

Two documentary tools for writing projects AND game prep: **research** performs structured web research (minimum 3 searches, cross-referenced sources, comparison with existing docs, contradiction flagging) and saves a report under the **target scope's** `research/` folder (setting/univers, campagne, or writing project — see Transversal rules); **extract-terminology** distills terminology, proper nouns, and world-building elements from universe source documents into a canonical `terminologie.md`.

## Available actions

| #   | Action                | Role                                                               | Input                                        |
| --- | --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| 01  | `research`            | Web research with cross-referencing and existing-doc comparison    | topic/question + scope (univers/setting \| campagne) |
| 02  | `extract-terminology` | Extract and classify terminology from universe source files        | `<univers>` + source file(s)                 |

## Default flow

Trigger-to-action mapping:
- "research", "web research", "look up", "find documentation about", "documentary research" → `research`
- "extract terminology", "extract terms", "univers-extract", "terminology from source", "build terminologie.md" → `extract-terminology`

## Transversal rules

- **Domain `R` resolution (local, never global).** `research` operates relative to the passed argument, otherwise to the CWD; when it needs the domain level `R`, it **discovers** it by walking up the parents to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`. No absolute path, no per-machine config. Detail: `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
- **`research` scope (determine BEFORE writing — no longer target "univers" by default).** Every research effort targets an explicit **scope**: a **setting/univers** (**durable, shared** knowledge across campaigns), a **campagne** (knowledge **specific to a single game**) or a **writing project**. Ask/infer the scope; list the domain `R`'s `_univers/` and `_campagnes/`. Paths — source of truth `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`:
  - **Setting/univers**: verified findings → `<univers-root>/canon/<thème>.md` (= `R/_univers/<univers>/canon/<thème>.md`, they become **shared canon**); working report → `<univers-root>/research/<slug>-<date>.md`.
  - **Campagne**: report → `<campagne-root>/research/<slug>-<date>.md` (= `R/_campagnes/<campagne>/research/<slug>-<date>.md`); the retained facts stay **specific to the game** (fed into the campaign prep by `ttrpg:campaign`) and are **promoted to shared canon only by explicit decision**.
  - **Writing project**: report → `<projet-root>/research/<slug>-<date>.md` (= `R/<AAAA>/<MM>/<projet>/research/<slug>-<date>.md`); verified findings → the project's universe `canon/`.
- `research`: minimum 3 distinct web searches; cross-reference ≥ 3 different sources; compare ALL findings with existing docs **of the chosen scope** (univers `canon/`; + campaign lore if campagne scope); flag contradictions explicitly.
- `research` — **workflow mode (optional, broad topics)**: for a **decomposable** topic (a corpus of techniques, an entire universe, an era, a multi-faceted theme), propose a **workflow** rather than an inline search: *fan-out* (1 agent per sub-question/angle) → **adversarial verification** of the claims → **cited synthesis**. This is the `deep-research` pattern. Guardrails: the workflow **requires an explicit opt-in** from the user (token cost) — **never auto-launched**, you propose it and wait for agreement; the quality guarantees apply **per sub-topic** (≥3 cross-referenced sources, comparison with canon, contradictions flagged, no invented source); the final synthesis and the writing of the files stay deterministic (review before writing). For a **narrow** topic (a single fact, a single term), keep the **inline mode** (≥3 searches) — faster and cheaper.
- `extract-terminology`: never invent terms not present in the source; organize output by category (proper nouns, places, organizations, concepts, mechanics); append to or create `<univers-root>/canon/terminologie.md` (= `R/_univers/<univers>/canon/terminologie.md`). It is the terminology-focused complement of `ttrpg:lore-extract` (both write `canon/`).
- Both actions must validate before writing files.
- If web search is unavailable, state clearly and suggest manual research fallback.

> Path variables: see `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
