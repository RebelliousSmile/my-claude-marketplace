# Action 01 — scan

## Rôle

Identifier tous les patterns CSS legacy dans les fichiers du projet et produire un inventaire groupé par type.

## Procédure

1. Lister les fichiers `**/*.css`, `**/*.scss`, `**/*.less` (exclure `node_modules`, `dist/`).
2. Pour chaque pattern legacy défini dans le SKILL.md, grep les occurrences.
3. Grouper par type de pattern, trier par fréquence décroissante.
4. Évaluer l'effort de migration total (xs/s/m/l) et signaler les patterns qui demandent une attention particulière (ex. `float` sur une grille complexe → effort L).

## Output

```
LEGACY CSS — inventaire

float/clearfix          : 23 occurrences (14 fichiers) — effort M
vendor prefixes         : 47 occurrences (-webkit-:31, -moz-:16) — effort XS
px typo                 : 156 occurrences — effort S
variables SCSS $var     : 89 variables déclarées, 412 usages — effort M
IE hacks                : 3 occurrences — effort XS
```
Total effort estimé : 3-5 jours. Recommandation : commencer par vendor prefixes (gain immédiat, effort XS), puis px typo, puis float.
