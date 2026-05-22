---
name: dialogic-draft
model: sonnet
description: Sequential writing pipeline for 8-MINE Dialogic timelines. Two models coexist — Scene model (primary, recurring scenes) and Node model (legacy, linear scripted scenes). Use when writing a new scene spec, formalizing a PNJ behavior, writing a recurring .dtl (scene model), decomposing an arc into nodes, writing a scripted .dtl (node model), or applying review feedback. Do NOT use for reviewing timelines - use `dialogic-review` instead.
---

# dialogic-draft

Two coexisting production models for Dialogic `.dtl` timelines:

- **Scene model (primary)** — recurring, multi-PNJ scenes (dîner, cellule, coursive…). Pipeline: `scene-spec` + `pnj-behavior` → `write-scene`.
- **Node model (legacy)** — linear scripted scenes (prologue, FIN codas, one-shot sequences). Pipeline: `arc-spec` → `decompose` → `write-dtl`.

`fix` applies to both models. No `.dtl` exits either pipeline without a linter `PASS`.

## Available actions

| #   | Action         | Role                                                          | Input                                   | Model  |
| --- | -------------- | ------------------------------------------------------------- | --------------------------------------- | ------ |
| 01  | `scene-spec`   | Derive scene spec from overview + SCENE_ID                    | SCENE_ID + `overview.md`                | Scene  |
| 02  | `pnj-behavior` | Formalize PNJ behavioral profile (voice × palier × events)    | PNJ name + `bible-jeu.md`               | Scene  |
| 03  | `write-scene`  | Generate `.dtl` from scene-spec + pnj-behaviors, run linter   | `scenes/<ID>.md` + `pnjs-behavior/`     | Scene  |
| 04  | `arc-spec`     | Derive arc spec from overview + ARC_ID                        | ARC_ID + `overview.md`                  | Node   |
| 05  | `decompose`    | Break arc spec into node specs with Transitions table         | `arcs/<ARC_ID>.md`                      | Node   |
| 06  | `write-dtl`    | Generate `.dtl` from node spec, run linter until PASS         | `nodes/<NN>.md`                         | Node   |
| 07  | `fix`          | Rewrite targeted branch from review feedback, relint           | `.dtl` path + feedback string           | Both   |

## Default flows

**Scene model** (primary): `01 → 02 → 03`. Action `02` may be run independently for any PNJ. Action `07` re-enters after review.

**Node model** (legacy): `04 → 05 → 06`. Action `07` re-enters after review.

Trigger-to-action mapping:
- "scene spec", "spec scène", "write scene spec" → `scene-spec`
- "pnj behavior", "fiche pnj", "pnj-behavior" → `pnj-behavior`
- "write scene", "generate scene", "écrire scène" → `write-scene`
- "arc spec", "spec arc", "write arc spec" → `arc-spec`
- "decompose arc", "break into nodes", "node decomposition" → `decompose`
- "write dtl", "generate timeline", "write node" → `write-dtl`
- "fix dtl", "apply feedback", "doctor", "write-scene --feedback" → `fix`

## Dependency declarations

Scene model entry points (`01-scene-spec`, `02-pnj-behavior`) have no `## Depends on`. `03-write-scene` depends on both. Node model entry point (`04-arc-spec`) has no `## Depends on`. `05-decompose` and `06-write-dtl` declare `## Depends on`. `07-fix` has no `## Depends on` (re-entry point).

## Transversal rules

- No `.dtl` exits `write-scene`, `write-dtl`, or `fix` without linter `PASS` from `scripts/tools/dtl_linter.gd` (path: `bank.yml § code.linter`).
- Never invent variables — cross-check every flag, gauge, and faction against `variables-register.md`.
- No neutral subjects/branches — every choice must move at least one gauge or flag.
- Output of `write-scene` and `write-dtl` is `.dtl` only; no `.tscn` binaries, no `.gd` finals.
- `fix` rewrites only the targeted branch/subject; the rest of the `.dtl` is preserved verbatim.
- **Scene model**: scope of activatable gauges is declared in `scene-spec` — any signal outside scope → STOP.
- **Scene model**: PNJ presence must be resolved runtime (block at `_ready`), never hardcoded.
- **Node model**: arc-spec is source of truth for postconditions; node-spec is source of truth for transitions.

## External data

- `aidd_docs/memory/internal/bank.yml` - canonical resource registry (lore, code, output styles, personas)
- `aidd_docs/memory/external/overview.md` - project overview consumed by `scene-spec` and `arc-spec`
- `aidd_docs/memory/external/bible-jeu.md` - narrative canon
- `aidd_docs/memory/external/history.md` - arc/node arborescence and endings
- `aidd_docs/memory/external/pnjs-behavior/` - PNJ behavioral profiles (scene model)
- `aidd_docs/memory/external/scenes/` - scene specs (scene model output)
- `aidd_docs/memory/external/arcs/` - arc specs (node model)
- `aidd_docs/memory/external/nodes/` - node specs (node model)
- `aidd_docs/memory/internal/architecture.md` - NODE format and Godot conventions
- `aidd_docs/memory/internal/api-cheatsheet.md` - DialogicBridge signal API
- `aidd_docs/memory/internal/variables-register.md` - flags, factions, countdowns, gauges
- `aidd_docs/memory/internal/templates/scene-spec.md` - scene spec output template (scene model)
- `aidd_docs/memory/internal/templates/pnj-behavior.md` - PNJ behavior output template (scene model)
- `aidd_docs/memory/internal/templates/node-spec.md` - node spec output template (node model)
- `aidd_docs/memory/internal/templates/output-styles/scenario.md` - default prose style
- `scripts/tools/dtl_linter.gd` - mechanical linter (mandatory gate)
