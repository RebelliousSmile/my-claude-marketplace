# 02 - Doctor

Apply technical corrections to a chapter: French grammar, typography, terminology, formatting, and content enrichments — all bounded by the output-style.

## Inputs

- `chapter_file` (required) — path to the chapter to correct (e.g. `chapitres/chapitre01.md`)
- `--remarks` (optional) — inline notes (string) OR path to a `.md` remarks file (e.g. `.wip/coherence/remarks-chapitre01.md` or `.wip/comments/chapitre01-personas.md`)
- `--dry-run` (optional flag) — simulate corrections only, no file writes

## Outputs

```markdown
# 🩺 Doctor Report

**File:** chapitres/chapitre01.md
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
- Reason: WoT terminology → italics required

**#2 - 🟡 Typographie** (L.58)
- Before: `"Je ne peux pas", dit-il.`
- After: `« Je ne peux pas », dit-il.`
- Reason: French guillemets + non-breaking space

## 📁 Files
- Changelog: .wip/changelog/chapitre01-changelog.md (entry appended)
- Corrected: chapitres/chapitre01.md
```

## Process

1. Load all resources in order: `bank.yml` → `.toc/toc-chapter<NN>.md` (extract output-style filename) → output-style file → `terminologie.md` → `UNIVERS.md` → chapter file → `--remarks` (if provided).
2. **Identify document type** (novel / roleplaying) from bank.yml.
3. **Parse `--remarks`**: if value ends with `.md` or starts with `.wip/` → it's a file path; load and parse its content. Else treat as inline string. Add all remarks as 🔴 Critical corrections.
4. **Cross-chapter redundancy scan** (chapters 02+): load previous chapters, build NPC/term/disclaimer inventory. Flag re-described NPCs, re-translated terms, repeated disclaimers, identical GM advice as `[REDUNDANCY]` corrections.
5. **Scan text** by priority:
   - 🔴 Critical: orthography errors, missing accents (é è ê ê à â ù û ô î ï ç œ æ), terminology errors (vs terminologie.md).
   - 🟡 Important: French typography (« » — … non-breaking spaces), non-compliant Markdown format, non-compliant dialogue format.
   - 🟢 Optional: sentences > 40 words, repetitions, weak transitions.
6. **Generate correction list**: for each issue, format as `#N - [Priority] [Category] (L.XX) / Before: ... / After: ... / Reason: ...`
7. Apply corrections bounded by output-style guard-rails:
   - Any content addition MUST respect output-style tone, format, and density.
   - Any added content MUST be sourced from TOC, terminologie.md, UNIVERS.md, or `--remarks`.
8. **If `--dry-run`**: display correction list only. No file writes.
9. **Else**: apply corrections to chapter file. Append corrections to `.wip/changelog/chapitre<NN>-changelog.md` (cumulative; do NOT create `.bak` backup files). Output the Doctor Report.
10. Routing guidance: if ≥2 personas were capped at ≤11/20 (from the last comment run) → recommend `write --feedback` instead of iterating doctor.

## Test

After `doctor chapitres/chapitre01.md`, verify that `.wip/changelog/chapitre01-changelog.md` has an entry appended for today's date, and that the chapter file has been modified (or verify the dry-run report lists at least one correction without modifying the file).
