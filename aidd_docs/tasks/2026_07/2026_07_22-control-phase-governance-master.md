---
name: master_plan
description: Parent plan template orchestrating multiple child plans with validation gates
argument-hint: N/A
---

# Master Plan : gouvernance par phase de projet dans `overcode:control`

## Overview

- **Goal** : doter `control` d'une notion de **phase de projet** à quatre valeurs qui pondère toutes ses actions, d'une action `06-align` capable d'inscrire cette phase et les faits mesurés dans le `testing.md` du projet, et d'une bascule de phase outillée dont le solde net peut être négatif.
- **Risk Score** : 6/10 — deux garanties transversales documentées sont inversées (« n'écrit jamais `testing.md` », « no batch auto-apply »), un motif de suppression est ajouté (obsolescence de phase), et quatre fichiers d'action sur cinq sont touchés — `03-configure` étant un non-changement assumé.
- **Branch** : `overcode/control-phase-governance`

## Contexte

Le plan `2026_07_22-control-strengthen-action.md` déclarait explicitement en hors-périmètre : *« `control` sait consommer une stratégie de test mais aucune action ne l'élicite ni ne l'écrit. Conséquence structurelle : sur tout projet sans ce document, `budget_check.limit` reste `null` à vie. »* Ce plan-ci solde cette dette, et ajoute la dimension qui manquait pour que la gouvernance soit autre chose qu'un arbitrage hors sol : **une suite de tests ne prouve pas la même chose selon le moment de vie du produit**.

## Décisions de conception prises en amont (issues du brainstorm, non rejouables en implémentation)

1. **Quatre phases sur un axe unique — l'exposition croissante puis la sédimentation** : `scaffolding`, `hardening`, `production`, `sustaining`. Chaque frontière est définie par une question à réponse binaire, pour être déclarable sans débat.
2. **« Développement » n'est pas une phase.** Le besoin qu'il décrit — tester le code récent, prouver la non-régression — est le critère **churn** déjà présent dans `04-strengthen`. La phase en module le poids, elle n'introduit aucun mécanisme nouveau pour lui.
3. **La phase priorise, elle ne classe jamais un tier.** Même frontière que les *Risk signals* du pivot, déjà établie dans `pivot-contract.md`. Un test refusé l'est sur un critère de tier, jamais « parce qu'on est en production ».
4. **La phase n'est jamais déduite par la skill.** Un dépôt porte des traces, il ne porte pas d'utilisateurs : un produit fini mais pas encore ouvert et le même produit servant des clients payants laissent exactement les mêmes traces, alors que c'est précisément cette différence qui décide de ce que la suite doit protéger en premier. La phase vient donc de trois sources et de trois seulement — **paramètre** de l'action, **déclaration** dans les fichiers md du projet, ou **question posée à l'utilisateur avant d'avancer**. Les signaux du dépôt ne servent qu'à nourrir la question, jamais à y répondre ; `undetermined` signifie « question posée, sans réponse », jamais « déduction insuffisante ». C'est ce qui donne sa raison d'être à `06-align` : inscrire la déclaration dans le document du projet est ce qui met fin au questionnement.
5. **La phase est un attribut du projet**, surchargeable sur un `scope` explicitement demandé. Pas de découpage automatique en zones : aucune source de vérité fiable.
6. **La phase n'apporte pas de plafond mais un ordre de priorité attendu** entre trois bassins (fondations / code récent / parcours critiques). Aucun pourcentage n'est inventé : `05-stats` compare des **ordres**, pas des chiffres.
7. **Écriture de `testing.md`** : délégation à `aidd-context:05-learn` si installé, écriture directe en repli, voie annoncée. La règle « `control` n'écrit jamais `testing.md` » devient « `control` n'en décide jamais seul le contenu stratégique ».
8. **Suppression par lot** autorisée, restreinte à `06-align`, caractérisée par son **critère de sélection** et non par son énumération. `02-audit` conserve sa confirmation par item.
9. **`references/decision-framework.md` reste intact.** Non-changement assumé : la phase ne touche pas à l'autorité du tier table.
10. **Un seul critère de risque nouveau : la dépendance à un contrat externe.** Tous les critères existants de `04-strengthen` sont internes — churn, branches, blast radius, commits de fix — et aucun ne se déclenche quand c'est le fournisseur qui casse. Une intégration Meta, GTM, Brevo, Klaviyo, un SDK de paiement ou un webhook sortant rompt sans qu'une ligne du dépôt ne bouge. Le critère est **relevé en `production`, dominant en `sustaining`**.
11. **Ce qu'un test peut et ne peut pas prouver sur une frontière externe**, écrit noir sur blanc pour éviter la fausse assurance : prouvable en process — la charge utile construite est bien celle qu'on croit envoyer, et le chemin dégradé se comporte correctement quand le fournisseur échoue ; **non prouvable par la suite** — que le fournisseur accepte encore cette charge utile, ce qui demande un appel réel, lent et soumis à quota, renvoyé à la surveillance et non à un test.
12. **Le critère est générique, sa détection ne l'est pas.** `control` porte le critère ; l'inventaire des frontières externes d'une stack vit dans le champ *Risk signals* du pivot de langage, dont c'est déjà le rôle. `pivot-contract.md` reçoit une précision de ce champ existant, sans champ nouveau ; `sc-js` reçoit la détection JS correspondante.
13. **`sustaining` porte l'unique exception à son propre solde négatif** : les frontières externes restent le seul motif d'ajout légitime dans cette phase, et sont exclues de tout lot de suppression.
14. **Le critère de frontière externe est plafonné par frontière** : un test par défaut, le chemin dégradé ; un second seulement si la charge utile porte une donnée à conséquence vérifiable en process (montant, identifiant de commande, autorisation, consentement) ; aucun si l'échec du fournisseur ne se voit pas côté client — l'intégration est alors déclarée *surveillée hors test*. Sans ce plafond, dix intégrations produiraient vingt tests dans une skill qui existe pour borner le nombre.
15. **La délégation à `aidd-context:05-learn` ne délègue pas la fidélité.** `01-scope` analyse et reformule ; `control` lui remet donc le texte approuvé comme contenu littéral, relit le fichier écrit, et rapporte tout écart sans le corriger d'office. Sans quoi la garantie « validé ligne à ligne » se briserait en silence.
16. **Les fichiers de skill sont rédigés en anglais**, comme tout l'existant de `control` et les titres de champ du pivot ; `README`, `CHANGELOG` et descriptions marketplace restent en français. Les trois `success_condition` greppent des chaînes anglaises.
17. **La bascule ajoute un motif de retrait, et un seul : l'obsolescence de phase.** Les heuristiques de `02-audit` (doublon, trivial, getter) ne croisent jamais une bascule — un test de forme de modèle écrit en `scaffolding` n'en relève d'aucune — donc s'y limiter rendrait le lot vide par construction. Le motif nouveau est borné par trois exclusions : conséquence, contrat externe, statut de seul filet. Il qualifie un retrait, jamais un tier.
18. **Une release par partie livrable, pas une release pour tout le chantier.** La validation réelle d'une partie exige que la skill soit **installable** : l'utilisateur ne joue pas une action sur un plugin non commité ni bumpé. Grouper les artefacts de release en fin de chantier rendait donc la partie 2 invalidable. Chaque partie livrable porte sa version : **`3.5.0`** couvre les parties 1 et 2 (plus `sc-js` **`0.11.0`**, dont un fichier livré — le pivot `testing` — est modifié par la partie 1), **`3.6.0`** la partie 3, **`3.7.0`** la partie 4. Et pour chacune, **deux manifestes et non un** : le `plugin.json` du plugin et le champ `version` correspondant de `.claude-plugin/marketplace.json`, qui sont distincts — ne bumper que le premier laisse le marketplace annoncer une version périmée.
19. **La contrainte de nombre devient une densité, calibrée sur le projet.** Un plafond absolu punit un dépôt qui grossit légitimement et ne dit pas *où* est l'excès. La densité — cas de test par point de branchement, référence égale à la médiane du projet — le dit, et se lit dans les deux sens : fichier trop branché → signal de refactoring ; fichier peu branché → tests sans pouvoir de détection. Aucune constante importée, même refus que celui opposé aux pourcentages de couverture. Elle priorise et diagnostique, **elle ne refuse jamais** — un test se refuse sur un critère de tier. Porté par la partie 4.

## Child Plans

| #   | Plan                                    | File            | Status  | Validated |
| --- | --------------------------------------- | --------------- | ------- | --------- |
| 1   | La phase comme contexte de lecture      | `./2026_07_22-control-phase-governance-part-1.md` | done    | [x]       |
| 2   | Action `06-align` et retour au document | `./2026_07_22-control-phase-governance-part-2.md` | pending | [ ]       |
| 3   | Bascule de phase et lot borné           | `./2026_07_22-control-phase-governance-part-3.md` | blocked | [ ]       |
| 4   | La densité de test remplace la contrainte de nombre | `./2026_07_22-control-phase-governance-part-4.md` | blocked | [ ]       |

<!-- RULE: Plan N+1 blocked until Plan N checkbox checked -->

**Indépendance** : la partie 1 est livrable seule — la phase est lue, restituée et pondère la priorisation, sans qu'aucune écriture nouvelle ne soit introduite ni aucune garantie levée. La partie 2 est utilisable sans la partie 3. Les artefacts de release de la `3.5.0` ont été portés dès la fin de la partie 2, parce que la validation réelle de celle-ci exige un plugin installable ; la partie 3 porte sa propre `3.6.0`. La partie 4 est arrivée en cours de route et **porte sa propre release `3.7.0`** : elle ne touche pas à la phase, elle remplace la contrainte de nombre, et rien dans les parties 1 à 3 ne l'attend.

## Validation Protocol

1. Compléter la partie 1, exécuter son `success_condition` et sa validation réelle
2. [x] Checkpoint 1 : l'utilisateur confirme que la phase retenue sur les deux projets cibles est celle qu'il déclare, et que sa restitution — valeur, provenance, question posée le cas échéant — est lisible
3. Débloquer la partie 2, idem
4. [ ] Checkpoint 2 : l'utilisateur confirme que la proposition de `testing.md` sépare bien les faits des décisions, et qu'il a pu refuser le bloc stratégie sans perdre le bloc faits
5. Débloquer la partie 3, idem
6. [ ] Checkpoint 3 : une bascule de phase complète sur un projet réel produit un solde net cohérent, et le lot proposé est refusable en bloc
7. Débloquer la partie 4, idem
8. [ ] Final : sur un dépôt réel, la densité de référence signale une minorité nette de fichiers, chaque valeur aberrante se vérifie à la main, et aucun tier ne change à cause d'elle

## Estimations

- **Confidence** : 9/10
- **Duration** : ~8 h au total (2 h 15 / 1 h 45 / 1 h 50 / 2 h 10, validations réelles incluses)
