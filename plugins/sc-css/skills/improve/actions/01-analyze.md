# Action 01 — analyze

## Rôle

Identifier les zones d'amélioration CSS prioritaires, soit depuis un rapport audit existant, soit par inspection directe d'un fichier ou d'un répertoire ciblé.

## Procédure

1. **Source** : si un rapport audit (`aidd_docs/tasks/audits/*.md`) est disponible, lire ses findings. Sinon, inspecter les fichiers CSS/SCSS fournis.
2. **Prioriser** par impact/effort :
   - **P0** : `!important` dans les composants, sélecteurs ID dans les règles réutilisables — à corriger immédiatement.
   - **P1** : magic numbers identiques à > 3 occurrences (candidats custom property), code mort confirmé (aucun usage dans le HTML).
   - **P2** : opportunités cascade layers (si aucun `@layer` en place et > 20 fichiers CSS).
   - **P3** : modernisation syntaxique (`:is()`, nesting, container queries).
3. **Grouper par fichier cible** : regrouper les améliorations par fichier pour minimiser les allers-retours.
4. **Émettre la liste priorisée** en plain-text pour action 02.
