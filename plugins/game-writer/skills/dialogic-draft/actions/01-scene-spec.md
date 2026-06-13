# 05 - scene-spec

Derive a structured scene spec for a recurring or multi-PNJ scene from the project overview.

## Inputs

- `scene_id` (required) - scene identifier (e.g. `diner_arrivee`, `cellule_nuit`, `coursive_residents`)
- `overview_path` (optional, default: `aidd_docs/memory/external/overview.md`) - alternative overview path

## Outputs

```
aidd_docs/memory/external/scenes/<SCENE_ID>.md
```

Following the template at `aidd_docs/memory/internal/templates/scene-spec.md`.

## Process

1. **Load resources**: read `overview_path`, `bible-jeu.md`, `architecture.md`, `variables-register.md`.
2. **Load available pnj-behaviors**: list existing files under `aidd_docs/memory/external/pnjs-behavior/`.
3. **Locate scene in overview**: find the section for `scene_id`. If absent → STOP and ask the user to update the overview first.
4. **Frame the scene**: type (recurring vs. unique), act(s), narrative trigger conditions, cooldown/cap if recurring.
5. **Inventory PNJs**: for each candidate PNJ, declare presence condition. Flag missing `pnj-behavior` files as structural risks — do NOT proceed without them for their subjects.
6. **Declare gauge scope** (mandatory): list explicitly which gauges this scene can modify. Justify each inclusion. No subject may modify a gauge outside this scope.
7. **Write ambient dialogue**: Margot arrival intro, outro variants.
8. **List 3–6 subjects**: for each subject — short label, appearance condition, target PNJ, base gauge effects, use cap, response table by PNJ × palier.
   - Every subject must produce at least one gauge or flag change. No neutral subject.
   - Response table covers at minimum: Méfiance, Neutre, Allié, Confident for targeted PNJs.
   - Verify PNJ canon locks from `pnj-behavior` files.
9. **Inventory threshold events**: for each PNJ present, list their threshold events (from `pnj-behavior`) that may trigger in this scene context.
10. **Declare exit conditions**: subject cap per visit (2–4), forced exits if applicable.
11. **Identify 3 structural risks** (unreachable subjects, gauge saturation, scope overflow).
12. **Run validation checklist** before writing:
    - All gauges are in `variables-register.md § gauges`
    - All factions appear in `variables-register.md § factions`
    - All referenced `pnj-behavior` files exist
    - No subject without effect
    - PNJ canon locks respected
13. **Write** `aidd_docs/memory/external/scenes/<SCENE_ID>.md` using the scene-spec template.
14. **Update** `aidd_docs/memory/external/scenes/_index.md` (add entry). Remind user to run `bank init`.

## Test

`aidd_docs/memory/external/scenes/<SCENE_ID>.md` exists, contains a non-empty `### Jauges activables` section and a `### Sujets disponibles` section with at least one subject that has a non-empty response table.
