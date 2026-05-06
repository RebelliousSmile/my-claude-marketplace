---
name: 'aidd:10:foresee'
description: 'Prospective analysis — surfaces medium-term issues invisible to tests and linters, rates efficiency, utility, and editorial clarity'
argument-hint: '<file-path | plan | skill | command | issue | brainstorm> [--discuss | --plan]'
model: opus
---

# Foresee

## Goal

Analyze $ARGUMENTS for issues that won't surface in tests, linters, or functional reviews — deduced from usage patterns, evolution scenarios, and LLM interpretation risks.

## Dimensions

| Dimension | Définition |
|---|---|
| **Efficience /10** | Accomplit-il son objectif au meilleur niveau possible — pas seulement fonctionnellement, mais de façon optimale ? Note basse = ça marche, mais loin de l'excellence. |
| **Utilité /10** | Est-il utile dans des scénarios d'usage réels et variés — pas seulement le cas idéal ? |
| **Clarté rédactionnelle /10** | Un LLM va-t-il l'interpréter correctement — pas d'ambiguïté, verbosité calibrée, syntaxe parseable ? |

## Process

1. Read the target — depends on target type:
   - **file-path / plan / skill / command**: read the file directly
   - **issue**: fetch from tracker — `gh issue view <n>` or `glab issue view <n>` depending on tracker
   - **brainstorm**: read the brainstorm output from the current conversation context
2. Read adjacent context — depends on target type:
   - **Code / skill / command**: files that call or extend it, existing tests, applicable rules in `.claude/rules/`
   - **Plan** (`aidd_docs/tasks/*.md`): linked issue or user story, section of the codebase being modified, applicable rules
   - **Issue / brainstorm**: existing related files in `aidd_docs/tasks/`, applicable rules, relevant codebase section if identifiable
3. Reason about: edge cases under real usage, evolution scenarios that will break, silent failures, LLM interpretation drift
4. Score each dimension with one-line justification
5. List improvements ranked by impact:
   - 🔴 Will break — predictable failure under normal usage
   - 🟡 Will degrade — friction or drift over time
   - 🟢 Latent debt — won't hurt now, will cost later
6. If `--discuss`: open discussion on how to address each item, no plan created
7. If `--plan`: create a plan in `aidd_docs/tasks/` for the corrections via `aidd:03:plan`

## Output

Inline. No file created unless `--plan` is passed.
