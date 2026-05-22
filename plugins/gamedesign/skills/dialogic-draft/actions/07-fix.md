# 04 - fix

Rewrite a specific branch of a `.dtl` based on review feedback, then relint.

## Inputs

- `dtl_path` (required) - path to the `.dtl` file to fix
- `feedback` (required) - review feedback string (from `dialogic-review persona` or `precheck`)
- `node_spec_path` (optional) - node spec for context if feedback references structural issues

## Outputs

```
dialogic/timelines/<scene>.dtl  (updated in place, targeted branch only)
```

## Process

1. **Read the `.dtl`** and the feedback string.
2. **Identify the targeted branch**: parse feedback to find the specific `[choice text="..."]` branch, beat, or conditional block referenced. If ambiguous → ask the user to clarify which branch.
3. **Load output style**: read `output_style:` from the `.dtl` header comment and reload `aidd_docs/memory/internal/templates/output-styles/<name>.md`. Apply its rules to the rewrite.
4. **Rewrite only the targeted portion**: preserve all other branches, signals, and structure verbatim. Never touch what the feedback does not reference.
5. **Verify signals** in the rewritten section still conform to `api-cheatsheet.md` and the original Transitions table.
6. **Run linter** (use path declared at `bank.yml § code.linter`):
   ```bash
   godot --headless --path . --script scripts/tools/dtl_linter.gd -- <dtl_path>
   ```
   Fix and relint if `FAIL`. Max 2 auto-correction attempts before stopping.
7. **Write** the updated `.dtl` only after linter `PASS`.

## Test

The `.dtl` relints to `PASS` and the diff between old and new file contains changes only within the branch targeted by the feedback (no unrelated lines modified).
