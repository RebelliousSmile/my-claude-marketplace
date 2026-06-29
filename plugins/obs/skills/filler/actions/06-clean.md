# 06 — Clean

## Inputs
- `path` (required) — répertoire cible
- `criteria` (optional) — flags séparés par virgule : `empty`, `duplicate`, `old:<YYYY-MM-DD>`, `orphan`. Défaut : `empty,duplicate`.

## Outputs
- Plan de suppression / archivage (affiché avant exécution)
- Fichiers supprimés ou déplacés dans `<Subcategory>/_archive/`

## Process
1. Résoudre le niveau `<Subcategory>` depuis `path` (règle T8 de SKILL.md).
2. Exécuter survey (ou réutiliser) pour identifier les fichiers flagués.
3. Filtrer selon `criteria` :
   - `empty` — fichiers avec moins de 50 mots
   - `duplicate` — fichiers avec titres quasi-identiques ou premier paragraphe similaire
   - `old:<date>` — fichiers dont la date de dernière modification est antérieure à la date donnée
   - `orphan` — fichiers sans métadonnée exploitable et sans référence vers ou depuis d'autres fichiers
4. Afficher la liste des candidats avec la raison pour chaque fichier.
5. Supprimer directement par défaut. Si l'utilisateur veut conserver une trace, déplacer dans `<Subcategory>/_archive/` sur demande explicite seulement.
6. Attendre confirmation, puis exécuter.
7. Rapport : nb supprimés, nb archivés, nb ignorés.

## Test
Après clean, aucun fichier correspondant aux critères donnés ne reste dans `path` (hors `<Subcategory>/_archive/`).
