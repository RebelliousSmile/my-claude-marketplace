---
name: plan
description: Living implementation plan - frozen objective, phases, and append-only execution Log. Used as input artifact AND as the autonomous-loop tracking file.
argument-hint: N/A
objective: "`overcode:control` remplace la contrainte de nombre absolue par une **densité de test** calibrée sur la distribution du projet lui-même — cas de test par point de branchement, référence égale à la médiane du projet — et lit tout dépassement dans les deux sens que le code autorise : un fichier qui fait trop de choses, ou des tests sans pouvoir de détection. La densité priorise et diagnostique ; elle ne refuse jamais un test, ce qui reste l'affaire du tier."
success_condition: "cd /home/tnn/Projets/my-marketplace && C=plugins/overcode/skills/control && D=$C/references/test-density.md && test -f $D && grep -q 'median' $D && grep -q 'refactoring' $D && grep -q 'never refuses' $D && grep -q 'test-density.md' $C/SKILL.md && grep -q 'density' $C/actions/01-write.md && grep -q 'density' $C/actions/02-audit.md && grep -q 'density' $C/actions/04-strengthen.md && grep -q 'density' $C/actions/05-stats.md && grep -q 'density' $C/actions/06-align.md && grep -q '\"version\": \"3.7.0\"' plugins/overcode/.claude-plugin/plugin.json && grep -q '\"version\": \"3.7.0\"' .claude-plugin/marketplace.json && grep -q '3.7.0' plugins/overcode/CHANGELOG.md && grep -qE '^- Validation reelle — Pass' aidd_docs/tasks/2026_07/2026_07_22-control-phase-governance-part-4.md"
iteration: 0
created_at: "2026-07-22T14:40:00+02:00"
---

# Instruction : la densité de test remplace la contrainte de nombre

## Feature

- **Summary** : la skill borne aujourd'hui sa suite par un **nombre absolu**, lu dans le document du projet ou nul en son absence. Un nombre absolu a deux défauts que l'usage a fait remonter : il punit un dépôt qui grossit légitimement, et il ne dit **pas où** se trouve l'excès. Une densité le dit. Cette partie remplace `limit` par une densité calibrée sur la distribution du projet lui-même, sans aucune constante arbitraire — le même refus que la skill oppose déjà aux pourcentages de couverture.
- **Stack** : `markdown` (skills et références) · mesures : rapport de couverture v8 (points de branchement) + glob source du pivot
- **Branch name** : `overcode/control-test-density`
- **Parent Plan** : `2026_07_22-control-phase-governance-master.md`
- **Sequence** : `4 of 4`
- Confidence : 8/10
- Risque : 5/10 — la formule touche la contrainte de nombre, c'est-à-dire le cœur de ce que la skill promet ; se tromper de dénominateur produirait un signal bruyant que l'utilisateur apprendrait à ignorer, ce qui est pire que pas de signal.
- Time to implement : ~2 h 10 (dont ~40 min de validation réelle)

## Paramètres d'exécution

- `TARGET_PROJECT` — `/home/tnn/Projets/SmartLockers/multisite-clients` : 1754 cas unitaires sur 72 fichiers source classifiables, avec un rapport de couverture v8 réel — le seul dépôt disponible où la distribution des densités est assez large pour que la médiane veuille dire quelque chose.
- `NO_DOC_PROJECT` — `/home/tnn/Projets/MyApps/moodboard-generator` : aucun test, pour éprouver le cas dégénéré (médiane indéfinie).

## Langue des artefacts

Ce plan est rédigé en français ; **les fichiers de skill produits sont rédigés en anglais**, comme tout l'existant de `control`. Le `success_condition` greppe des chaînes anglaises.

## Contexte vérifié en amont

- `references/decision-framework.md` porte aujourd'hui la section *Number constraint*, mais ce fichier n'est chargé **que** lorsque le projet n'a pas de stratégie documentée. La densité, elle, s'applique toujours : elle ne peut donc pas y vivre. D'où un fichier de référence propre.
- `04-strengthen` lit déjà le glob source du pivot et le rapport de couverture par fichier, avec les compteurs `covered`/`total` par branche. La densité ne demande **aucune mesure nouvelle** : elle recombine ce qui est déjà lu.
- `05-stats` annonce aujourd'hui `budget : null (no documented budget)` quand rien n'est écrit. C'est la ligne que cette partie rend utile : un projet sans budget documenté n'est pas non borné, il est borné par sa propre distribution.
- La règle transversale de phase (`la phase priorise, elle ne classifie jamais un tier`) fixe le précédent que la densité doit suivre mot pour mot. Un troisième mécanisme de priorisation qui se mettrait à refuser des tests casserait l'invariant que les parties 1 à 3 ont installé.

## Architecture projection

### Files to create

- `plugins/overcode/skills/control/references/test-density.md` - la formule, la calibration sur la médiane du projet, la double lecture d'un dépassement, les cas dégénérés

### Files to modify

