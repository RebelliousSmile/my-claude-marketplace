# 03 - Distribute

Session finale : verser le contenu classifié dans les **sources de référence** de l'univers et du système, avec git stash/rollback.

> **Frontière** : `extract-pdf` écrit uniquement dans `sources/` — jamais dans `canon/` ni `mj/` directement.
> La ventilation vers `canon/` est assurée par `lore-extract` (lore) et `rules-keeper` (règles).
> Voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` pour la convention complète.

## Inputs

- `project_dir` (required) — répertoire du projet d'écriture (`R/<AAAA>/<MM>/<projet>/`), ou tout répertoire sous le domaine `R`. `R` découvert par remontée jusqu'à l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`.
- `source_name` (required) — nom du PDF source sans extension (ex. `engrenages-regles`). Si plusieurs dossiers dans `docs/extraction/`, lister les dossiers disponibles et demander à l'utilisateur.

## Depends on

- `setup`, `process-chunk` (tous les chunks en statut `done`)

## Outputs

Sources de référence créées ou enrichies :
- `<univers-root>/sources/<source>/fulltext.md` — **texte brut intégral** normalisé (le « contenu de l'extraction » ; assemblé depuis les chunks, conservé)
- `<univers-root>/sources/<source>/lore.md` — contenu narratif de référence (bundle d'entrée pour `lore-extract`)
- `<univers-root>/sources/<source>/terminology.md` — terminologie extraite (bundle d'entrée pour `lore-extract`)
- `<systeme-root>/sources/<source>/fulltext.md` — texte brut intégral (si des règles ont été extraites)
- `<systeme-root>/sources/<source>/rules.md` — règles extraites (bundle d'entrée pour `rules-keeper`)
- `<univers-root>/.output-styles/<univers>-<source>.md` — directives de style (artefact de commodité)
- `.toc/INDEX.md` — structure extraite (artefact de commodité, dans le projet)

## Process

1. Lire `docs/extraction/<source-name>/progress.md`. Vérifier que **tous** les chunks sont `done`.
   - Si des chunks sont `pending` ou `failed` → STOP : "Chunks [liste] non traités."
2. **Résoudre les chemins localement** :
   - `<univers>` = slug lu dans `progress.md#Univers` (ex. `spire`).
   - **Découvrir `R`** : partir du répertoire de référence (`<project_dir>` ou CWD), remonter les parents jusqu'au premier dossier contenant l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`. Ce dossier est `R`.
   - `<univers-root>` = `R/_univers/<univers>/`
   - `<systeme-root>` = `R/_systeme/`
   - Vérifier que `<univers-root>` et `<systeme-root>` existent. Sinon → STOP avec le chemin manquant.
   - `R` est un répertoire autonome : univers, système et projet vivent tous sous `R`, donc dans le **même dépôt** — un seul stash suffit. Si `R` n'est pas versionné, sauter les étapes git.
3. Calculer la taille totale des `docs/extraction/<source-name>/classified/*.md`. Si > 80 000 chars → avertir, suggérer traitement par lot.
4. **Git stash** avant toute modification (un seul dépôt = `R`) :
   ```bash
   git -C "<R>" stash push -m "pre-extraction-<source-name>"
   ```
   > Si le dépôt n'a pas de changements non-commités, `git stash push` affiche "No local changes to save" (exit 0) — ne pas appeler `stash drop` en fin de session dans ce cas. Vérifier avec `git -C "<R>" stash list | grep -q "pre-extraction-<source-name>"` avant chaque `stash drop`.
5. Charger et fusionner les fichiers classifiés (supprimer les marqueurs YAML, dédupliquer les sections).
6. Pour chaque catégorie, afficher un preview (500 chars) et **attendre l'approbation utilisateur** avant d'écrire.

   | Classified | Destination | Action |
   |------------|-------------|--------|
   | `raw/chunk_*.txt` (assemblés) | `<univers-root>/sources/<source-name>/fulltext.md` (+ `<systeme-root>/…` si règles) | create — **brut intégral, ne jamais jeter** |
   | `lore*.md` | `<univers-root>/sources/<source-name>/lore.md` | create/append |
   | `terminology*.md` | `<univers-root>/sources/<source-name>/terminology.md` | create/merge |
   | `rules*.md` | `<systeme-root>/sources/<source-name>/rules.md` | create/append |
   | `style*.md` | `<univers-root>/.output-styles/<univers>-<source-name>.md` | create |
   | `structure*.md` | `.toc/INDEX.md` | create/update |
   | `templates*.md` | `<univers-root>/.templates/latex-patterns.md` | append |

   > Lore et terminologie → `<univers-root>/sources/<source-name>/` (référence univers).
   > Règles → `<systeme-root>/sources/<source-name>/` (référence système).
   > Ne jamais écrire dans `canon/` ni `mj/` — c'est le rôle de `lore-extract` et `rules-keeper`.

7. Après validation utilisateur (`Y`) : créer les dossiers `sources/<source-name>/` si absents, écrire les fichiers, committer (un seul dépôt = `R`) :
   ```bash
   # Créer les dossiers destinations si nécessaire
   python -c "
   from pathlib import Path
   for d in ['<univers-root>/sources/<source-name>', '<systeme-root>/sources/<source-name>']:
       Path(d).mkdir(parents=True, exist_ok=True)
   "
   # Un seul dépôt R — chemins relatifs à R : _univers/<univers>/, _systeme/, et le .toc du projet
   git -C "<R>" add \
     "_univers/<univers>/sources/<source-name>/" \
     "_univers/<univers>/.output-styles/" \
     "_univers/<univers>/.templates/" \
     "_systeme/sources/<source-name>/" \
     "<project_dir>/.toc/"
   git -C "<R>" commit -m "Extract sources: <source-name>"
   git -C "<R>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<R>" stash drop
   ```
8. Si l'utilisateur choisit `n` (rollback) :
   ```bash
   git -C "<R>" checkout . && git -C "<R>" stash pop
   ```
9. Générer le rapport de distribution (voir prompt `extract-distribute.prompt.md`).
10. Nettoyage — **conserver le brut d'abord** :
    1. Assembler le texte brut normalisé des chunks (`docs/extraction/<source-name>/raw/chunk_*.txt`, dans l'ordre) en un seul `fulltext.md` (avec un en-tête de provenance) et l'écrire dans chaque `sources/<source-name>/` peuplé — `<univers-root>/sources/<source-name>/fulltext.md`, et `<systeme-root>/sources/<source-name>/fulltext.md` si des règles ont été extraites.
    2. **Seulement après** que `fulltext.md` est écrit : supprimer le dossier de travail `docs/extraction/<source-name>/chunks/`, `…/raw/`, `…/classified/` (les bundles classifiés ont été fusionnés dans `sources/`).
    3. Renommer `docs/extraction/<source-name>/progress.md` → `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md`.

    > Ne jamais supprimer `raw/` sans avoir d'abord écrit `fulltext.md` : c'est l'unique copie verbatim du document.

## Prochaines étapes (suggérer à l'utilisateur)

Une fois les sources créées, lancer la ventilation vers canon :
- **Lore** : `lore-extract <univers-root>/sources/<source-name>/lore.md` → alimente `<univers-root>/canon/`
- **Règles** : `rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md` → alimente `<systeme-root>/canon/`

## Test

Après `distribute <project_dir> <source_name>` sur une extraction complète, vérifier que :
- `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md` existe (progress.md archivé)
- `<univers-root>/sources/<source-name>/fulltext.md` existe et est non-vide (texte brut conservé)
- `<univers-root>/sources/<source-name>/lore.md` et/ou `terminology.md` ont été créés
- `<systeme-root>/sources/<source-name>/rules.md` a été créé (si des règles étaient présentes)
- Aucun fichier n'a été écrit dans `canon/` ni `mj/`
- Les dossiers `docs/extraction/<source-name>/chunks/`, `raw/`, `classified/` ont été supprimés
