# 06 - pnj-behavior

Formalize a PNJ behavioral profile: voice by relationship tier, canon locks, threshold events, and cross-PNJ coordination.

## Inputs

- `pnj_name` (required) - PNJ canonical ID (e.g. `emma`, `sofia`, `frank`, `alex`, `leo`, `marine`, `camille`, `thomas`)
- `arc_spec_archive` (optional) - path to archived arc spec for this PNJ if it exists (e.g. `aidd_docs/memory/external/arcs/_archive/A2-romance-<pnj>.md`)

## Outputs

```
aidd_docs/memory/external/pnjs-behavior/<pnj_name>.md
```

Following the template at `aidd_docs/memory/internal/templates/pnj-behavior.md`.

## Process

1. **Load canon sources**:
   - `bible-jeu.md § <PNJ>` full entry
   - `overview.md § Cast` line for this PNJ + canon locks listed
   - `internal/design-rules/<pnj>-*.md` if a dedicated design rule exists
   - `history.md` — grep PNJ name: extract all canon mentions (FLAG_*, FIN-*, NODE identifiers, trancheages)
   - Archived arc spec if provided — extract recyclable elements

2. **Load existing pnj-behavior files**: scan `pnjs-behavior/` for any cross-PNJ dependencies already documented for this PNJ.

3. **Declare canon locks** (≥ 5, ideally 7+):
   - Drawn exclusively from the sources above
   - Format: "INTERDIT : [behavior/réplique]" or "OBLIGATOIRE : [invariant]"
   - Must cover the PNJ's most likely points of failure in review

4. **Write voice by tier** (9 paliers: Ennemi juré → Fusionnel):
   - Cover all 9 tiers
   - Mark inaccessible tiers explicitly with canon justification (e.g. "inaccessible — FIN-E fermée si palier jamais atteint")
   - Each tier: tone, representative sample dialogue, what Margot can/cannot discuss

5. **Write threshold events** (≥ 1 per significant tier, especially Confident):
   - One-shot event per event (consumed by `_consomme` flag)
   - Declared trigger: palier + flag condition
   - Effect: stat changes, door unlocks (flags), scene context

6. **Declare scene hooks**: which recurring scenes this PNJ appears in, under which conditions.

7. **Declare private space access thresholds**: minimum relationship tier to access PNJ's private area.

8. **Write cross-PNJ coordination** (dedicated section):
   - For each other PNJ with narrative interaction: shared flags (who sets, who reads), couple constraints if applicable.

9. **Retroactive validation on existing `.dtl`**: for each `.dtl` in `dialogic/timelines/` where this PNJ appears, verify lines comply with the canon locks just declared. Document findings in a `### Validation <PNJ> dans <scene>.dtl` section.

10. **Identify 3 structural risks** (impossible tiers, cross-PNJ deadlocks, event never triggerable).

11. **Run validation checklist** before writing:
    - ≥ 5 canon locks declared
    - All 9 tiers covered (inaccessible ones justified)
    - All threshold events have a `_consomme` flag
    - Cross-PNJ section present
    - Retroactive validation section present

12. **Write** `aidd_docs/memory/external/pnjs-behavior/<pnj_name>.md` using the pnj-behavior template.
13. **Update** `aidd_docs/memory/external/pnjs-behavior/_index.md` (synoptic + cross-PNJ matrix). Remind user to run `bank init`.

## Test

`aidd_docs/memory/external/pnjs-behavior/<pnj_name>.md` exists, contains a `### Verrous canon` section with at least 5 items, a voice-by-tier section covering all 9 tiers, and a `### Coordination cross-PNJ` section.