- `plugins/overcode/skills/control/SKILL.md` - règle transversale de densité + ligne de références
- `plugins/overcode/skills/control/actions/01-write.md` - la contrainte de nombre consulte la densité du fichier visé, et ne refuse jamais sur elle
- `plugins/overcode/skills/control/actions/02-audit.md` - la densité cible le périmètre de chasse aux tests sans valeur
- `plugins/overcode/skills/control/actions/04-strengthen.md` - ne pas empiler sur un fichier déjà saturé sans le dire
- `plugins/overcode/skills/control/actions/05-stats.md` - la ligne `budget` devient une densité de référence + les valeurs aberrantes
- `plugins/overcode/skills/control/actions/06-align.md` - le bloc stratégie propose une densité, plus un plafond absolu
- `plugins/overcode/README.md`, `plugins/overcode/CHANGELOG.md`, `plugins/overcode/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` - release `3.7.0`

### Files to delete

- aucun

## Applicable rules

`node ${CLAUDE_PLUGIN_ROOT}/scripts/list-rules.mjs` retourne `[]`. Aucune surface de règles installée : `none`.

| Tool | Name | Path | Why it applies |
| ---- | ---- | ---- | -------------- |
| none | -    | -    | aucune règle installée sur ce dépôt |

## User Journey

```mermaid
---
title: Densite de test calibree sur le projet
---
flowchart TD
  Measure["Mesure par fichier : cas de test et points de branchement"]
  Median["Mediane des densites du projet"]
  Compare["Comparaison fichier par fichier"]
  Normal["Densite dans la distribution"]
  Outlier["Densite au-dela de trois fois la mediane"]
  Branchy["Fichier tres branche"]
  Flat["Fichier peu branche"]
  Refactor["Signal de refactoring : le fichier fait trop de choses"]
  LowValue["Tests sans pouvoir de detection : perimetre pour 02-audit"]
  NoRefusal["Aucun test n est refuse sur ce signal"]

  Measure --> Median
  Median --> Compare
  Compare --> Normal
  Compare --> Outlier
  Outlier --> Branchy
  Outlier --> Flat
  Branchy --> Refactor
  Flat --> LowValue
  Normal --> NoRefusal
  Refactor --> NoRefusal
  LowValue --> NoRefusal
```

## Risk register

| Risk | Impact | Mitigation |
| ---- | ---- | ---------- |
| La densité se met à refuser des tests | La skill classifie sur un nombre, exactement ce que la règle de phase interdit | Écrit noir sur blanc dans la référence et dans `01-write` : la densité priorise et diagnostique, **elle ne refuse jamais**. Le refus reste un critère de tier. |
| La médiane est calculée sur une population trop petite | Un projet à trois fichiers testés produit une référence qui n'a aucun sens statistique | Seuil de population explicite en dessous duquel la référence est déclarée non calculable, et la ligne sort en `insufficient population` plutôt qu'en chiffre |
| Le dénominateur choisi produit du bruit | L'utilisateur apprend à ignorer le signal, ce qui est pire que pas de signal | Dénominateur = points de branchement, déjà lus par `04-strengthen` ; un fichier sans branche est explicitement hors distribution, pas à densité infinie |
| La double lecture est appliquée à l'envers | Un fichier qui a besoin d'un refactoring se voit proposer une suppression de tests | La discrimination est mesurée, pas devinée : décile haut de branchements = refactoring ; sinon tests sans valeur |
| Un fichier sans aucun test tire la médiane vers zéro | La référence devient inutilisable sur un dépôt peu couvert | Les fichiers à zéro test sont exclus du calcul de la médiane — ils relèvent de `04-strengthen`, pas de la densité |
| La densité entre en conflit avec un budget documenté | Deux bornes contradictoires, sans arbitre | Un plafond explicitement écrit par le projet **prime** ; la densité est alors rapportée en second, comme diagnostic |

## Implementation phases

### Phase 1 : la référence

> Une formule qui ne dit pas ce qu'elle ne fait pas devient une règle de refus en six mois.

#### Tasks

1. Créer `references/test-density.md` : la formule `densité(f) = cas de test exerçant f / max(1, points de branchement de f)`, la référence égale à la **médiane** des densités du projet, et le seuil d'alerte à trois fois cette médiane.
2. Écrire la calibration : **aucune constante arbitraire**. La référence est la distribution du projet, jamais un chiffre importé — même refus que celui opposé aux pourcentages de couverture.
3. Écrire la double lecture d'un dépassement, avec sa discrimination mesurée : décile haut en branchements → signal de **refactoring** (le fichier fait trop de choses, la suite paie la dette du code) ; sinon → tests sans pouvoir de détection, périmètre à passer à `02-audit`.
4. Écrire les cas dégénérés : aucun test dans le projet, population insuffisante pour une médiane, fichier sans point de branchement, fichiers à zéro test exclus du calcul.
5. Écrire la borne d'autorité : la densité **priorise et diagnostique, elle ne refuse jamais** (`never refuses`). Un test se refuse sur un critère de tier, jamais sur une densité — même frontière que la phase.
6. Écrire l'articulation avec un budget documenté : un plafond écrit par le projet prime, la densité passe en diagnostic.

