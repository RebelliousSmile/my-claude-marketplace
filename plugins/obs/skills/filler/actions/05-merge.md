# 04 — Merge

## Inputs
- `path` (required) — répertoire source
- `glob` (optional) — filtre (ex. `2024-*.md`). Défaut : tous les fichiers `.md`.
- `order` (optional) — `date` | `alpha` | `manual`. Défaut : `date`.
- `output` (optional) — nom du fichier de sortie. Défaut : `_merged.md` au niveau `<Subcategory>`.

## Outputs
- Fichier consolidé unique avec table des matières dans `<Subcategory>/`

## Process
1. Résoudre le niveau `<Subcategory>` depuis `path` (règle T8 de SKILL.md).
2. Lister et filtrer les fichiers correspondant à `glob`.
3. Trier selon `order` ; pour `manual`, afficher la liste et demander à l'utilisateur de valider l'ordre.
4. Construire la TOC : une entrée par fichier source (titre + nom de fichier original).
5. Concaténer : bloc TOC, puis pour chaque fichier — en-tête H2 (titre), règle horizontale, corps du contenu.
6. Créer `<Subcategory>/` si nécessaire. Écrire dans `output` ; si le fichier existe déjà, ajouter un suffixe numérique.
7. Rapport : liste des fichiers dans l'ordre de fusion, chemin de sortie, word count total.

## Test
`<Subcategory>/_merged.md` existe, contient un bloc TOC, et son word count est égal à la somme des word counts des fichiers sources (±5 % pour le formatage).
