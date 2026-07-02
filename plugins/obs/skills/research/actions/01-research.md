# 01 - Research

Perform structured cross-referenced web research on a topic and compare findings with existing project documentation.

> Path variables & domain resolution: see `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
> The domain `R` is **discovered locally** (walk up from the argument/CWD to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`) — no global vault, no per-machine config.
> `research` IS a canon producer: cross-verified findings go to `<univers-root>/canon/`.
> The working report (in-progress) is saved under the chosen scope's `research/` folder (univers, campagne, or writing project — see Process).

## Inputs

- `topic` (required) — research topic or question (e.g. `"vaudou haïtien cérémonie Bois-Caïman"`)

## Outputs

```markdown
# Research Report: [Topic]

**Date:** YYYY-MM-DD
**Searches performed:** N

---

## 1. Key Findings

[Structured synthesis of research results, grouped by theme]

## 2. Source Comparison

| Finding | Source A | Source B | Source C | Agreement |
|---------|----------|----------|----------|-----------|
| [fact]  | ✅       | ✅       | ⚠️       | Partial   |

## 3. Contradictions

- **[Point]**: Source A says X, Source B says Y. [Analysis]

## 4. Comparison with Existing Docs

| Element in Universe Docs | Research Finding | Status |
|--------------------------|------------------|--------|
| [element]                | [finding]        | ✅ Confirmed / ⚠️ Contradiction / 🆕 New info |

## 5. Recommendations

- [ ] Add to canon/terminologie.md: [terms]
- [ ] Update canon/UNIVERS.md: [sections]
- [ ] New canon doc needed: [topic] → <univers-root>/canon/<file>.md
```

Working report saved to: `<scope-root>/research/<slug>-<date>.md` — where `<scope-root>` is the chosen scope's root (`<univers-root>`, `<campagne-root>`, or `<projet-root>`, all relative to the discovered `R`).
Validated findings saved to: `<univers-root>/canon/<topic-file>.md` (after user confirmation)

## Process

1. Parse the research topic from `$ARGUMENTS`. Resolve the domain `R` locally (walk up from the argument/CWD to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`); if none is found, report it and propose initializing `R`. Determine the **scope** (univers / campagne / writing project) — never default to univers; list the domain's `_univers/` and `_campagnes/` to help choose.
2. Load existing universe docs for comparison from `<univers-root>/canon/`: `UNIVERS.md`, `terminologie.md`, and any other canon files present in that folder.
3. Perform a minimum of 3 distinct web searches using varied query angles (primary topic, historical context, academic sources, primary sources if applicable).
4. Cross-reference results across ≥3 different sources. Build a comparison table.
5. Flag all contradictions between sources explicitly with analysis.
6. Compare ALL findings against existing universe documentation. Identify: confirmed facts, contradictions with existing docs, new information to add.
7. Assemble the research report in the Outputs format.
8. Save the working report to `<scope-root>/research/<slug>-<date>.md` (always, without prompting — it is a working artifact). `<scope-root>` is the chosen scope's root: `<univers-root>`, `<campagne-root>`, or `<projet-root>`.
9. Ask user: "Should I save the validated findings to `<univers-root>/canon/<topic-file>.md`?" Save on confirmation. These findings become canon alongside `ttrpg:lore-extract` output.
10. List recommended actions: terms to add to `<univers-root>/canon/terminologie.md`, sections to update in `<univers-root>/canon/UNIVERS.md`, new canon documentation files to create.

## Test

After `research "topic"`, verify that `<scope-root>/research/<slug>-<date>.md` (under the chosen scope's `research/` folder, relative to the discovered `R`) exists and contains at least 3 distinct source references, a contradictions section (even if empty), and a comparison with existing docs. On confirmation, verify that validated findings are written to `<univers-root>/canon/`.
