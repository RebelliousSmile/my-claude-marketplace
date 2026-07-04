# 01 - Generate TOC

Analyze the brief's `summary.md` and generate `<output>/toc/INDEX.md` — a complete table of contents with chapter synopses, key points, character tags, and output-style references.

## Inputs

- `<brief>` (required, positional) — the brief directory (read-only)
- `--out <output>` (required) — the output directory (created if absent)

## Outputs

```markdown
# Table des Matières : [Nom Projet]

**Type :** [roman / scénario / JDR / guide]

## Vue d'ensemble
[3-5 line global summary]

## Personnages principaux
- **[Nom]** : [rôle]

## Thèmes
- [thème 1]

## Structure
- **Acte I :** Chapitres 01-03 — [titre]

---

## Chapitres

### Chapitre 01 : [Titre]

**Personas :** [persona file(s) from <brief>/personas/, or empty]
**Output-style :** [filename from <brief>/output-styles/]

**Synopsis :** [2-3 sentences]

**Points clés :**
- [INTRO] First appearance of [Character] — full description
- [narrative point]
- [reveal or turning point]
```

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. `<brief>/` is read-only; `toc` reads only inside it. Output goes to `<output>/toc/`.

1. Resolve `<brief>` (positional) and `<output>` (`--out`) from `$ARGUMENTS`. If `<brief>/summary.md` is missing → ABORT and report that the brief is incomplete.
2. Load `<brief>/summary.md` — the autonomous brief. Extract: **type**, **language**, concept/synopsis, themes, characters, locations, narrative points, **and all consolidated lore/constraints** (mechanics, factions, terminology). Build a "constraints to distribute" list from it.
3. List `<brief>/personas/` (persona files) and `<brief>/output-styles/` (style files) to reference by filename in the INDEX. Do not read outside `<brief>/`.
4. If `summary.md` describes a **short-form** piece (single text, no chapter structure) → tell the user no TOC is needed and suggest `write <brief> --out <output>` directly. Stop.
5. Parse the brief: identify acts/parts/chapters/scenes structure.
6. **Propose the chapter breakdown to the user**: list proposed chapters with titles. Ask: "Does this structure work? Should any chapters be merged, split, or reordered?" Wait for confirmation before continuing.
7. If `<output>/toc/INDEX.md` **already exists**, this is a regeneration, not a first pass. Structure confirmation (step 6) is not consent to lose prior content: tell the user an `INDEX.md` is already present and ask explicitly whether to (a) overwrite it entirely, or (b) revise it in place, preserving the persona/output-style assignments and `[INTRO]`/`[REF]` tags of chapters the user isn't asking to change. Wait for this choice before writing anything.
8. Create `<output>/toc/` if it does not exist.
9. Generate `<output>/toc/INDEX.md`:
   - For each chapter: write `**Personas:**` (filenames from `<brief>/personas/`, if any), `**Output-style:**` (a filename from `<brief>/output-styles/`), `**Synopsis:**` (2–3 sentences), `**Points clés:**` (3–7 bullets).
   - Tag first appearances: `[INTRO]` for characters, concepts, and mechanics; `[REF ChXX]` in subsequent chapters.
   - Enrich key points with the constraints gathered in step 2 (mechanics/terms named in `summary.md` must surface in the relevant chapter).
10. Ask: "Would you like detailed spec files for any chapters? (`toc/chapter-<NN>.md` format)". If yes: delegate to `write-toc-chapter` for each requested chapter.
11. Report all created files and suggest: `write <brief> --out <output> --chapter 01` as next step.

## Test

After `generate-toc <brief> --out <output>`, verify that `<output>/toc/INDEX.md` exists, contains at least one `### Chapitre NN :` entry with a **Synopsis** and **Points clés** section, and that at least one `[INTRO]` tag is present.