#### Acceptance criteria

- [ ] La formule, son dénominateur et sa référence médiane sont écrits
- [ ] Aucune constante numérique arbitraire n'est introduite hors du facteur d'alerte, lui-même justifié
- [ ] La double lecture est écrite, avec sa mesure de discrimination
- [ ] Les quatre cas dégénérés sont traités
- [ ] La phrase de non-refus est écrite et grepable

### Phase 2 : câblage dans les actions

> Une formule que personne ne consomme est une opinion rangée dans un fichier.

#### Tasks

1. `SKILL.md` : règle transversale de densité, calquée sur la règle de phase, et ligne de références vers `test-density.md`.
2. `01-write` : la contrainte de nombre consulte la densité du fichier visé et la **rapporte** dans le `rationale` ; elle ne fait jamais basculer la décision.
3. `02-audit` : quand une densité aberrante à faible branchement est constatée, elle **cible le périmètre** de la chasse — elle ne qualifie aucune ligne du tableau, les trois heuristiques restant seules juges.
4. `04-strengthen` : ne pas proposer un ajout sur un fichier déjà aberrant sans dire que le fichier est saturé, et rappeler la lecture refactoring quand elle s'applique.
5. `05-stats` : la ligne `budget` devient `reference density` + les valeurs aberrantes, avec `insufficient population` en cas dégénéré ; un budget documenté reste affiché en premier.
6. `06-align` : le bloc `PROPOSED STRATEGY` propose une **densité** et non un plafond absolu.

#### Acceptance criteria

- [ ] Les six fichiers portent le mot `density` et le consomment chacun dans son propre rôle
- [ ] Aucune action ne refuse quoi que ce soit sur la densité
- [ ] `05-stats` ne produit plus `budget : null` comme état neutre

### Phase 3 : release `3.7.0`

#### Tasks

1. `plugins/overcode/.claude-plugin/plugin.json` → `3.7.0`.
2. Champ `version` correspondant dans `.claude-plugin/marketplace.json` → `3.7.0`.
3. `CHANGELOG.md` d'`overcode` : entrée `3.7.0`, en français.
4. `README.md` d'`overcode` : la densité dans la description de `control`.
5. Vérifier qu'aucun autre manifeste n'est concerné — `sc-js` n'est pas touché par cette partie.

#### Acceptance criteria

- [ ] Les trois emplacements de version portent `3.7.0`
- [ ] Le CHANGELOG décrit le remplacement de la contrainte de nombre, pas seulement son ajout

### Phase 4 : validation réelle

> Une médiane se valide sur une vraie distribution, jamais sur un jeu de données choisi.

#### Tasks

1. Calculer la distribution réelle des densités sur `TARGET_PROJECT` à partir du rapport de couverture v8 existant. Vérifier que la médiane est stable et que les valeurs aberrantes sont peu nombreuses — une formule qui signale un quart du dépôt ne signale rien.
2. Pour chaque fichier aberrant remonté, vérifier **à la main** que la lecture proposée (refactoring ou tests sans valeur) est la bonne. Un contre-exemple sur trois invalide la discrimination et impose de la revoir.
3. Exécuter `05-stats` sur `NO_DOC_PROJECT` : aucune erreur, `insufficient population` annoncé.
4. Vérifier qu'aucune action ne bascule une décision sur la densité : rejouer `01-write` sur un fichier aberrant et constater que le tier est inchangé.
5. Soumettre les sorties à l'utilisateur. Sur son accord, écrire `Validation reelle — Pass` dans le Log.

#### Acceptance criteria

- [ ] La distribution réelle est calculée et rapportée, médiane comprise
- [ ] Les fichiers aberrants représentent une minorité nette du dépôt
- [ ] La lecture proposée est vérifiée à la main sur chaque aberrant, sans contre-exemple non expliqué
- [ ] `05-stats` ne casse pas sur un projet sans test
- [ ] Le tier proposé par `01-write` est insensible à la densité
- [ ] La ligne `Validation reelle — Pass` figure dans le Log, écrite après accord utilisateur

## Amendments

<!-- AI-initiated changes during implementation. Each entry is prefixed with 🤖. -->

## Log

<!-- APPEND ONLY. One entry per step attempt. Never rewrite. -->

## Validation flow demonstration

1. Ouvrir un terminal sur `/home/tnn/Projets/SmartLockers/multisite-clients`.
2. Lancer `/overcode:control stats`. Lire la ligne de densité de référence et la liste des valeurs aberrantes.
3. Ouvrir l'un des fichiers signalés en lecture « refactoring » : constater qu'il porte effectivement plusieurs responsabilités.
4. Ouvrir l'un des fichiers signalés en lecture « tests sans valeur » : constater que ses tests se répètent.
5. Lancer `/overcode:control write` sur un comportement de ce dernier fichier : constater que le tier ne change pas à cause de la densité.
