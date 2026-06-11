# 01 - Analyze

Create a new output-style file for a universe from source documents (source mode), structured questionnaire (questionnaire mode), or a combination (hybrid mode).

## Inputs

- `univers` (required) — string, universe name (e.g. `wot`, `zombiology`)
- `source_files` (optional) — one or more source document paths to analyze
- `--only` (optional) — `novel` | `rules` | `scenario` — generate only one type
- `--extend` (optional flag) — enrich an existing style instead of replacing it

## Outputs

```markdown
# Output Style: [Univers] — [Type]

**Source:** [analyzed documents OR "Questionnaire"]
**Version:** 1.0

---

## Philosophie d'écriture
[Paragraph synthesizing the fundamental style]

### Principes fondamentaux
1. **[Principe 1]** — [justification]
2. **[Principe 2]** — [justification]

---

## Structure des sections
### Paragraphes explicatifs
[Description + real example]

### Listes (usage [limité/normal/fréquent])

### Tableaux

### Encadrés techniques

---

## Bon usage / Mauvais usage
### Bon usage
[Full example]
### Mauvais usage
[Counter-example with explanation]

---

## Conventions de formatage
### Typographie
[Rules — reference @references/typographie.md]
### Vocabulaire spécifique
### Dialogues et citations

---

## Exemples complets
### Exemple 1 : [Type]
[Content]

## Checklist
- [ ] [criterion 1]
```

Saved to: `<univers-root>/.output-styles/<univers>-<type>.md`

> Path variable: `<univers-root>` = `<jeu>/_univers/<univers>/`. See `setup/references/vault-layout.md`.

## Process

1. Check for existing styles in `<univers-root>/.output-styles/`. List them. If `--extend`, load the existing file before proceeding.
2. **Detect mode**:
   - Complete source files provided → MODE SOURCE (steps 2a–2c).
   - No source files → MODE QUESTIONNAIRE (step 3).
   - Partial source files → MODE HYBRID (source first, then targeted questionnaire for gaps).
3. **MODE SOURCE — 2a: Deep style analysis**: analyze writing philosophy first (paragraph structure, prose/list ratio, paragraphs per concept, didactic tone), then formatting conventions (atmosphere, register, vocabulary, typography, technical enclosures). Extract 3+ real examples: one explanatory paragraph, one technical section, one atmospheric passage.
4. **MODE SOURCE — 2b**: Generate "Good usage" and "Bad usage" comparison examples from the real text.
5. **MODE QUESTIONNAIRE — step 3**: ask up to 15 questions across: genre/tone identity (4 questions) → writing structure (4 questions) → formatting conventions (4 questions) → co-constructed examples (3 questions). Co-build examples with the user after each batch.
6. **MODE HYBRID**: execute steps 2a–2b on available sources, identify gaps, ask only the questionnaire questions that cover missing areas.
7. **Generate output-style file** using the schema in Outputs above. All examples must be drawn from the real source or co-constructed with the user — never generic placeholders.
8. **Validate**: compare generated style characteristics against source (source mode) or present for user confirmation (questionnaire mode). Adjust if needed.
9. Write to `<univers-root>/.output-styles/<univers>-<type>.md`. Update `bank.yml > output-style.<type>` to point to the new file.
10. Report: file created, version, metrics (prose/list ratio, paragraphs per concept, example count), bank.yml field updated.

## Test

After `analyze <univers>`, verify that `<univers-root>/.output-styles/<univers>-novel.md` (or the requested type) exists, contains a non-empty "Philosophie d'écriture" section and at least one real example, and that `bank.yml > output-style` is updated.
