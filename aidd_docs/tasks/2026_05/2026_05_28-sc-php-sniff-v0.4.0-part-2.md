---
name: plan
description: sc-php sniff v0.4.0 — Phase 2, rewrite sniff (scan + install-pivots + SKILL.md)
argument-hint: N/A
objective: "Rewrite sniff/01-scan.md and sniff/SKILL.md to use ${CLAUDE_PLUGIN_ROOT} and the two-tier pivot model. Create sniff/02-install-pivots.md replacing 02-sync.md (the old file is NOT deleted yet — that happens in Phase 4)."
success_condition: "test -f plugins/sc-php/skills/sniff/actions/02-install-pivots.md && grep -q 'CLAUDE_PLUGIN_ROOT' plugins/sc-php/skills/sniff/actions/01-scan.md && grep -q 'pivot manifeste' plugins/sc-php/skills/sniff/actions/01-scan.md && grep -q 'install-pivots' plugins/sc-php/skills/sniff/SKILL.md && ! test -f plugins/sc-php/skills/sniff/actions/02-sync.md && test -f plugins/sc-php/skills/sniff/_deprecated/02-sync.md"
iteration: 0
created_at: "2026-05-28T08:00:00Z"
---

# Instruction: sc-php sniff v0.4.0 — Phase 2, sniff rewrite

## Feature

- **Summary**: Adopt the sc-js sniff architecture in sc-php sniff. Rewrite `01-scan.md` to use `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/...` resolution, emit a two-tier pivot manifeste (capability pivots loaded at audit time + perf/data pivots installed to `.claude/rules/`). Create `02-install-pivots.md` as the new write action (modeled after sc-js, replaces `02-sync.md`). Update `SKILL.md` to describe the new action list (only `scan` + `install-pivots` — no `clean` per master design note). Move `02-sync.md` out of `actions/` to `sniff/_deprecated/02-sync.md` so Claude Code's dispatcher no longer picks it up; deletion happens in Phase 4.
- **Stack**: `Markdown only`
- **Branch name**: `feat/sc-php-sniff-v0.4.0/phase-2`
- **Parent Plan**: `2026_05_28-sc-php-sniff-v0.4.0-master.md`
- **Sequence**: `2 of 4`
- Confidence: 9/10
- Time to implement: ~1h30

## Architecture projection

### Files to modify

- `plugins/sc-php/skills/sniff/SKILL.md` — new description (two-tier model, mention `/sc-php:audit`), new actions table (`scan`, `install-pivots`, `clean`), updated conceptual model section, new transversal rules (capability vs perf/data distinction)
- `plugins/sc-php/skills/sniff/actions/01-scan.md` — full rewrite: `${CLAUDE_PLUGIN_ROOT}` resolution, Step 5 split into "Capability pivots (loaded at audit time, not installed)" + "Perf pivots (install targets)" + "Data pivots (install targets)" with new entries for `php/solid.md` (always applicable) and `testing/bruno.md` (if `bruno/` folder detected)

### Files to create

- `plugins/sc-php/skills/sniff/actions/02-install-pivots.md` — new action modeled after `sc-js/skills/sniff/actions/02-install-pivots.md`: reads manifeste, installs perf/data pivots ONLY to `.claude/rules/07-quality/`, never installs capability pivots, applies install/skip/update logic

### Files to delete

- none (02-sync.md remains; deletion is Phase 4)

## Applicable rules

| Tool | Name | Path | Why it applies |
|------|------|------|----------------|
| none | — | — | meta-plugin repo, no installed rules |

## User Journey

```mermaid
flowchart TD
  A[Phase 1 done — 8 capability pivots exist] --> B[Read sc-js/skills/sniff/actions/01-scan.md as template]
  B --> C[Rewrite sc-php/skills/sniff/actions/01-scan.md: CLAUDE_PLUGIN_ROOT + two-tier manifest]
  C --> D[Write sc-php/skills/sniff/actions/02-install-pivots.md modeled after sc-js]
  D --> E[Update sc-php/skills/sniff/SKILL.md: new description + actions table]
  E --> F[Run acceptance: ${CLAUDE_PLUGIN_ROOT} present, install-pivots exists, 02-sync.md still present]
  F --> G{All pass?}
  G -- yes --> H[Phase 2 done — setup still functional]
  G -- no --> B
```

## Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Capability pivot detection condition for `testing/bruno.md` is unclear (when is bruno applicable?) | Wrong loading at audit time | Define explicitly in 01-scan.md: load `testing/bruno.md` only if a `bruno/` folder OR `*.bru` files exist in the project root |
| `php/solid.md` is marked "always applicable" but may be too noisy for tiny scripts | False positives at audit | Document as "loaded for every PHP project; the audit skill can ignore it via user config" — accept as design choice |
| `${CLAUDE_PLUGIN_ROOT}` template syntax may differ between Claude Code versions | Path resolution fails | Match sc-js syntax exactly: `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>` (verified working in sc-js v0.4.0) |
| Old `02-sync.md` left invokable in `actions/` would be dispatched by Claude Code as `sniff 02-sync` between P2 and P4 | Wrong action runs, broken behavior | Move file to `sniff/_deprecated/02-sync.md` (out of the dispatched `actions/` tree). Underscore prefix signals "not an action group". Deletion in Phase 4. |

## Implementation phases

### Phase 2: Rewrite sniff for two-tier model

> Modify 2 files, create 1 file. Leave 02-sync.md alone (marked deprecated).

#### Tasks

