# 03 — Index

Crée un fichier d'index au niveau `<Subcategory>` qui organise les fichiers du répertoire par liens Obsidian (`[[wikilinks]]`). Le fichier d'index est un fichier de navigation, pas un fichier de contenu dupliqué.

## Inputs
- `path` (required) — répertoire source
- `group-by` (optional) — `thread` | `sender` | `date` | `type`. Défaut : `thread` pour des emails MD, `date` sinon.
- `output` (optional) — nom du fichier d'index. Défaut : `_index-<basename-of-path>.md` au niveau `<Subcategory>`.

## Outputs
- Fichier d'index au niveau `<Subcategory>` avec wikilinks vers les fichiers de `path`
- Optionnel : enrichissement du frontmatter de chaque fichier avec `summary:` (1-2 phrases) sur demande explicite

## Process
1. Résoudre le niveau `<Subcategory>` depuis `path` (règle T8 de SKILL.md).
2. Lister les fichiers dans `path` (ignorer les fichiers commençant par `_` et les répertoires commençant par `_`).
3. Extraire pour chaque fichier : titre (frontmatter > H1 > nom de fichier), date, tags, `subject_hash` si présent.
4. Regrouper selon `group-by` :
   - `thread` — grouper par `subject_hash` pour les emails ; par sujet textuel pour les autres
   - `sender` — grouper par champ `from`
   - `date` — grouper par semaine ou par jour selon la densité
   - `type` — grouper par extension ou par `email_type`
5. Construire le fichier d'index : un H2 par groupe, une ligne `- [[nom-de-fichier]] — description courte` par fichier.
6. Si l'utilisateur demande `--enrich` : ajouter `summary:` dans le frontmatter de chaque fichier source (1-2 phrases, non-destructif).
7. Écrire le fichier d'index dans `<Subcategory>/` ; si le fichier existe, ajouter un suffixe numérique.
8. Rapport : nb groupes, nb fichiers indexés, chemin de sortie.

## Test
Le fichier d'index existe dans `<Subcategory>/`, contient au moins un H2 et des lignes `[[...]]`, et n'a aucun contenu dupliqué des fichiers sources.
