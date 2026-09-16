# sc-css

*Knowledge provider pour la couche CSS pure : détection d'architecture, audit, modernisation et enseignement.*

Détecte l'architecture CSS du projet (BEM, utility-first, CSS Modules, ITCSS), le préprocesseur et l'usage des couches de cascade, puis conduit l'audit et les migrations à partir de ce constat. Le savoir est porté par les actions elles-mêmes : le plugin n'installe aucun fichier de règle dans le projet.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-css:sniff` | Détecte l'architecture CSS (BEM, utility-first, CSS Modules, ITCSS), le préprocesseur (PostCSS, Sass/SCSS, Less, vanilla), l'outillage de lint (Stylelint, Biome), l'usage des cascade layers et l'adoption des custom properties — émet un pivot manifeste JSON décrivant l'état mesuré, à lire avant `audit`, `improve` ou `legacy` |
| `audit` | `/sc-css:audit` | Audit multi-dimensionnel read-only : spécificité (guerres de cascade), code mort (sélecteurs inutilisés, règles inaccessibles), magic numbers, couverture a11y (contrastes, focus visible, réduction de mouvement), opportunités modernes (`has()`, container queries, nesting, subgrid) |
| `improve` | `/sc-css:improve` | Amélioration ciblée de l'architecture existante — extraction vers custom properties, organisation en cascade layers, réduction de spécificité, modernisation syntaxique. Propose un plan avant d'éditer |
| `legacy` | `/sc-css:legacy` | Migration vers les standards modernes — float/clearfix → flex/grid, px → rem/em, préfixes vendor → standard, variables Sass/Less → custom properties CSS natives, hacks IE/Edge classiques → standards |
| `teach` | `/sc-css:teach` | Explique les concepts CSS en contexte du codebase courant (spécificité, cascade, custom properties, cascade layers, `has()`/`is()`/`where()`, container queries, nesting). Read-only |
| `design-bridge` | `/sc-css:design-bridge` | Réceptacle du pivot design pour la couche CSS pure — reçoit le contrat (`tokens.json` + `components.json`) et produit des custom properties CSS (`tokens` → `:root`) et des stylesheets de composants BEM sous cascade layers. Jamais invoqué directement, appelé via `design:enforce`/`design:diffuse` quand la stack est CSS pure |
| `cd` | `/sc-css:cd local\|server\|automata` | Build, preview et livraison d'un site statique pur. Dans une application composite, sc-css contribue seulement aux assets et ne crée jamais une seconde façade. Sortie inconnue ou `overcode` absent : arrêt sans cible concurrente. |

## CD multi-cibles

`sc-css:cd` publie un artefact statique déterministe vers des cibles nommées `staging` ou `production`, en mode `server` ou `automata`. Build, preview et sortie restent communs ; cache, preuve, récupération et verrou sont propres à chaque cible. Les images et fontes versionnées appartiennent au code. Les données et médias utilisateurs restent hors du périmètre de sc-css.

## Licence

MIT — voir [LICENSE](../../LICENSE).
