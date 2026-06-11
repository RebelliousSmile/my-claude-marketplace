# 01 - Generate TOC

Analyze a source document and generate `.toc/INDEX.md` — a complete table of contents with chapter synopses, key points, character tags, and output-style references.

## Inputs

- `source_file` (required) — path to the source document (overview.md, synopsis, notes, extraction output)
- `bank_yml` (required) — `bank.yml` at project root (auto-loaded)

## Outputs

```markdown
# Table des Matières : [Nom Projet]

**Type :** [novel/scenario/roleplaying/guide]
**Univers :** [univers]

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

**Personas :** [persona-id(s) from bank.yml, or empty]
**Output-style :** [filename.md from bank.yml]

**Synopsis :** [2-3 sentences]

**Points clés :**
- [INTRO] First appearance of [Character] — full description
- [narrative point]
- [reveal or turning point]
```

## Process

> Path variables: `<univers-root>` = `<jeu>/_univers/<univers>/`, `<projet-root>` = `<jeu>/_ecrits/<projet>/`, `<systeme-root>` = `<jeu>/_systeme/`. See `setup/references/vault-layout.md`.

1. Load the source document from `$ARGUMENTS` (typically inside `<projet-root>`).
2. Load `bank.yml`: extract `document.type`, `univers`, `output-style`, `docs`, `rules-files`, `personas`.
3. Load the overview file from the path declared in `bank.yml > overview:` (if it exists and differs from source).
4. Cross-reference documentation: load ALL files declared in `bank.yml` sections `docs` and `rules-files`. Universe docs span both `<univers-root>/canon/` (official lore) and `<univers-root>/mj/` (MJ additions). Rules-files resolve under `<systeme-root>/`. Build a "constraints to distribute" list: mechanical rules, characters, factions, terminology.
5. Parse the source: identify acts/parts/chapters/scenes structure. Extract: themes, characters, locations, narrative points.
6. **Propose the chapter breakdown to the user**: list proposed chapters with titles. Ask: "Does this structure work? Should any chapters be merged, split, or reordered?" Wait for confirmation before continuing.
7. Create `.toc/` directory if it does not exist.
8. Generate `.toc/INDEX.md`:
   - For each chapter: write `**Personas:**` (from bank.yml if declared), `**Output-style:**` (from bank.yml), `**Synopsis:**` (2–3 sentences), `**Points clés:**` (3–7 bullets).
   - Tag first appearances: `[INTRO]` for characters, concepts, and mechanics; `[REF ChXX]` in subsequent chapters.
   - Enrich key points with constraints from step 4 (e.g., if rules-files define specific mechanics, the relevant chapter must mention them by name).
9. Ask: "Would you like detailed spec files for any chapters? (toc-chapter<NN>.md format)". If yes: delegate to `write-toc-chapter` for each requested chapter.
10. Report all created files and suggest: `write write-novel <chapter-number>` as next step.

## Test

After `generate-toc <source>`, verify that `.toc/INDEX.md` exists, contains at least one `### Chapitre NN :` entry with a **Synopsis** and **Points clés** section, and that at least one `[INTRO]` tag is present.
