# sc-godot

*Knowledge provider pour le moteur Godot et GDScript : détection de stack, audit, modernisation et enseignement par pivots — partie technique du jeu vidéo.*

> **Squelette.** Ce plugin est créé à neuf comme pendant technique de `game-writer` (contenu narratif). Les skills suivent le template `sc-*` standard et restent **à porter** (chantier dédié, voir [CHANGELOG](CHANGELOG.md)).

Pendant technique de `game-writer` : là où `game-writer` écrit le contenu narratif (timelines Dialogic, bank d'assets), `sc-godot` couvre le code moteur (GDScript, scènes, nodes, signaux, performance).

## Skills (prévus — template sc-*)

| Skill | Déclencheur | Description (cible) |
|---|---|---|
| `sniff` | `/sc-godot:sniff` | Détecte la version Godot / addons (`project.godot`, `addons/`), installe/met à jour les règles pertinentes |
| `audit` | `/sc-godot:audit` | Auditeur qualité GDScript — détecte la stack via sniff puis délègue la revue avec les pivots applicables |
| `improve` | `/sc-godot:improve` | Analyse le code — idiomes GDScript, patterns nodes/signaux, plan d'amélioration |
| `legacy` | `/sc-godot:legacy` | Scanne les patterns dépréciés (Godot 3→4), propose une migration |
| `teach` | `/sc-godot:teach` | Enseigne GDScript, l'arbre de scènes, les signaux et les patterns moteur |

## Licence

MIT — voir [LICENSE](../../LICENSE).
