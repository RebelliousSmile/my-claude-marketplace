# 01 - arc-spec

Derive a structured arc spec from the project overview for a given ARC_ID.

## Inputs

- `arc_id` (required) - arc identifier (e.g. `PRO`, `A1`, `A2-romance-thomas`)
- `overview_path` (optional, default: `aidd_docs/memory/external/overview.md`) - alternative overview path

## Outputs

```
aidd_docs/memory/external/arcs/<ARC_ID>.md
```

Following the template at `@aidd_docs/memory/internal/templates/arc-spec.md`: beats, branches, pre/postconditions, node list, structural risks.

## Process

1. **Load resources**: read `overview_path`, `bible-jeu.md`, `history.md`, `architecture.md`, `variables-register.md`.
2. **Locate arc in overview**: find the section for `arc_id`. If absent → STOP and ask the user to complete the overview (e.g. via `aidd-refine:01-brainstorm`) first.
3. **Inventory preconditions**: for every variable mentioned in the overview for this arc, verify it exists in `variables-register.md`. Declare new ones explicitly in the arc spec under "Préconditions".
4. **Decompose into beats** (3–7): each beat must produce at least one state change (flag, gauge, relation). No filler beats.
5. **Map major branches**: for each fork, declare gauge effects (gauges declared in `variables-register.md § gauges`), faction effects (factions declared in `variables-register.md § factions`), ends opened/closed, destination node.
6. **Write postconditions** per branch in strict `flag_<nom>: <valeur>` YAML format.
7. **List required nodes** with ID, role, complexity, choice count.
8. **Identify 3 structural risks** (orphan endings, PNJ out of arc, gauge overflow).
9. **Run local validation checklist** before writing:
   - All gauges exist in `variables-register.md`
   - All factions appear in `variables-register.md § factions`
   - All endings appear in `history.md § endings`
   - All node IDs are unique
   - No branch leads to a dead-end without an exit flag
10. **Write** `aidd_docs/memory/external/arcs/<ARC_ID>.md` using the arc-spec template.

## Test

`aidd_docs/memory/external/arcs/<ARC_ID>.md` exists, contains a non-empty `### Nodes à produire` section, and all flags in the postconditions block appear in `variables-register.md`.
