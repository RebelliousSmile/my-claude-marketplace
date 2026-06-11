# 01 - Extract

Ventiler les sources de référence d'un univers vers les fichiers thématiques canoniques.

> **Position dans le pipeline** : `lore-extract` consomme les sources de référence brutes produites par `extract-pdf` (`<univers-root>/sources/<source>/`) et les ventile vers `<univers-root>/canon/` (ou `mj/` avec `--homemade`). Il ne lit jamais directement les PDF et n'écrit jamais dans `sources/`.
> Voir `@setup/references/vault-layout.md` pour la convention complète.

## Inputs

- `sources` (required) — un ou plusieurs chemins de fichiers à traiter. Format privilégié : `<univers-root>/sources/<source>/<fichier>.md` (output d'`extract-pdf`). Les fichiers raw ou notes personnelles sont aussi acceptés.
- `--update` (optional) — mode incrémental : enrichit les fichiers existants, ignore les sources déjà traitées
- `--force` (optional) — régénère tous les fichiers même s'ils existent déjà
- `--homemade` (optional) — provenance : les sources sont maison/non-canoniques. La sortie va dans le sous-arbre `mj/`. Par défaut (sans flag), les sources sont traitées comme canoniques → sous-arbre `canon/`.

## Outputs

Chemins résolus depuis `bank.yml` (répertoire courant), sous le **sous-arbre de provenance** `canon/` (défaut) ou `mj/` (`--homemade`) :
- `<univers-root>/<provenance>/terminologie.md` — toujours écrit
- Un fichier par thème détecté dans le même sous-arbre de provenance

Si `bank.yml` est absent : écrire dans `<provenance>/` dans le répertoire courant et avertir.

> `<univers-root>` = `<jeu>/_univers/<univers>/` — résolu depuis `bank.yml` (`document.univers`) et le premier segment du CWD sous `<vault>` (`<jeu>`).

Templates for all themes: see `@references/templates-standard.md` and `@references/templates-optional.md`.

## Process

### Step 0 — Load context

1. **Determine provenance**: `--homemade` → `mj/` subtree (homemade/non-canon) ; otherwise → `canon/` subtree (default). If the provenance of a source is unclear, ask once before extracting; if a single source visibly mixes canonical and homemade material, split the extraction per provenance rather than dumping both into one subtree.
2. Read `bank.yml` from the current directory.
   - Extract `document.univers` → universe slug
   - Resolve `<jeu>` = premier segment sous `<vault>` (`C:/Users/fxgui/Public/Notes/Perso/RPG/`), déduit du CWD ou de `bank.yml`
   - Resolve `<univers-root>` = `<jeu>/_univers/<document.univers>/`
   - Output root = `<univers-root>/<provenance>/` (`canon/` or `mj/`)
   - Extract `docs.terminologie` → overrides output path for terminology if present
   - Extract remaining `docs.*` paths → override output paths for other themes if present
   - If `bank.yml` absent → warn "bank.yml not found, outputs will go to `<provenance>/`", continue.
3. All source paths and output paths are resolved relative to the current directory (or as absolute by-game paths).
4. **Si les sources proviennent d'`extract-pdf`** : elles se trouvent dans `<univers-root>/sources/<source>/`. Lister les fichiers disponibles si aucune source n'est fournie explicitement et en proposer une sélection à l'utilisateur.

### Step 1 — Validate sources

For each source file:
- [ ] File exists and is accessible
- [ ] File is not empty
- [ ] Encoding is readable (UTF-8 or convertible)

If `--update`: list existing `canon/` and `mj/` files, identify already-processed sources, process only new ones.

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

**Canon vs maison :** en extraction `--homemade`, si le contenu contredit une entrée existante de `canon/`, **le canon fait autorité** — ne pas l'écraser. Signaler la divergence et écrire la version maison dans `mj/` en la marquant comme variante (ou demander arbitrage). Une entité déjà présente en `canon/` n'est pas redupliquée en `mj/` : la fiche maison `[[lie]]` l'entrée canon et n'ajoute que ce qui diffère.

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

After `lore-extract <univers-root>/sources/<source>/lore.md`, verify that the terminology file has been created (or updated) at `<univers-root>/canon/terminologie.md` (default) or `<univers-root>/mj/terminologie.md` (with `--homemade`), contains a term table, and respects the 250-line limit. Canon and homemade content are never mixed in the same file. Input files in `<univers-root>/sources/<source>/` are never modified. If sources contain a contradiction (incl. homemade vs canon), verify that the user was prompted to arbitrate before writing.
