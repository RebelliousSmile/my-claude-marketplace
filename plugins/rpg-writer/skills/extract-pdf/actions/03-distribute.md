# 03 - Distribute

Session finale : verser le contenu classifié dans les **sources de référence** de l'univers et du système, avec git stash/rollback.

> **Frontière** : `extract-pdf` écrit uniquement dans `sources/` — jamais dans `canon/` ni `mj/` directement.
> La ventilation vers `canon/` est assurée par `lore-extract` (lore) et `rules-keeper` (règles).
> Voir `@setup/references/vault-layout.md` pour la convention complète.

## Inputs

- `project_path` (required) — string, format `<jeu>/_ecrits/<projet>` (résolu depuis `<vault>/`)
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
2. **Résoudre les chemins** depuis `bank.yml` :
   - `document.univers` → slug (ex. `spire`)
   - `<jeu>` = premier segment sous `<vault>`, déduit du CWD (ex. si CWD = `<vault>/nadir/_ecrits/mon-roman/`, alors `<jeu>` = `<vault>/nadir/`)
   - `<univers-root>` = `<jeu>/_univers/<document.univers>/`
   - `<systeme-root>` = `<jeu>/_systeme/`
   - Vérifier que `<univers-root>` et `<systeme-root>` existent. Sinon → STOP avec le chemin manquant.
   - Tester si univers et projet partagent le même dépôt git :
     ```bash
     git -C "<univers-root>" rev-parse --show-toplevel
     git rev-parse --show-toplevel
     ```
     Si identiques → `same_repo = true` (un seul stash suffit).
3. Calculer la taille totale des `docs/extraction/<source-name>/classified/*.md`. Si > 80 000 chars → avertir, suggérer traitement par lot.
4. **Git stash** avant toute modification :
   ```bash
   git -C "<univers-root>" stash push -m "pre-extraction-<source-name>"
   # Si same_repo = false :
   git stash push -m "pre-extraction-<source-name>"
   ```
   > Si le dépôt n'a pas de changements non-commités, `git stash push` affiche "No local changes to save" (exit 0) — ne pas appeler `stash drop` en fin de session dans ce cas. Vérifier avec `git -C "<univers-root>" stash list | grep -q "pre-extraction-<source-name>"` avant chaque `stash drop`.
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

7. Après validation utilisateur (`Y`) : créer les dossiers `sources/<source-name>/` si absents, écrire les fichiers, committer :
   ```bash
   # Créer les dossiers destinations si nécessaire
   python -c "
   from pathlib import Path
   for d in ['<univers-root>/sources/<source-name>', '<systeme-root>/sources/<source-name>']:
       Path(d).mkdir(parents=True, exist_ok=True)
   "
   # Si same_repo = true : un seul dépôt — ajouter univers-root + systeme-root + toc projet
   git -C "<univers-root>" add \
     "sources/<source-name>/" \
     ".output-styles/" \
     ".templates/" \
     "<jeu>/_systeme/sources/<source-name>/" \
     "<projet>/.toc/"
   git -C "<univers-root>" commit -m "Extract sources: <source-name>"
   git -C "<univers-root>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<univers-root>" stash drop
   # Si same_repo = false : deux dépôts distincts
   git -C "<univers-root>" add "sources/<source-name>/" ".output-styles/" ".templates/"
   git -C "<univers-root>" commit -m "Extract sources: <source-name> (univers)"
   git -C "<univers-root>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<univers-root>" stash drop
   git -C "<systeme-root>" add "sources/<source-name>/"
   git -C "<systeme-root>" commit -m "Extract sources: <source-name> (systeme)"
   git add .toc/
   git commit -m "Extract sources: <source-name> (project)"
   git stash list | grep -q "pre-extraction-<source-name>" && git stash drop
   ```
8. Si l'utilisateur choisit `n` (rollback) :
   ```bash
   # Si same_repo = true :
   git -C "<univers-root>" checkout . && git -C "<univers-root>" stash pop
   # Si same_repo = false :
   git -C "<univers-root>" checkout . && git -C "<univers-root>" stash pop
   git checkout . && git stash pop
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

Après `distribute <project_path> <source_name>` sur une extraction complète, vérifier que :
- `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md` existe (progress.md archivé)
- `<univers-root>/sources/<source-name>/fulltext.md` existe et est non-vide (texte brut conservé)
- `<univers-root>/sources/<source-name>/lore.md` et/ou `terminology.md` ont été créés
- `<systeme-root>/sources/<source-name>/rules.md` a été créé (si des règles étaient présentes)
- Aucun fichier n'a été écrit dans `canon/` ni `mj/`
- Les dossiers `docs/extraction/<source-name>/chunks/`, `raw/`, `classified/` ont été supprimés
