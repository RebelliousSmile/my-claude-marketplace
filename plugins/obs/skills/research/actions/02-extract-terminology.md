# 02 - Extract Terminology

Distill terminology, proper nouns, and world-building elements from a domain's source documents into `<scope-root>/reference/terminologie.md`.

> Path variables & domain resolution: primary `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` (JDR profile in its § JDR profile).
> The domain `R` is **discovered locally** via the `obs:tree` anchor (walk up from the `<scope>`/source argument or CWD to a `Perso`/`Pro` segment; the subcategory below is `R`) — no global vault, no per-machine config. *(JDR profile: marker-based shortcut — walk up to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`.)*
> `extract-terminology` is a reference producer: its output lands in `<scope-root>/reference/terminologie.md`.
> **JDR profile:** target `<univers-root>/canon/terminologie.md` (= `R/_univers/<univers>/canon/terminologie.md`); under this profile it is the terminology-focused complement of the JDR feeder `ttrpg:lore-extract` (both write `canon/`; `ttrpg:lore-extract` remains the primary thematic ventilator for lore files).

## Inputs

- `scope` (required) — string, the shared bucket whose `reference/` receives the terminology (JDR profile: a `univers` name, e.g. `wot`, `shattered-city`)
- `source_files` (required) — one or more source file paths to analyze (e.g. `<scope-root>/sources/<source>/terminology.md`, extracted PDFs)

## Outputs

Appended or created `<scope-root>/reference/terminologie.md` (JDR profile: `<univers-root>/canon/terminologie.md`):

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

1. Load the source files from `$ARGUMENTS`. Resolve the domain `R` and detect whether the JDR profile applies (`profile: jdr` in `R/bank.yml`, or `_univers/`/`_systeme/` present) to know whether the target is `reference/` (generic) or `canon/` (JDR profile).
2. Load the existing `<scope-root>/reference/terminologie.md` (JDR profile: `<univers-root>/canon/terminologie.md`) if it exists (to avoid duplicates and preserve existing entries).
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
9. Write to `<scope-root>/reference/terminologie.md` (JDR profile: `<univers-root>/canon/terminologie.md`). Update the "Last updated" date.

## Test

After `extract-terminology <scope> <source-file>`, verify that `<scope-root>/reference/terminologie.md` (JDR profile: `<univers-root>/canon/terminologie.md`) has been created or updated with at least one term from the source file, and that the "Last updated" date reflects today.
