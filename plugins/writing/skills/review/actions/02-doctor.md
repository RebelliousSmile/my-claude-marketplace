# 02 - Doctor

Apply technical corrections to a chapter: French grammar, typography, terminology, formatting, and content enrichments — all bounded by the output-style from `<brief>/output-styles/`. Terminology reference comes from `<brief>/summary.md`.

## Inputs

- `<output>/chapters/chapter-<NN>.md` (required, positional) — path to the chapter to correct (e.g. `<output>/chapters/chapter-01.md`)
- `--brief <brief>` (required) — the brief directory (read-only); provides output-style, summary, and terminology
- `--remarks` (optional) — inline notes (string) OR path to a persona feedback file (e.g. `<output>/review/chapter-01-<persona>.md`)
- `--dry-run` (optional flag) — simulate corrections only, no file writes

## Outputs

```markdown
# 🩺 Doctor Report

**File:** <output>/chapters/chapter-01.md
**Type:** [novel/roleplaying]

## 📊 Summary
| Priority | Found | Fixed |
|----------|-------|-------|
| 🔴 Critical | X | X |
| 🟡 Important | X | X |
| 🟢 Optional | X | X |

## ✏️ Corrections Applied

**#1 - 🔴 Orthographe** (L.42)
- Before: `Le saidin est corrompu`
- After: `Le *saidin* est corrompu`
- Reason: terminology in summary.md → italics required

**#2 - 🟡 Typographie** (L.58)
- Before: `"Je ne peux pas", dit-il.`
- After: `« Je ne peux pas », dit-il.`
- Reason: French guillemets + non-breaking space

## 📁 Files
- Changelog: <output>/review/chapter-01-changelog.md (entry appended)
- Corrected: <output>/chapters/chapter-01.md
```

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. `<brief>/` is read-only.

1. Resolve the chapter path (positional) and `<brief>` (`--brief`) from `$ARGUMENTS`. If `<brief>/summary.md` is missing → ABORT and report the brief is incomplete.
2. Load `<brief>/summary.md` — extract: **type** (novel / roleplaying), consolidated terminology/lore, and any writing constraints.
3. Load the output-style from `<brief>/output-styles/` (the file referenced in the TOC entry for this chapter, or the only one present). This file is the guard-rail for all content additions.
4. **Parse `--remarks`**: if value ends with `.md` → it's a file path (typically `<output>/review/chapter-<NN>-<persona>.md`); load and parse its content. Else treat as inline string. Add all remarks as 🔴 Critical corrections to address.
5. **Cross-chapter redundancy scan** (chapters 02+): load previous chapters in `<output>/chapters/`, build NPC/term/disclaimer inventory. Flag re-described NPCs, re-translated terms, repeated disclaimers, identical GM advice as `[REDUNDANCY]` corrections.
6. **Scan text** by priority:
   - 🔴 Critical: orthography errors, missing accents (é è ê à â ù û ô î ï ç œ æ), terminology errors (vs `summary.md`).
   - 🟡 Important: French typography (« » — … non-breaking spaces), non-compliant Markdown format, non-compliant dialogue format.
   - 🟢 Optional: sentences > 40 words, repetitions, weak transitions.
7. **Generate correction list**: for each issue, format as `#N - [Priority] [Category] (L.XX) / Before: ... / After: ... / Reason: ...`
8. Apply corrections bounded by output-style guard-rails:
   - Any content addition MUST respect output-style tone, format, and density.
   - Any added content MUST be sourced from `summary.md` or `--remarks`; never invent content.
9. **If `--dry-run`**: display correction list only. No file writes.
10. **Else**: apply corrections to the chapter file. Create `<output>/review/` if absent. Append corrections to `<output>/review/chapter-<NN>-changelog.md` (cumulative; do NOT create `.bak` backup files). Output the Doctor Report.
11. Routing guidance: if the last `comment` run's consensus was ≤10/20 **or** ≥2 personas were capped at ≤11/20 → recommend `write --feedback` instead of iterating doctor (full condition: `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md` › Routes de triage — the consensus-alone branch fires even with only 1 persona evaluated).

## Test

After `doctor <output>/chapters/chapter-01.md --brief <brief>`, verify that `<output>/review/chapter-01-changelog.md` has an entry appended for today's date, and that the chapter file has been modified (or verify the dry-run report lists at least one correction without modifying the file).
