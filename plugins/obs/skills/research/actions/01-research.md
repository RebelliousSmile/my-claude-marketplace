# 01 - Research

Perform structured cross-referenced web research on a topic and compare findings with the chosen scope's existing documentation.

> Path variables & domain resolution: primary `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` (JDR profile in its § JDR profile).
> The domain `R` is **discovered locally** via the `obs:tree` anchor (walk up from the argument/CWD to a `Perso`/`Pro` segment; the subcategory below is `R`) — no global vault, no per-machine config. *(JDR profile: marker-based shortcut — walk up to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`.)*
> `research` IS a reference producer: cross-verified findings go to the chosen scope's `reference/` (JDR profile: `canon/`).
> The working report (in-progress) is saved under the chosen scope's `research/` folder (`shared` or `project` — JDR profile adds `campagne`).

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

| Element in Scope Reference Docs | Research Finding | Status |
|---------------------------------|------------------|--------|
| [element]                       | [finding]        | ✅ Confirmed / ⚠️ Contradiction / 🆕 New info |

## 5. Recommendations

- [ ] Add to reference/terminologie.md: [terms]
- [ ] Update the scope's overview doc: [sections]
- [ ] New reference doc needed: [topic] → <scope-root>/reference/<file>.md
```

> JDR profile: the scope's `reference/` is named `canon/` — read the recommendations above as `canon/terminologie.md`, `canon/UNIVERS.md`, `<univers-root>/canon/<file>.md`.

Working report saved to: `<scope-root>/research/<slug>-<date>.md` — where `<scope-root>` is the chosen scope's root (`shared` bucket or `<projet-root>`; JDR profile: `<univers-root>`, `<campagne-root>`, or `<projet-root>`, all relative to the discovered `R`).
Validated findings saved to: `<scope-root>/reference/<topic-file>.md` (after user confirmation; JDR profile: `canon/`)

## Process

1. Parse the research topic from `$ARGUMENTS`. Resolve the domain `R` locally (via the `obs:tree` anchor — walk up from the argument/CWD to a `Perso`/`Pro` segment, the subcategory below is `R`; JDR profile: shortcut to the first folder containing a marker `_campagnes/`, `_univers/` or `_pjs/`); if `R` cannot be resolved, report it and propose initializing `R`. Detect whether the JDR profile applies (`profile: jdr` in `R/bank.yml`, or `_univers/`/`_systeme/` present). Determine the **scope** (`shared` / `project`; JDR profile adds `campagne`) — never default; list the domain's shared buckets and work units to help choose.
2. Load existing scope docs for comparison from `<scope-root>/reference/` (JDR profile: `canon/`): the scope's overview doc, `terminologie.md`, and any other reference files present in that folder.
3. Perform a minimum of 3 distinct web searches using varied query angles (primary topic, historical context, academic sources, primary sources if applicable).
4. Cross-reference results across ≥3 different sources. Build a comparison table.
5. Flag all contradictions between sources explicitly with analysis.
6. Compare ALL findings against the scope's existing reference documentation. Identify: confirmed facts, contradictions with existing docs, new information to add.
7. Assemble the research report in the Outputs format.
8. Save the working report to `<scope-root>/research/<slug>-<date>.md` (always, without prompting — it is a working artifact). `<scope-root>` is the chosen scope's root: the `shared` bucket or `<projet-root>` (JDR profile: `<univers-root>`, `<campagne-root>`, or `<projet-root>`).
9. Ask user: "Should I save the validated findings to `<scope-root>/reference/<topic-file>.md`?" (JDR profile: `canon/`). Save on confirmation. For a **campagne** scope (JDR profile), the retained facts stay specific to the game and are promoted to shared canon **only by explicit decision**. Under the JDR profile these findings become canon alongside `ttrpg:lore-extract` output.
10. List recommended actions: terms to add to `<scope-root>/reference/terminologie.md`, sections to update in the scope's overview doc, new reference documentation files to create (JDR profile: `canon/`).

## Test

After `research "topic"`, verify that `<scope-root>/research/<slug>-<date>.md` (under the chosen scope's `research/` folder, relative to the discovered `R`) exists and contains at least 3 distinct source references, a contradictions section (even if empty), and a comparison with existing docs. On confirmation, verify that validated findings are written to `<scope-root>/reference/` (JDR profile: `canon/`).
