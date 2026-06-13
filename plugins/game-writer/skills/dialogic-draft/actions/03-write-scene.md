# 07 - write-scene

Generate a linter-passing Dialogic `.dtl` timeline from a scene-spec and the pnj-behavior files of all candidate PNJs.

## Inputs

- `scene_spec_path` (required) - path to `aidd_docs/memory/external/scenes/<SCENE_ID>.md`
- `feedback` (optional) - review feedback string; when present, rewrite only the targeted subject/branch

## Depends on

- `05-scene-spec`
- `06-pnj-behavior` (for every PNJ in the candidate pool)

## Outputs

```
dialogic/timelines/<scene_id>.dtl
dialogic/timelines/<scene_id>.tscn.stub.md  (point-and-click scenes only — markdown, never binary)
```

## Process

1. **Load scene-spec** and validate required sections: Métadonnées, Jauges activables, Variables PNJ, Trigger, Dialogues d'ambiance, Sujets disponibles, Événements de seuil, Conditions de sortie. If a critical section is missing → STOP.

2. **Load pnj-behaviors** for every PNJ in the candidate pool (from `pnjs-behavior/<pnj>.md`). If a file is missing → STOP — the behavior spec is required before writing.

3. **Load output style**: read `output_style:` from scene-spec metadata, load `templates/output-styles/<name>.md`. If absent → default to `scenario`. Apply its prose rules, lexicon, typography strictly.

4. **Load canon resources** (paths from `bank.yml § lore/code`): `api-cheatsheet.md`, `variables-register.md`.

5. **If `--feedback` present**: identify targeted subject/branch, rewrite only that portion. Preserve everything else verbatim.

6. **Structure the timeline** — mandatory skeleton:
   - Header comments (scene_id, acces_requis, jauges activables, pool PNJ)
   - PNJ presence resolution block (runtime `{if}` per candidate — NEVER hardcode presence)
   - Pending threshold events check block
   - Intro ambiance (with variants by flag)
   - Threshold event injection (if pending + context OK; consume `_pending` flag after)
   - Subject menu (filtered by: PNJ presence × appearance conditions × flags)
   - Outro variants
   - Exit signal (path declared in `api-cheatsheet.md § signaux de fin de node`)

7. **Write subjects**: for each subject in the scene-spec, generate a `[choice]` block with palier-branched replies per PNJ `{if {relation_<pnj>_palier} == "..."}`. Always include a fallback `{else}` for lowest tiers. Verify canon locks from `pnj-behavior` — no canon-violating line.

8. **Wire signals** (strictly per `api-cheatsheet.md`): for each gauge/flag effect, emit `[signal arg="..."]`. Signals with tracked reasons must include the reason (e.g. `<gauge>:<delta>:<reason>`). Verify every emitted gauge is in the scene-spec's `Jauges activables` scope — if not → STOP (scope violation, fix scene-spec first).

9. **Cap exit**: implement subject cap per visit (Dialogic counter). Implement forced exits if declared.

10. **Write `.tscn` stub** (Markdown note only) if the scene requires a point-and-click `.tscn`.

11. **Validation checklist** before linter:
    - All `[signal arg="..."]` conform to `api-cheatsheet.md`
    - No gauge modified outside declared scope
    - All `{...}` variables are declared or inherited from upstream
    - All PNJs cited exist in `bible-jeu.md` and have loaded `pnj-behavior`
    - All threshold events cited exist in their `pnj-behavior`
    - All canon locks respected (no contradicting line)
    - `acces_requis` noted in header comment

12. **Run linter** (use path declared at `bank.yml § code.linter`):
    ```bash
    godot --headless --path . --script scripts/tools/dtl_linter.gd -- dialogic/timelines/<scene_id>.dtl
    ```
    Fix and relint if `FAIL`. Max 2 auto-correction attempts. If still `FAIL` → STOP and report (likely a missing dispatcher, PNJ, or variable in Godot code — patch code first, then retry).

13. **Write file** only after linter `PASS`.

14. **Auto-trigger tone-finder** (post-PASS): count `.dtl` files using this output-style. If ≥ 3, or a reviewer flagged a linguistic pattern, emit a tone-finder patch proposal in post-script (to be committed separately).

## Test

`dialogic/timelines/<scene_id>.dtl` exists, linter exits `PASS`, and the `.dtl` contains a PNJ presence resolution block (`{if` block setting `present_<pnj>` variables) and at least one `[choice]` block for a scene subject.
