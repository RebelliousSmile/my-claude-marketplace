---
name: master_plan
description: Parent plan orchestrating the four child plans applying audit 2026_05 fixes to plugin sc-php
argument-hint: N/A
---

# Master Plan: sc-php audit fixes (2026_05)

## Overview

- **Goal**: Apply the 12 actionable findings and 5 design decisions from `aidd_docs/tasks/audits/2026_05_sc-php.md` to the `sc-php` plugin (and propagate evals to `sc-python` + `sc-rust`).
- **Risk Score**: 4/10
- **Branch**: `chore/sc-php-audit-fixes` (branche unique — les `branch name` des parts sont indicatifs, pas des branches git séparées)
- **Working root**: `/home/tnn/Projets/starters/aidd-overlay/` (never edit `~/.claude/plugins/cache/`).

## Child Plans

| #   | Plan                                | File                                          | Status  | Validated |
| --- | ----------------------------------- | --------------------------------------------- | ------- | --------- |
| 1   | Quick factual fixes                 | `./2026_05_28-sc-php-audit-fixes-part-1.md`   | done    | [x]       |
| 2   | Consolidate duplications            | `./2026_05_28-sc-php-audit-fixes-part-2.md`   | done    | [x]       |
| 3   | Design decisions propagation        | `./2026_05_28-sc-php-audit-fixes-part-3.md`   | done    | [x]       |
| 4   | Evals coverage + version bump       | `./2026_05_28-sc-php-audit-fixes-part-4.md`   | done    | [x]       |

## Validation Protocol

1. Complete Plan 1 (quick fixes), run its acceptance grep.
2. [x] Checkpoint 1: Phase 1 done (8/8 greps pass).
3. Complete Plan 2 (duplications), run its acceptance grep.
4. [x] Checkpoint 2: Phase 2 done (9/9 greps pass).
5. Complete Plan 3 (design decisions), run its acceptance check.
6. [x] Checkpoint 3: Phase 3 done (3/3 greps pass).
7. Complete Plan 4 (evals + bump), run global verification.
8. [x] Final: all 8 `evals/scenarios.json` exist, `plugin.json` is `0.3.1`, all criteria satisfied.

## Findings → Phases map

| Finding | Phase | Code |
|---|---|---|
| Warning PHP 7.4 assumed (DEC-012) | 1 | F |
| Strict Standards removal | 1 | G1 |
| Array unpacking note correction | 1 | G2 |
| `focus` → category mapping in improve | 1 | K |
| Framework gaps example in legacy scan | 1 | H1 |
| Dry-run output variant in legacy migrate | 1 | H2 |
| Anti-print rule extended | 1 | I |
| Mapping reference→target consolidated | 2 | A |
| `since` filtering logic consolidated | 2 | B |
| Frontmatter `model:` on 7 SKILL.md | 3 | C |
| README note bruno PHP-specific | 3 | D |
| HTMX pivot cross-plugin documented | 3 | J |
| Evals propagation log-analysis | 4 | E |
| Evals creation for 6 skills | 4 | L |
| Version bump 0.3.0 → 0.3.1 | 4 | — |

## Estimations

- **Confidence**: 9/10
- **Duration**: ~4h end-to-end (1h Phase 1, 1h Phase 2, 30min Phase 3, 1h30 Phase 4)
