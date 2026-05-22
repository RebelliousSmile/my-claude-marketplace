# 02 - persona

Full matricial review of a `.dtl` — branches × persona × craft checklist. Produces a fragment ready to paste into `review-report.md`.

## Inputs

- `dtl_path` (required) - path to the `.dtl` file to review
- `persona` (required) - persona file slug declared in `bank.yml § personas` (e.g. `dramaturge`, `playtester-lgbtqia`)
- `--scene-spec <path>` (optional) - path to the scene spec (scene model); required for `playtester-*` when reviewing a scene-model `.dtl`
- `--pnj-behaviors <paths>` (optional) - comma-separated paths to PNJ behavior files (scene model)
- `--node-spec <path>` (optional) - path to the node spec; required for personas that declare `requires_node_spec: true` in their YAML (e.g. `dramaturge`)

## Outputs

```markdown
## Persona <name> — <NODE id or SCENE id>

### Branche [<X>] · <libellé>

**Score** : <crit1> <n>/20 · <crit2> <n>/20 · … — **Global <n>/20**

**Vérifications craft checklist** :
- ✅/❌ <critère> : <détail>

**Verbatims** :
« <citation 1> » — <réaction>
« <citation 2> » — <réaction>
« <citation 3> » — <réaction>

**Faiblesses (avocat du diable)** :
1. 🔴 <faiblesse systémique + citation exacte>
2. 🟠 <faiblesse structurelle + citation exacte>
3. 🟡 <faiblesse patchable + citation exacte>

**Triage** : 🟢 / 🟡 / 🔴
```

One section per branch, in `.dtl` order. Severity tags: 🔴 systémique · 🟠 structurel · 🟡 patchable · 🟢 cosmétique.

## Process

1. **Linter gate**: run linter at path declared in `bank.yml § code.linter`. If `FAIL` → STOP.
2. **Load persona YAML** from path declared in `bank.yml § personas.<persona>`. Load its `reference_documents` via `bank.yml`. If `--scene-spec` provided, load it. If `--node-spec` provided, load it. If `--pnj-behaviors` provided, load each file.
3. **Parse branches**: extract each `[choice text="..."]`, linear branch, and `{if ...}` sub-branch.
4. **For each branch**: apply every item of the persona's `Craft Checklist`. Do not invent criteria outside the YAML.
5. **Score per branch**: apply the persona's `Scoring` table (criteria + weights). Compute weighted global /20, calibrated on the persona's `scoring_anchors`. Never assign scores outside the defined anchor range; never use free-floating scores.
6. **Write 3 verbatims max**: exact citations only, no paraphrase.
7. **Write 3 faiblesses minimum** (avocat du diable). Force active search — there are always 3. Prefix each with severity tag. Citation required for each.
8. **Assign branch triage**:
   - 🟢 patchable: all scores ≥ 14 → `dialogic-draft fix` or `dialogic-draft write-scene --feedback` (targeted patch)
   - 🟡 structurel: at least one score 11–13 → `dialogic-draft fix` or `dialogic-draft write-scene --feedback` (local rewrite)
   - 🔴 systémique: at least one score ≤ 10 → return to `dialogic-draft arc-spec`/`decompose` (node model) or `dialogic-draft scene-spec` (scene model)
9. **Print fragment** to stdout. Do not write a file — consolidation is done by the author.
10. **Auto-triggers** (fire only when conditions met, do not announce):
    - If any branch triage = 🔴 and the persona is `playtester-lgbtqia` or `playtester-visual-novel`: flag for `tone-finder` pass on the failing branch.
    - If global score ≤ 10 and the persona declared `training_mode: true` in its YAML: flag for `persona-trainer` recalibration pass.

## Test

Stdout Markdown contains: one `### Branche` section per branch found in the `.dtl`, a `**Score**` line with numeric values, a `**Faiblesses**` block with at least 3 numbered items each containing a severity tag and an exact citation, and a `**Triage**` line per branch.
