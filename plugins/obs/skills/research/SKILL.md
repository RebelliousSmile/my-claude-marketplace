---
name: research
model: sonnet
description: Performs cross-referenced documentary research for content projects — web research on historical, cultural, technical, or world-building topics, plus terminology extraction from a domain's source files. Use when a topic lacks documentation in the domain's reference docs, when `writing:forge` identifies a knowledge gap, or when extracting terminology from a PDF extraction result. Do NOT use for general software research — use web search directly; do NOT use for reviewing chapter content — use `writing:review` instead.
---

# Research

Two documentary tools that operate on the **generic domain model** (`${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md`): **research** performs structured web research (minimum 3 searches, cross-referenced sources, comparison with existing docs, contradiction flagging) and saves a report under the **target scope's** `research/` folder; **extract-terminology** distills terminology, proper nouns, and world-building elements from a domain's source documents into a canonical `terminologie.md`. A JDR game domain is one **profile** of this model (documented in `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` § JDR profile), applied conditionally — see *Profile detection*.

## Available actions

| #   | Action                | Role                                                               | Input                                        |
| --- | --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| 01  | `research`            | Web research with cross-referencing and existing-doc comparison    | topic/question + scope (`shared` \| `project`; JDR profile adds `campagne`) |
| 02  | `extract-terminology` | Extract and classify terminology from a domain's source files      | `<scope>` (JDR: `<univers>`) + source file(s) |

## Default flow

Trigger-to-action mapping:
- "research", "web research", "look up", "find documentation about", "documentary research" → `research`
- "extract terminology", "extract terms", "univers-extract", "terminology from source", "build terminologie.md" → `extract-terminology`

## Transversal rules

- **Domain `R` resolution (local, never global).** `research` operates relative to the passed argument, otherwise to the CWD; when it needs the domain level `R`, it **discovers** it via the `obs:tree` anchor — walk up the parents to a `Perso`/`Pro` segment; the subcategory level below is `R`. No domain marker is required, no absolute path, no per-machine config. Primary reference: `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md`. *(JDR profile: a marker-based shortcut is available — walk up to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`; see `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` § JDR profile.)*
- **`research` scope (determine BEFORE writing — never default).** Every research effort targets an explicit **scope**: **`shared`** (R-level knowledge, **durable, reused across work units**) or **`project`** (knowledge **specific to a single work unit**). Ask/infer the scope; list the domain `R`'s shared buckets and its work units. Paths — source of truth `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md`:
  - **`shared`**: verified findings → `<scope-root>/reference/<topic>.md` (they become **durable knowledge, reused across work units**); working report → `<scope-root>/research/<slug>-<date>.md`.
  - **`project`**: report → `<projet-root>/research/<slug>-<date>.md`; verified findings → the unit's governing `reference/` (e.g. the project's shared universe).
  - *(JDR profile — when the domain is JDR: `reference/` is refined into `canon/`, and a third scope **`campagne`** (knowledge **specific to a single game**) exists. Shared/univers findings → `<univers-root>/canon/<thème>.md`; campagne report → `<campagne-root>/research/<slug>-<date>.md`, its retained facts stay **specific to the game** (fed into the campaign prep by `ttrpg:campaign`) and are **promoted to shared canon only by explicit decision**; project findings → the project universe's `canon/`.)*
- `research`: minimum 3 distinct web searches; cross-reference ≥ 3 different sources; compare ALL findings with existing docs **of the chosen scope** (the scope's `reference/` — JDR profile: `canon/`; + campaign lore if campagne scope); flag contradictions explicitly.
- `research` — **workflow mode (optional, broad topics)**: for a **decomposable** topic (a corpus of techniques, an entire universe, an era, a multi-faceted theme), propose a **workflow** rather than an inline search: *fan-out* (1 agent per sub-question/angle) → **adversarial verification** of the claims → **cited synthesis**. This is the `deep-research` pattern. Guardrails: the workflow **requires an explicit opt-in** from the user (token cost) — **never auto-launched**, you propose it and wait for agreement; the quality guarantees apply **per sub-topic** (≥3 cross-referenced sources, comparison with the scope's reference docs, contradictions flagged, no invented source); the final synthesis and the writing of the files stay deterministic (review before writing). For a **narrow** topic (a single fact, a single term), keep the **inline mode** (≥3 searches) — faster and cheaper.
- `extract-terminology`: never invent terms not present in the source; organize output by category (proper nouns, places, organizations, concepts, mechanics); append to or create `<scope-root>/reference/terminologie.md`. *(JDR profile: target `<univers-root>/canon/terminologie.md`; under this profile it is the terminology-focused complement of the JDR feeder `ttrpg:lore-extract` — both write `canon/`.)*
- Both actions must validate before writing files.
- If web search is unavailable, state clearly and suggest manual research fallback.
- **Profile detection.** A domain applies the **JDR profile** (`canon/`+`mj/` provenance split, `campagne` scope, marker-based `R` shortcut, `ttrpg:*` feeders) when `R/bank.yml` declares `profile: jdr` **or** `R` contains the signature buckets `_univers/`/`_systeme/`. Otherwise the **generic core** applies (`reference/` for synthesized knowledge, scopes `shared`/`project`).

> Path variables: primary `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` (JDR profile documented in its § JDR profile).
