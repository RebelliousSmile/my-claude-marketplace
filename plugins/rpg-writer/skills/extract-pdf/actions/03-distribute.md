# 03 - Distribute

Session finale : fusionner le contenu classifié dans les fichiers de documentation univers, avec git stash/rollback.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `source_name` (required) — nom du PDF source sans extension (ex. `engrenages-regles`). Si plusieurs dossiers dans `docs/extraction/`, lister les dossiers disponibles et demander à l'utilisateur.

## Depends on

- `setup`, `process-chunk` (tous les chunks en statut `done`)

## Outputs

Fichiers de documentation univers mis à jour :
- `<univers-path>/.docs/UNIVERS.md` — enrichi avec le contenu lore
- `<univers-path>/.docs/terminologie.md` — enrichi avec la terminologie extraite
- `<univers-path>/.output-styles/<univers>-<source>.md` — créé avec les directives de style
- `docs/rules-files/<source>.md` — créé avec les règles extraites (destination à confirmer avec l'utilisateur)
- `.toc/INDEX.md` — créé/mis à jour avec la structure extraite

## Process

1. Lire `docs/extraction/<source-name>/progress.md`. Vérifier que **tous** les chunks sont `done`.
   - Si des chunks sont `pending` ou `failed` → STOP : "Chunks [liste] non traités."
2. **Résoudre les chemins** depuis `bank.yml` :
   - `document.univers` → slug (ex. `spire`)
   - `<univers-path>` = répertoire parent du CWD + slug : si CWD est `/workspace/spire/mon-roman/`, alors `<univers-path>` = `/workspace/spire`
   - Vérifier que `<univers-path>` existe. Sinon → STOP.
   - Tester si univers et projet partagent le même dépôt git :
     ```bash
     git -C "<univers-path>" rev-parse --show-toplevel
     git rev-parse --show-toplevel
     ```
     Si identiques → `same_repo = true` (un seul stash suffit).
3. Calculer la taille totale des `docs/extraction/<source-name>/classified/*.md`. Si > 80 000 chars → avertir, suggérer traitement par lot.
4. **Git stash** avant toute modification :
   ```bash
   git -C "<univers-path>" stash push -m "pre-extraction-<source-name>"
   # Si same_repo = false :
   git stash push -m "pre-extraction-<source-name>"
   ```
   > Si le dépôt n'a pas de changements non-commités, `git stash push` affiche "No local changes to save" (exit 0) — ne pas appeler `stash drop` en fin de session dans ce cas. Vérifier avec `git -C "<univers-path>" stash list | grep -q "pre-extraction-<source-name>"` avant chaque `stash drop`.
5. Charger et fusionner les fichiers classifiés (supprimer les marqueurs YAML, dédupliquer les sections).
6. Pour chaque catégorie, afficher un preview (500 chars) et **attendre l'approbation utilisateur** avant d'écrire.

   | Classified | Destination | Action |
   |------------|-------------|--------|
   | `lore*.md` | `<univers-path>/.docs/UNIVERS.md` | append |
   | `terminology*.md` | `<univers-path>/.docs/terminologie.md` | merge |
   | `style*.md` | `<univers-path>/.output-styles/<univers>-<source>.md` | create |
   | `rules*.md` | `docs/rules-files/<source>.md` (confirmer avec l'utilisateur) | create |
   | `structure*.md` | `.toc/INDEX.md` | create/update |
   | `templates*.md` | `<univers-path>/.templates/latex-patterns.md` | append |

7. Après validation utilisateur (`Y`) : écrire les fichiers, committer :
   ```bash
   # Si same_repo = true : un seul dépôt, ajouter univers + sous-dossiers projet
   git -C "<univers-path>" add .docs/ .output-styles/ .templates/ \
     "<projet>/.toc/" "<projet>/docs/rules-files/"
   git -C "<univers-path>" commit -m "Extract: <source-name>"
   git -C "<univers-path>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<univers-path>" stash drop
   # Si same_repo = false : deux dépôts distincts
   git -C "<univers-path>" add .docs/ .output-styles/ .templates/
   git -C "<univers-path>" commit -m "Extract: <source-name> (univers)"
   git -C "<univers-path>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<univers-path>" stash drop
   git add .toc/ docs/rules-files/
   git commit -m "Extract: <source-name> (project)"
   git stash list | grep -q "pre-extraction-<source-name>" && git stash drop
   ```
8. Si l'utilisateur choisit `n` (rollback) :
   ```bash
   # Si same_repo = true :
   git -C "<univers-path>" checkout . && git -C "<univers-path>" stash pop
   # Si same_repo = false :
   git -C "<univers-path>" checkout . && git -C "<univers-path>" stash pop
   git checkout . && git stash pop
   ```
9. Générer le rapport de distribution (voir prompt `extract-distribute.prompt.md`).
10. Nettoyage : supprimer `docs/extraction/<source-name>/chunks/`, `docs/extraction/<source-name>/raw/`, `docs/extraction/<source-name>/classified/`. Renommer `docs/extraction/<source-name>/progress.md` → `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md`.

## Test

Après `distribute <project_path> <source_name>` sur une extraction complète, vérifier que :
- `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md` existe (progress.md archivé)
- Au moins un fichier univers a été mis à jour
- Les dossiers `docs/extraction/<source-name>/chunks/`, `raw/`, `classified/` ont été supprimés
