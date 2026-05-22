---
name: dialogic-review
model: opus
description: Reviews and validates 8-MINE Dialogic timelines and narrative graph. Use when running a persona review on a .dtl (light or full), auditing the narrative graph structure, or managing node lifecycle (list/status/update/retire). Do NOT use for rewriting timelines - use `dialogic-draft fix` or `dialogic-draft write-scene --feedback` instead.
---

# dialogic-review

Validates Dialogic timelines and the narrative graph through four independent actions: a fast pre-review filter (`precheck`), a full persona-driven review (`persona`), a structural graph audit (`graph-audit`), and node lifecycle management (`node-manage`). All actions require a prior linter `PASS` on any `.dtl` they receive.

Supports both production models:
- **Scene model**: pass `--scene-spec <path>` and `--pnj-behaviors <paths>` to `precheck` and `persona`
- **Node model** (legacy): pass `--node-spec <path>` to `precheck` and `persona`

## Available actions

| #   | Action        | Role                                                           | Input                                                  |
| --- | ------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| 01  | `precheck`    | Fast light review with one persona — triage filter (`--light`) | `.dtl` path + persona + spec source                   |
| 02  | `persona`     | Full matricial review (branches × persona × craft checklist)   | `.dtl` path + persona + spec source                   |
| 03  | `graph-audit` | Validate narrative graph: transitions, orphans, broken loops   | `arcs/` + `nodes/` directories (node model)           |
| 04  | `node-manage` | List / status / update / retire nodes in the registry          | command + optional node ID                             |

## Default flow

Non-sequential. Trigger-to-action mapping:

- "precheck", "light review", "quick review", "pre-review", "--light" → `precheck`
- "review", "persona review", "full review" → `persona`
- "graph audit", "audit graph", "validate graph", "check transitions" → `graph-audit`
- "node list", "node status", "node update", "retire node", "manage nodes" → `node-manage`

## Transversal rules

- Linter `PASS` is a hard prerequisite for `precheck` and `persona` — run linter at path declared in `bank.yml § code.linter` and stop if `FAIL`.
- A persona review never rewrites — it reports. Rewrites go to `dialogic-draft fix` (node model) or `dialogic-draft write-scene --feedback` (scene model).
- `precheck` 🔴 = do NOT run `persona` on the same `.dtl`; return to writing first.
- Verbatims in `persona` must be exact citations from the `.dtl`, never paraphrases.
- Minimum 3 faiblesses in `persona` full mode — force active search with severity tags.
- Calibration must use `scoring_anchors` from the persona YAML — never free-floating scores.

## Active personas (4 — cap design)

Declared in `bank.yml § personas`. As of 2026-05-22:

| Persona | Scope | Notes |
|---|---|---|
| `dramaturge` | Structure, scope jauges, verrous canon, fins, beats | v1.1 — absorbs ex-`auditeur-scene` role |
| `playtester-lgbtqia` | Représentation, pronoms, tropes, verrous Sofia/Emma/Camille | Loads `sofia-kessler-caracterisation.md` + `pool-romance-pas-drague.md` |
| `playtester-visual-novel` | Pacing, choix significatifs, voix Margot, sous-texte | Absorbs ex-`margot-joueuse` role |
| `playtester-cyberpunk` | Worldbuilding corpos, surveillance vécue, cyberpunk de l'intime | |

**Archived** (in `personas/_archive/`, non-invocable): `margot-joueuse`, `auditeur-scene`, `coauteur-ia`, `critique-indie-narratif`, `playtester-accessibilite`.

## External data

- `aidd_docs/memory/internal/bank.yml` - persona file paths and their reference documents
- `aidd_docs/memory/internal/personas/` - persona YAML files (canonical list in `bank.yml § personas`)
- `aidd_docs/memory/external/nodes/` - node spec registry (node model)
- `aidd_docs/memory/external/arcs/` - arc spec registry (node model)
- `aidd_docs/memory/external/scenes/` - scene spec registry (scene model)
- `aidd_docs/memory/external/pnjs-behavior/` - PNJ behavioral profiles (scene model)
- `aidd_docs/memory/internal/templates/review-report.md` - review report output template
- `scripts/tools/dtl_linter.gd` - linter (mandatory pre-gate; path from `bank.yml § code.linter`)
