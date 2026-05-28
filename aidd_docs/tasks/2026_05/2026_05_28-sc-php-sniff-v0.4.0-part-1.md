---
name: plan
description: sc-php sniff v0.4.0 — Phase 1, preparation (copy 8 capability pivots)
argument-hint: N/A
objective: "Create 8 capability pivot files under sniff/references/capabilities/ by copying from setup/, bruno/, and improve/ — purely additive, no existing file modified."
success_condition: "test -f plugins/sc-php/skills/sniff/references/capabilities/perf/laravel.md && test -f plugins/sc-php/skills/sniff/references/capabilities/perf/symfony.md && test -f plugins/sc-php/skills/sniff/references/capabilities/perf/wordpress.md && test -f plugins/sc-php/skills/sniff/references/capabilities/perf/htmx.md && test -f plugins/sc-php/skills/sniff/references/capabilities/data/eloquent.md && test -f plugins/sc-php/skills/sniff/references/capabilities/data/doctrine.md && test -f plugins/sc-php/skills/sniff/references/capabilities/testing/bruno.md && test -f plugins/sc-php/skills/sniff/references/capabilities/php/solid.md"
iteration: 0
created_at: "2026-05-28T08:00:00Z"
---

# Instruction: sc-php sniff v0.4.0 — Phase 1, preparation

## Feature

- **Summary**: Create 8 new files under `plugins/sc-php/skills/sniff/references/capabilities/` — 6 perf/data pivots copied from `setup/`, 1 testing pivot copied from `bruno/`, 1 PHP/SOLID pivot copied (autonomous) from `improve/01-analyze.md` lines 32-55.
- **Stack**: `Markdown only`
- **Branch name**: `feat/sc-php-sniff-v0.4.0/phase-1`
- **Parent Plan**: `2026_05_28-sc-php-sniff-v0.4.0-master.md`
- **Sequence**: `1 of 4`
- Confidence: 9.5/10
- Time to implement: ~1h

## Architecture projection

### Files to modify

- none — phase is strictly additive

### Files to create

- `plugins/sc-php/skills/sniff/references/capabilities/perf/laravel.md` — verbatim copy of `setup/references/07-perf-pivots-laravel.md`
- `plugins/sc-php/skills/sniff/references/capabilities/perf/symfony.md` — verbatim copy of `setup/references/07-perf-pivots-symfony.md`
- `plugins/sc-php/skills/sniff/references/capabilities/perf/wordpress.md` — verbatim copy of `setup/references/07-perf-pivots-wordpress.md`
- `plugins/sc-php/skills/sniff/references/capabilities/perf/htmx.md` — verbatim copy of `setup/references/07-perf-pivots-htmx.md`
- `plugins/sc-php/skills/sniff/references/capabilities/data/eloquent.md` — verbatim copy of `setup/references/08-data-pivots-eloquent.md`
- `plugins/sc-php/skills/sniff/references/capabilities/data/doctrine.md` — verbatim copy of `setup/references/08-data-pivots-doctrine.md`
- `plugins/sc-php/skills/sniff/references/capabilities/testing/bruno.md` — verbatim copy of `bruno/references/bruno-rules.md`
- `plugins/sc-php/skills/sniff/references/capabilities/php/solid.md` — copy of the SOLID violations section (lines 32-55) from `improve/actions/01-analyze.md`, **wrapped in standalone pivot format** with frontmatter (paths globs covering all PHP files) and a `# SOLID violations — pivot for sc-php audit` heading. Per user decision: autonomous file, may diverge from improve/ over time.

### Files to delete

- none

## Applicable rules

| Tool | Name | Path | Why it applies |
|------|------|------|----------------|
| none | — | — | `list-rules.mjs` → `[]` |

## User Journey

```mermaid
flowchart TD
  A[setup/references/ + bruno/references/ + improve/01-analyze.md] --> B[Read each source]
  B --> C[Write 6 perf/data pivots verbatim to sniff/references/capabilities/{perf,data}/]
  C --> D[Write testing/bruno.md verbatim]
  D --> E[Extract improve/01-analyze.md lines 32-55, wrap in pivot format, write php/solid.md]
  E --> F[Run acceptance: 8 test -f checks]
  F --> G{All pass?}
  G -- yes --> H[Phase 1 done — unblock Phase 2]
  G -- no --> B
```

## Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Frontmatter `paths:` globs of original pivots are framework-specific and may not match the new location semantics | Pivot loaded for wrong files at audit time | Keep original `paths:` block verbatim — sc-js does the same; globs are content-level, not location-level |
| SOLID extraction may break the table formatting of improve/01-analyze.md | improve/ becomes unreadable | Phase is COPY ONLY — never modify improve/01-analyze.md in this phase |
| Parent directories don't exist | Write fails | Create `mkdir -p` first for each subdirectory |

## Implementation phases

### Phase 1: Copy 8 capability pivots (additive only)

> Read sources, create directory structure, write copies. No deletions, no modifications to existing files.

#### Tasks

1. Create directory structure: `mkdir -p plugins/sc-php/skills/sniff/references/capabilities/{perf,data,testing,php}` (4 subdirectories under capabilities/).
2. Read `plugins/sc-php/skills/setup/references/07-perf-pivots-laravel.md` and write its **verbatim content** (including frontmatter) to `plugins/sc-php/skills/sniff/references/capabilities/perf/laravel.md`.
3. Same for `symfony`, `wordpress`, `htmx` (4 perf pivots total).
4. Read `plugins/sc-php/skills/setup/references/08-data-pivots-eloquent.md` and write verbatim to `plugins/sc-php/skills/sniff/references/capabilities/data/eloquent.md`.
5. Same for `doctrine` (2 data pivots total).
6. Read `plugins/sc-php/skills/bruno/references/bruno-rules.md` (33 lines) and write verbatim to `plugins/sc-php/skills/sniff/references/capabilities/testing/bruno.md`.
7. Read `plugins/sc-php/skills/improve/actions/01-analyze.md`. Extract the "SOLID violations" section using a section-marker approach (more resilient than hardcoded line numbers): take everything starting at the `#### SOLID violations` heading and stopping right before the next `####` heading (`#### Missing patterns`). Write a new file `plugins/sc-php/skills/sniff/references/capabilities/php/solid.md` with:
   - Frontmatter:
     ```yaml
     ---
     paths:
       - "**/*.php"
       - "!vendor/**"
     ---
     ```
   - Heading: `# SOLID violations — capability pivot for sc-php audit`
   - One-line intro: `Standalone pivot — initial content seeded from improve/01-analyze.md. May diverge over time.`
   - The 5 SOLID subsections (SRP, OCP, LSP, ISP, DIP) extracted verbatim from improve/01-analyze.md.

#### Acceptance criteria

- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/perf/laravel.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/perf/symfony.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/perf/wordpress.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/perf/htmx.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/data/eloquent.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/data/doctrine.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/testing/bruno.md`
- [ ] `test -f plugins/sc-php/skills/sniff/references/capabilities/php/solid.md`
- [ ] `diff plugins/sc-php/skills/setup/references/07-perf-pivots-laravel.md plugins/sc-php/skills/sniff/references/capabilities/perf/laravel.md` — exits 0 (verbatim copy)
- [ ] `diff plugins/sc-php/skills/bruno/references/bruno-rules.md plugins/sc-php/skills/sniff/references/capabilities/testing/bruno.md` — exits 0
- [ ] `grep -q "SOLID violations" plugins/sc-php/skills/sniff/references/capabilities/php/solid.md`
- [ ] `grep -q "Standalone pivot" plugins/sc-php/skills/sniff/references/capabilities/php/solid.md`
- [ ] No existing file in `setup/`, `bruno/`, or `improve/` was modified by this phase

## Amendments

## Log

## Validation flow demonstration

1. From `/home/tnn/Projets/starters/aidd-overlay/`, run the 8 `test -f` checks.
2. Run `diff` on 6 copies to confirm verbatim copy of perf/data + bruno.
3. Open `php/solid.md` manually, confirm 5 SOLID subsections present.
4. Run `git status plugins/sc-php/skills/setup plugins/sc-php/skills/bruno plugins/sc-php/skills/improve` — should show no modified files (only new files in `sniff/references/capabilities/`).
