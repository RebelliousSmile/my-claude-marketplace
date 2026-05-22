# 03 - write-dtl

Generate a linter-passing Dialogic `.dtl` timeline from a node spec.

## Inputs

- `node_spec_path` (required) - path to `aidd_docs/memory/external/nodes/<NN>.md`

## Outputs

```
dialogic/timelines/<scene>.dtl
dialogic/timelines/<scene>.tscn.stub.md  (point-and-click nodes only)
```

## Depends on

- `02-decompose`

## Process

1. **Load node spec** and verify all required sections are present (Metadata, Variables, Flags, Characters, Choices if interactive, Transitions, Notes). If a critical section is missing → STOP and ask.
2. **Load output style**: read `output_style:` from the Metadata block; load `aidd_docs/memory/internal/templates/output-styles/<name>.md`. If file not found → STOP. Apply its prose rules, lexicon, typography, and signal format strictly.
3. **Load canon resources**: `bible-jeu.md`, `api-cheatsheet.md`, `variables-register.md`.
4. **Structure the timeline**: mandatory skeleton — header comments (preconditions/postconditions), initial character portrait, beats, choices (if any), final node-end signal (format defined in `api-cheatsheet.md § signaux de fin de node`).
5. **Write prose** strictly per the loaded output style. No tutorials, no exposition; subtext over statement.
6. **Wire signals**: for each effect in the node spec, write the `[signal arg="..."]` using `api-cheatsheet.md` as sole reference. Signals with tracked reasons must include the reason (e.g. `<gauge>:<delta>:<reason>` — see `api-cheatsheet.md` for dispatcher signatures).
7. **Write conditionals** for `{if ...}/{else}/{endif}` branches where the node spec declares flag-dependent dialogue.
8. **Write `.tscn` stub** (Markdown note only, never binary) if node declares a point-and-click scene.
9. **Run linter** (use path declared at `bank.yml § code.linter`):
   ```bash
   godot --headless --path . --script scripts/tools/dtl_linter.gd -- dialogic/timelines/<scene>.dtl
   ```
   If `FAIL`: auto-correct mechanical errors (typo flag, wrong argument order, unknown dispatcher) and relint. If still `FAIL` after 2 attempts → STOP and report to user (likely a missing `DialogicBridge` dispatcher or invalid `PNJ_VALIDES` entry).
10. **Write file** only after linter `PASS`.

## Test

`dialogic/timelines/<scene>.dtl` exists and `godot --headless --path . --script scripts/tools/dtl_linter.gd -- dialogic/timelines/<scene>.dtl` exits with output containing `PASS`.
