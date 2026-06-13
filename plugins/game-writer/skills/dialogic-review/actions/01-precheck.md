# 01 - precheck

Run a fast light review of a `.dtl` with one persona — triage filter before full review.

## Inputs

- `dtl_path` (required) - path to the `.dtl` file to review
- `persona` (required) - persona file slug declared in `bank.yml § personas` (e.g. `dramaturge`, `playtester-lgbtqia`; run `bank challenge` to list available personas)
- `--scene-spec <path>` (optional) - path to the scene spec (scene model); required for `playtester-*` when reviewing a scene-model `.dtl`
- `--pnj-behaviors <paths>` (optional) - comma-separated paths to PNJ behavior files (scene model)
- `--node-spec <path>` (optional) - path to the node spec (node model); required for `dramaturge` when reviewing a node-model `.dtl`

## Outputs

```markdown
## Persona <name> — Pré-review `<dtl>` [--light]

**Score global** : <n>/20

**Verbatims (2 max)** :
« <citation exacte> » — <réaction>

**Faiblesse principale** : 🔴/🟠/🟡 <description + citation>

**Triage** : 🟢 OK pour review complète · 🟡 à surveiller · 🔴 retour à l'écriture
```

## Process

1. **Linter gate**: run linter at path declared in `bank.yml § code.linter`. If `FAIL` → STOP. Do not proceed with a broken `.dtl`.
2. **Load persona YAML** from path declared in `bank.yml § personas.<persona>`. Load its `reference_documents` via `bank.yml`. If `--scene-spec` provided, load it. If `--node-spec` provided, load it.
3. **Read `.dtl`** globally — do not parse branch by branch. Identify tone, rhythm, major beats.
4. **Apply 2–3 discriminant checklist items** from the persona's `Craft Checklist` — the ones most likely to reveal a critical flaw at this scope. Do not apply all items.
5. **Score** with a single weighted global score /20, calibrated on the persona's `scoring_anchors`. Never assign scores outside the defined anchor range.
6. **Write 2 verbatims max** — exact citations from the `.dtl`, never paraphrases.
7. **Write 1 main weakness** — most critical flaw found, with citation. Prefix with severity tag: 🔴 systémique · 🟠 structurel · 🟡 patchable.
8. **Assign triage**:
   - 🟢 score ≥ 15: proceed to full `persona` review
   - 🟡 score 12–14: proceed but focus full review on flagged branches
   - 🔴 score ≤ 11: do NOT run `persona`. Return to `dialogic-draft fix` or `dialogic-draft write-scene --feedback` with the weakness as feedback.
9. **Print result** to stdout.

## Test

Stdout contains a `**Triage**` line with one of 🟢/🟡/🔴 and an explicit recommendation (either "run full review" or "return to writing").
