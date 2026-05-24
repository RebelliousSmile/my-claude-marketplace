# 02 - Extract Terminology

Distill terminology, proper nouns, and world-building elements from universe source documents into a canonical `terminologie.md`.

## Inputs

- `univers` (required) — string, universe name (e.g. `wot`, `archipels`)
- `source_files` (required) — one or more source file paths to analyze (e.g. extracted PDFs, lore documents)

## Outputs

Appended or created `<univers>/.docs/terminologie.md`:

```markdown
# Terminologie : [Univers]

**Last updated:** YYYY-MM-DD
**Sources:** [list of source files]

---

## Noms Propres — Personnages

| Terme | Romanisation | Description | Première apparition |
|-------|-------------|-------------|---------------------|
| [Name] | [romaji if applicable] | [1-line description] | [source, page/section] |

## Noms Propres — Lieux

## Organisations et Factions

## Concepts et Mécaniques

| Terme | Définition | Usage en texte | Source |
|-------|-----------|----------------|--------|
| *saidin* | Pouvoir masculin de la Vraie Source | Italique, toujours | [source] |

## Termes Étrangers

| Terme | Langue | Traduction | Format recommandé |
|-------|--------|-----------|-------------------|
| *oni* | Japonais | Démon | Italique + traduction à la 1ère occurrence |
```

## Process

1. Load the source files from `$ARGUMENTS`.
2. Load the existing `<univers>/.docs/terminologie.md` if it exists (to avoid duplicates and preserve existing entries).
3. **Pass 1 — Scan for proper nouns**: extract all capitalized terms, italicized terms, foreign-language words. Build a raw candidate list.
4. **Pass 2 — Classify** each candidate:
   - Characters → "Personnages" section
   - Locations → "Lieux" section
   - Organizations/factions → "Organisations" section
   - Concepts, mechanics, powers → "Concepts" section
   - Foreign-language terms → "Termes Étrangers" section
5. **Pass 3 — Define**: for each term, extract the definition/description from the source. Note first appearance (file + section/page).
6. **Merge with existing terminologie.md**: for terms already present → update if new info found; for new terms → append. Never delete existing entries unless the user requests it.
7. Determine recommended text format: italics for untranslated foreign terms, no italics for proper nouns. Add "Format recommandé" column for the "Termes Étrangers" section.
8. Present the new/updated entries to the user: "Found N new terms, updated M. Confirm to save?"
9. Write to `<univers>/.docs/terminologie.md`. Update the "Last updated" date.

## Test

After `extract-terminology <univers> <source-file>`, verify that `<univers>/.docs/terminologie.md` has been created or updated with at least one term from the source file, and that the "Last updated" date reflects today.
