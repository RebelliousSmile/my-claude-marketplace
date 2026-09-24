# Carte de l'entonnoir

Source unique lue par `01-explain`. Un verbe par ligne, chacun avec son **fichier autoritaire** : la carte donne rôle, entrée, sortie, artefacts, état du contrat et gate — **jamais le processus**. Pour le comment d'un verbe, lire son fichier autoritaire ; le paraphraser ici ferait deux sources qui dérivent (dec-001).

L'ordre est celui de l'entonnoir. `detail` est le verbe 0. `wireframes` puis `harness` sont hors entonnoir : le premier explore une interface, le second rend ses pages acceptées mesurables. Ce sont des préconditions possibles, pas des étapes du lifecycle.

| Verbe | Rôle | Entrée | Sortie | Artefacts touchés | Contrat (avant → après) | Gate | Fichier autoritaire |
|---|---|---|---|---|---|---|---|
| **detail** (0) | Restituer la carte, router une intention vers sa séquence | une intention énoncée | la carte, ou une séquence de classe de cas | aucun — lecture seule | inchangé → inchangé | aucun | `skills/detail/SKILL.md` |
| **define** | Constituer la matière du contrat depuis une référence ou un brief | référence(s) visuelle(s) ou intention écrite | matière de contrat + charte prose | `tokens.json` · `design-system.md` (brouillon) | absent → brouillon | — | `skills/define/SKILL.md` |
| **destructure** | Critiquer un brouillon, un composant, une page ou un système sous les angles visuel, accessibilité, interaction, hiérarchie | un brouillon, un composant, une page ou un système | rapport de critique avec alternatives | aucun — lecture seule, seul le rapport est écrit | inchangé → inchangé | — | `skills/destructure/SKILL.md` |
| **adjust** | Figer le contrat et lui donner son identité de version | matière de contrat en brouillon | contrat figé raciné par `release.json` | `release.json` · `tokens.json` · `components.json` · `policies.json` · `oracle.json` et `deviations.json` (si produits) | brouillon → figé | figeage (import `tokens.css`) | `skills/adjust/SKILL.md` |
| **enforce** | Rendre le contrat opposable en gate vérifiable ; sans contrat, inspecter sans verdict | contrat figé + instances ou rendu ; sans contrat, une cible seule | verdict de gate + rapports | lit tout le contrat ; écrit `gates.config.json` et les rapports de pivot | figé → figé | vocabulaire + fidélité + seuil de maturité | `skills/enforce/SKILL.md` |
| **diffuse** | Produire des éléments natifs conformes au contrat ; sans contrat, un prototype marqué non gouverné | contrat figé, gates verts ; sans `release.json`, un brief de composant local | élément(s) rendus | lit `tokens.json` · `components.json` | figé → figé | passe le gate `enforce` (exit 0) | `skills/diffuse/SKILL.md` |
| **wireframes** (hors entonnoir) | Fixer disposition, usages et états avant intégration | brief UI ou HTML auteur | planche HTML standardisée, preuves et review détachée | aucun artefact de contrat | inchangé | lint statique + rendu ; review séparée | `skills/wireframes/SKILL.md` |
| **harness** (hors entonnoir) | Rendre mesurable une référence absente ou HTML non canonique | référence non mesurable ou HTML auteur | référence canonique servie à l'oracle de fidélité | aucun artefact de contrat | inchangé | aucun — précondition de `enforce` sur référence | `skills/harness/SKILL.md` |

Deux natures de gate portées par `enforce` seul — **vocabulaire** (markup linté) et **fidélité** (rendu mesuré) — plus le **seuil de maturité** qui décide si un vert affirme la conformité. Énoncé canonique : `references/gate-natures.md` et `references/maturity-status.md`. Aucun autre verbe ne porte de gate.
