# 01 - Extract

Distribute a universe's reference sources into the canonical thematic files.

> **Position in the pipeline** : `lore-extract` consumes the raw reference sources produced by `extract-pdf` (`<univers-root>/sources/<source>/`) and distributes them to `<univers-root>/canon/` (or `mj/` with `--homemade`). It never reads PDFs directly and never writes to `sources/`.
> See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` for the full convention (local resolution of `R`, path variables).

## Inputs

- `sources` (required) — one or more file paths to process. Preferred format: `<univers-root>/sources/<source>/<fichier>.md` (output of `extract-pdf`). Raw files or personal notes are also accepted.
- `--update` (optional) — incremental mode: enriches existing files, skips sources already processed
- `--force` (optional) — regenerates all files even if they already exist
- `--homemade` (optional) — provenance: the sources are homemade/non-canonical. The output goes to the `mj/` subtree. By default (no flag), sources are treated as canonical → `canon/` subtree.

## Outputs

Paths resolved locally, relative to `R` (discovered domain — see Step 0), under the **provenance subtree** `canon/` (default) or `mj/` (`--homemade`) :
- `<univers-root>/<provenance>/terminologie.md` — always written
- One file per detected theme in the same provenance subtree

If `R` cannot be resolved (no `_campagnes/`, `_univers/` or `_pjs/` marker walking up): report it and offer to initialize `R`, or write into `<provenance>/` of the current directory with a warning.

> `<univers-root>` = `R/_univers/<univers>/` — `R` discovered by walking up to one of the markers `_campagnes/`, `_univers/` or `_pjs/` ; `<univers>` inferred from the source path (segment under `_univers/`) or asked from the user.

Templates for all themes: see `@references/templates-standard.md` and `@references/templates-optional.md`.

## Process

### Step 0 — Load context

1. **Determine provenance**: `--homemade` → `mj/` subtree (homemade/non-canon) ; otherwise → `canon/` subtree (default). If the provenance of a source is unclear, ask once before extracting; if a single source visibly mixes canonical and homemade material, split the extraction per provenance rather than dumping both into one subtree.
2. **Resolve the domain `R` locally** (never a global path). Start from the reference directory (the provided source path, otherwise CWD), walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/` : that folder is `R`.
   - Determine `<univers>` : if the sources are under `R/_univers/<univers>/`, the `<univers>` segment is inferred from it; otherwise, ask the user.
   - Resolve `<univers-root>` = `R/_univers/<univers>/`
   - Output root = `<univers-root>/<provenance>/` (`canon/` or `mj/`)
   - If no `_campagnes/`, `_univers/` or `_pjs/` marker is found walking up → the target is not inside an initialized JDR domain: report it and offer to initialize `R` (creation of `_univers/`), or write into `<provenance>/` of the current directory with a warning, then continue.
3. All source and output paths are resolved relative to `R` (or to the current directory as a fallback). Always verify the existence of a resolved path before reading/writing.
4. **If the sources come from `extract-pdf`** : they are located in `R/_univers/<univers>/sources/<source>/`. List the available files if no source is explicitly provided and offer a selection to the user.

### Step 1 — Validate sources

For each source file:
- [ ] File exists and is accessible
- [ ] File is not empty
- [ ] Encoding is readable (UTF-8 or convertible)

If `--update`: list existing `canon/` and `mj/` files, identify already-processed sources, process only new ones.

On error, report and ask: `Continuer avec les autres sources ? (oui/non)`

Print validation report (in French):
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

When two sources give conflicting information (prompt the user in French):

```
Contradiction détectée :

Source A ([file]) : "[information A]"
Source B ([file]) : "[information B]"

Sujet : [ex: date de fondation de la Guilde]
Fichier cible : [factions.md]

Quelle source fait autorité ? (A / B / fusionner / ignorer)
```

**Canon vs homemade:** in `--homemade` extraction, if the content contradicts an existing `canon/` entry, **canon is authoritative** — do not overwrite it. Report the divergence and write the homemade version into `mj/`, marking it as a variant (or ask for arbitration). An entity already present in `canon/` is not re-duplicated in `mj/`: the homemade note `[[links]]` the canon entry and only adds what differs.

### Step 7 — Preview before synthesis

Print the preview (in French):

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

Ask for arbitration (in French):

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

### Step 10 — Final report (in French)

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

Prochaine étape : rafraîchir le manifeste de ressources de R via `obs:tree` (cache `R/bank.yml`).
Renommer les sources traitées avec le suffixe `.processed`.
```

## Test

After `lore-extract <univers-root>/sources/<source>/lore.md`, verify that the terminology file has been created (or updated) at `<univers-root>/canon/terminologie.md` (default) or `<univers-root>/mj/terminologie.md` (with `--homemade`), contains a term table, and respects the 250-line limit. Canon and homemade content are never mixed in the same file. Input files in `<univers-root>/sources/<source>/` are never modified. If sources contain a contradiction (incl. homemade vs canon), verify that the user was prompted to arbitrate before writing.
