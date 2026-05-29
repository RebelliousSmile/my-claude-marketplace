# 01 - Research

Perform structured cross-referenced web research on a topic and compare findings with existing project documentation.

> Path variables: see `setup/references/vault-layout.md`.
> `research` IS a canon producer: cross-verified findings go to `<univers-root>/.docs/canon/`.
> The working report (in-progress) is saved under `<projet-root>/research/`.

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
- [ ] New canon doc needed: [topic] → <univers-root>/.docs/canon/<file>.md
```

Working report saved to: `<projet-root>/research/<slug>-<date>.md`
Validated findings saved to: `<univers-root>/.docs/canon/<topic-file>.md` (after user confirmation)

## Process

1. Parse the research topic from `$ARGUMENTS`.
2. Load existing universe docs for comparison from `<univers-root>/.docs/canon/`: `UNIVERS.md`, `terminologie.md`, and any other canon files declared in `bank.yml`.
3. Perform a minimum of 3 distinct web searches using varied query angles (primary topic, historical context, academic sources, primary sources if applicable).
4. Cross-reference results across ≥3 different sources. Build a comparison table.
5. Flag all contradictions between sources explicitly with analysis.
6. Compare ALL findings against existing universe documentation. Identify: confirmed facts, contradictions with existing docs, new information to add.
7. Assemble the research report in the Outputs format.
8. Save the working report to `<projet-root>/research/<slug>-<date>.md` (always, without prompting — it is a working artifact).
9. Ask user: "Should I save the validated findings to `<univers-root>/.docs/canon/<topic-file>.md`?" Save on confirmation. These findings become canon alongside `lore-extract` output.
10. List recommended actions: terms to add to `<univers-root>/.docs/canon/terminologie.md`, sections to update in `<univers-root>/.docs/canon/UNIVERS.md`, new canon documentation files to create.

## Test

After `research "topic"`, verify that `<projet-root>/research/<slug>-<date>.md` exists and contains at least 3 distinct source references, a contradictions section (even if empty), and a comparison with existing docs. On confirmation, verify that validated findings are written to `<univers-root>/.docs/canon/`.