1. Read `plugins/sc-js/skills/sniff/actions/01-scan.md` as reference template (read-only). Understand the two-tier output structure (capability pivots listed for audit + perf/data pivot install targets).
2. Rewrite `plugins/sc-php/skills/sniff/actions/01-scan.md` end-to-end. Sections:
   - Step 1 — Read project manifests (composer.json, artisan, bin/console, wp-config.php) — KEEP existing logic
   - Step 2 — Classify framework — KEEP
   - Step 3 — Classify data layer — KEEP
   - Step 4 — Detect frontend bridge (HTMX) — KEEP
   - Step 4b — Detect testing harness: check for `bruno/` folder or `**/*.bru` files (limit to 100 files); if found, enable `testing/bruno.md` capability pivot
   - Step 5 — Map capabilities to pivots. **TWO subsections**:
     - **Capability pivots (loaded at audit time, NOT installed)** — list of `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>` entries:
       - `php/solid.md` — always applicable (every PHP project)
       - `testing/bruno.md` — if Step 4b detected bruno
     - **Perf pivots (install targets)** — table with `Condition | Source | Target` (3 columns) using `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/<framework>.md` as Source. Targets unchanged: `.claude/rules/07-quality/perf-pivots-<framework>.md`
     - **Data pivots (install targets)** — same structure for eloquent/doctrine
   - Step 6 — Status each perf/data pivot (MISSING/UP-TO-DATE/OUTDATED/NOT-APPLICABLE) — KEEP, applies only to perf/data
   - Step 7 — Detect gaps — KEEP, but expand examples to mention capability gaps (e.g. `livewire detected — no Livewire capability pivot in plugin`)
3. Update Output section of 01-scan.md to match the sc-js manifeste format (capability pivots listed separately from perf/data install targets).
4. Read `plugins/sc-js/skills/sniff/actions/02-install-pivots.md` as reference. Write `plugins/sc-php/skills/sniff/actions/02-install-pivots.md` adapting:
   - Source paths: `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/<framework>.md` → `.claude/rules/07-quality/perf-pivots-<framework>.md` (6 entries: 4 perf + 2 data)
   - Install rules: install/skip/update logic identical to sc-js
   - Scope constraint section: capability pivots are NEVER installed
   - Output section: mirror sc-js style
5. Update `plugins/sc-php/skills/sniff/SKILL.md`:
   - Update YAML `description:` to mention two-tier model + `/sc-php:audit` consumption (similar tone to sc-js)
   - Replace actions table with (only the 2 actions that exist after Phase 2):
     ```
     | # | Action | Role | Input |
     |---|--------|------|-------|
     | 01 | `scan` | Detect capabilities, emit pivot manifeste, map perf/data install targets | current project path |
     | 02 | `install-pivots` | Install perf/data pivots to `.claude/rules/07-quality/` | scan pivot manifeste |
     ```
   - Add `## Conceptual model` section explaining capability pivots vs perf/data pivots (mirror sc-js wording, adapted for PHP)
   - Update "Default flow" section: `scan → install-pivots` (sequential)
   - Update Transversal rules to mention: never install capability pivots; load via `${CLAUDE_PLUGIN_ROOT}` at audit time
6. Move `plugins/sc-php/skills/sniff/actions/02-sync.md` to `plugins/sc-php/skills/sniff/_deprecated/02-sync.md` (`git mv`). Rationale: a deprecation comment alone wouldn't prevent Claude Code's dispatcher from picking up the file in `actions/`. Moving it out of the dispatched directory makes Phase 2 truly self-consistent (no dangling invokable action). Final deletion still happens in Phase 4.

#### Acceptance criteria

- [ ] `grep -q "CLAUDE_PLUGIN_ROOT" plugins/sc-php/skills/sniff/actions/01-scan.md`
- [ ] `grep -q "pivot manifeste\|capability pivot" plugins/sc-php/skills/sniff/actions/01-scan.md`
- [ ] `grep -q "php/solid.md" plugins/sc-php/skills/sniff/actions/01-scan.md`
- [ ] `grep -q "testing/bruno.md" plugins/sc-php/skills/sniff/actions/01-scan.md`
- [ ] `test -f plugins/sc-php/skills/sniff/actions/02-install-pivots.md`
- [ ] `grep -q "CLAUDE_PLUGIN_ROOT" plugins/sc-php/skills/sniff/actions/02-install-pivots.md`
- [ ] `grep -q "install-pivots" plugins/sc-php/skills/sniff/SKILL.md`
- [ ] `grep -q "Conceptual model\|conceptual model" plugins/sc-php/skills/sniff/SKILL.md`
- [ ] `! test -f plugins/sc-php/skills/sniff/actions/02-sync.md` — old file moved out of actions/
- [ ] `test -f plugins/sc-php/skills/sniff/_deprecated/02-sync.md` — preserved in _deprecated/ until Phase 4
- [ ] `! grep -q "03.*clean\|03 .clean.\|03-clean" plugins/sc-php/skills/sniff/SKILL.md` — no advertised action without backing file
- [ ] Manual: open new 01-scan.md, confirm structure mirrors sc-js (read both files side by side)

## Amendments

## Log

## Validation flow demonstration

1. From `/home/tnn/Projets/starters/aidd-overlay/`, run the 10 acceptance commands.
2. Manual structural review: diff the section structure of sc-php/sniff/01-scan.md against sc-js/sniff/01-scan.md — they should follow the same Step numbering and use the same `${CLAUDE_PLUGIN_ROOT}` resolution.
3. Confirm setup/ still works: `cat plugins/sc-php/skills/setup/actions/01-install.md` still references its own files; nothing has been deleted yet.
