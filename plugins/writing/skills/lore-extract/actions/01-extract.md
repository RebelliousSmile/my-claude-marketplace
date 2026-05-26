# 01 - Extract

Transform raw source files into structured thematic `.docs/` files for a universe project.

## Inputs

- `sources` (required) — one or more file paths to process (relative to current directory)
- `--update` (optional) — incremental mode: enrich existing files, skip already-processed sources
- `--force` (optional) — regenerate all files even if they already exist

## Outputs

Paths resolved from `bank.yml` (current directory):
- `bank.yml#docs.terminologie` — always written
- One file per detected theme alongside `terminologie` in the same `.docs/` directory

If `bank.yml` is absent: write to `.docs/` in the current directory and warn.

Templates for all themes: see `@references/templates-standard.md` and `@references/templates-optional.md`.

## Process

### Step 0 — Load context

1. Read `bank.yml` from the current directory.
   - Extract `document.univers` → universe slug
   - Extract `docs.terminologie` → output path for terminology
   - Extract remaining `docs.*` paths → output paths for other themes
   - If `bank.yml` absent → warn "bank.yml not found, outputs will go to .docs/", continue.
2. All source paths and output paths are resolved relative to the current directory.

### Step 1 — Validate sources

For each source file:
- [ ] File exists and is accessible
- [ ] File is not empty
- [ ] Encoding is readable (UTF-8 or convertible)

If `--update`: list existing `.docs/` files, identify already-processed sources, process only new ones.

On error, report and ask: `Continuer avec les autres sources ? (oui/non)`

Print validation report:
```
Sources validées : [N]/[total]
Volume total estimé : ~[X] lignes
Langues détectées : [liste]
Mode : [création / mise à jour]
Fichiers existants : [liste if --update]
```

### Step 2 — Read and analyze sources

Read all validated files. Note:
- Total volume
- Quality (structured vs. raw)
- Main language

**Multilingual handling:** target language is French. Universe-specific terms: keep original in parentheses on first mention. Ex: `Le Pouvoir Unique (*One Power*) permet de canaliser…`

### Step 3 — Detect themes

For each standard theme, evaluate: present (yes/no), estimated volume (low <50 / medium 50-150 / high >150), relevance.

**Custom theme:** propose one if content doesn't fit any standard theme AND volume > 50 lines.

### Step 4 — Validate themes with user

```
Thèmes détectés dans les sources :

| Thème        | Présent | Volume   | Priorité | Recommandation |
|--------------|---------|----------|----------|----------------|
| terminologie | oui     | moyen    | 1        | Obligatoire    |
| factions     | oui     | important| 2        | Recommandé     |
| personnages  | oui     | moyen    | 3        | Recommandé     |
| histoire     | oui     | important| 4        | Recommandé     |
| geographie   | oui     | faible   | 5        | Optionnel      |
| [custom]     | oui     | moyen    | 6        | Proposé        |

Valides-tu cette liste ? (oui / modifier)
```

### Step 5 — Extract by theme (in priority order)

**Keep (high priority):**
1. Proper names, universe-unique terms
2. Relations between entities (alliances, conflicts, hierarchies)
3. Dates and structuring events
4. Universe laws and rules (magic, physics, social)
5. Important nuances and exceptions

**Cut if needed (low priority):**
1. Redundant descriptions
2. Atmospheric details without narrative impact
3. Multiple examples of the same concept (keep 1-2)
4. Generic flavor text
5. Meta-information (page numbers, editorial references)

**Cross-file deduplication rule:**

| Information | Primary file | Secondary mention |
|-------------|-------------|-------------------|
| Faction founding | histoire.md | factions.md (date only) |
| NPC residence | personnages.md | géographie.md (inhabitants list) |
| Event involving faction | histoire.md | factions.md (consequences) |
| Technical term | terminologie.md | Never duplicated |

### Step 6 — Detect contradictions

When two sources give conflicting information:

```
Contradiction détectée :

Source A ([file]) : "[information A]"
Source B ([file]) : "[information B]"

Sujet : [ex: date de fondation de la Guilde]
Fichier cible : [factions.md]

Quelle source fait autorité ? (A / B / fusionner / ignorer)
```

### Step 7 — Preview before synthesis

```
Extraction brute terminée :

| Fichier       | Lignes | Statut        | Priorité |
|---------------|--------|---------------|----------|
| terminologie  | 120    | OK            | 1        |
| factions      | 280    | DÉPASSE (+30) | 2        |
| histoire      | 310    | DÉPASSE (+60) | 4        |

Fichiers à synthétiser : factions.md, histoire.md
Ordre : factions.md (priorité 2), puis histoire.md (priorité 4)

Continuer vers la synthèse ? (oui / voir détails [fichier])
```

### Step 8 — Synthesize oversized files

For each file > 250 lines (in priority order):

**Auto-synthesize if:**
- Reduction possible > 20% by merging redundancies
- No major named entity suppressed
- No key relations lost

Auto actions: merge redundant descriptions, reduce multiple examples to 1-2, remove meta-info, move duplicates to primary file.

**Request human arbitration if:**
- Auto-synthesis insufficient (reduction < 20%)
- More than 3 named entities would be removed
- Key relations would be lost

```
Le fichier [thème].md dépasse 250 lignes (actuellement [N] lignes).
Synthèse automatique : -[X] lignes (insuffisant, besoin -[Y] total)

Je dois choisir quoi retirer. Options :

1. [Option A] — Perte : [entities/relations affected]
2. [Option B] — Perte : [entities/relations affected]
3. [Option C] — Perte : [entities/relations affected]

Que préfères-tu ? (1 / 2 / 3 / autre suggestion)
```

### Step 9 — Write files

Use templates from `@references/templates-standard.md` (terminologie, histoire, factions, géographie, personnages) and `@references/templates-optional.md` (magie, technologie, créatures, religions, économie).

Each file ends with a metadata block:
```markdown
---
**Lignes:** [N]/250
**Sources:** [file list]
**Màj:** [date]
```

If `--update`, also add:
```markdown
**Historique:**
- [date1] : Création depuis [sources]
- [date2] : Ajout depuis [nouvelles sources]
```

### Step 10 — Final report

```
Extraction terminée pour [univers].

Fichiers générés/mis à jour :
- terminologie.md ([N] lignes) ✓
- factions.md ([N] lignes) ✓
- histoire.md ([N] lignes) ✓
- ...

Total : [X] fichiers, [Y] lignes
Mode : [création / mise à jour]
Arbitrages effectués : [N]
Contradictions résolues : [N]
Sources traitées : [liste]

Prochaine étape : Mettre à jour bank.yml pour référencer ces fichiers.
Renommer les sources traitées avec le suffixe `.processed`.
```

## Test

After `lore-extract <univers> <source>`, verify that `<univers>/.docs/terminologie.md` has been created (or updated), contains a term table, and respects the 250-line limit. If sources contain a contradiction, verify that the user was prompted to arbitrate before writing.
