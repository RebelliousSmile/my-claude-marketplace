---
name: master_plan
description: Parent plan — sc-php sniff v0.4.0 migration toward sc-js model (sniff restructure + audit skill + setup removal)
argument-hint: N/A
---

# Master Plan: sc-php sniff v0.4.0 — sc-js model adoption

## Overview

- **Goal**: Migrate `sc-php:sniff` to the same architecture as `sc-js:sniff` v0.4.0 (two-tier pivot model with `${CLAUDE_PLUGIN_ROOT}` resolution), create `/sc-php:audit` skill, remove the legacy `setup` skill.
- **Risk Score**: 8/10 (breaking changes: skill removed, action renamed, version bumps minor→0.4.0)
- **Branch**: `feat/sc-php-sniff-v0.4.0` (single branch; per-part branch names in child plans are indicative)
- **Working root**: `/home/tnn/Projets/starters/aidd-overlay/` (never edit `~/.claude/plugins/cache/`).
- **${CLAUDE_PLUGIN_ROOT} convention**: keep the variable literal in all skill Markdown files; Claude Code resolves it at runtime.

## Child Plans

| #   | Plan                                              | File                                              | Status  | Validated |
| --- | ------------------------------------------------- | ------------------------------------------------- | ------- | --------- |
| 1   | Preparation — 8 capability pivots (copy)          | `./2026_05_28-sc-php-sniff-v0.4.0-part-1.md`      | pending | [ ]       |
| 2   | Sniff rewrite — scan + install-pivots + SKILL.md  | `./2026_05_28-sc-php-sniff-v0.4.0-part-2.md`      | blocked | [ ]       |
| 3   | Audit skill (`/sc-php:audit`)                     | `./2026_05_28-sc-php-sniff-v0.4.0-part-3.md`      | blocked | [ ]       |
| 4   | Cleanup — delete setup/, update bruno, bump 0.4.0 | `./2026_05_28-sc-php-sniff-v0.4.0-part-4.md`      | blocked | [ ]       |

## Validation Protocol

1. Complete Plan 1 (preparation copies). Run its acceptance.
2. [ ] Checkpoint 1: 8 new capability pivot files exist; no existing file modified.
3. Complete Plan 2 (sniff rewrite). Run acceptance.
4. [ ] Checkpoint 2: sniff uses `${CLAUDE_PLUGIN_ROOT}`, 02-install-pivots exists, setup still functional.
5. Complete Plan 3 (audit + clean). Run acceptance.
6. [ ] Checkpoint 3: `/sc-php:audit` invokable, `sniff clean` opt-in available.
7. Complete Plan 4 (cleanup + bump). Run global verification.
8. [ ] Final: setup/ removed, plugin.json = 0.4.0, no `setup` references remain in repo.

## Independence guarantee

Each phase, taken alone, leaves the plugin in a functional state:
- After P1: existing skills untouched, new files are additive
- After P2: setup still works on its own references; sniff uses new references
- After P3: new audit skill is invokable; existing flow unchanged
- After P4: terminal cleanup; revert via `git revert` if needed; CHANGELOG.md entry documents breaking changes

## Design note — no `03-clean` action for sc-php

In sc-js, `03-clean` exists because v0.3.0 installed files under `.claude/rules/capabilities/*` that v0.4.0 no longer touches. For **sc-php**, both v0.3.1 and v0.4.0 install the same 6 target paths under `.claude/rules/07-quality/` (`perf-pivots-*.md` and `data-pivots-*.md`). Only the **source** path in the plugin changes (`setup/references/` → `sniff/references/capabilities/`); installed targets remain identical. A `clean` action would either be a no-op or wrongly delete files just reinstalled by `02-install-pivots`. **Dropped from the plan.** A future plan can introduce it if a target path is ever renamed or moved.

The plan also adds a CHANGELOG.md entry documenting the breaking changes (skill `setup` removed, action `sync` renamed to `install-pivots`).

## ${CLAUDE_PLUGIN_ROOT} bug note

The plan generation argument from the harness substituted `${CLAUDE_PLUGIN_ROOT}` with a hard cache path. **Ignored.** All skill files MUST use the literal `${CLAUDE_PLUGIN_ROOT}` string (resolved by Claude Code at runtime, like sc-js does).

## Estimations

- **Confidence**: 9/10
- **Duration**: ~5h (1h P1, 1h30 P2, 1h30 P3, 1h P4)
