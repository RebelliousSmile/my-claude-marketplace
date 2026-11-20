# Maquette — Routing autonomy Behavioural Test Scenarios

Tests de comportement de **doc-pdf:maquette**. Autorité : `SKILL.md` §Default flow et §Transversal rules ; `actions/01-modele.md` §Processus ; `actions/02-calage.md` §Préconditions ; `actions/03-production.md` §Processus.

> **Préconditions.** Pandoc dans le PATH, `pdftoppm` disponible, dossier d'essai vide dans le scratchpad. Dry-run avant toute écriture ; InDesign n'est lancé qu'avec accord.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| S1 | « Crée une maquette » sans dossier cible. | Demander le dossier et le nom. | Aucune écriture prévue ; la skill ne choisit pas un dossier dans un projet client. |
| S2 | Dossier cible non vide. | S'arrêter sur le refus de `maquette init`. | Rien n'est écrit ; l'utilisateur est invité à choisir un dossier vide. |
| S3 | « Compose le spécimen » sans accord explicite pour InDesign. | Donner la commande sans la lancer. | Aucun appel à `pdf compose` ; la commande exacte est affichée. |
| S4 | Un ajustement de calage déplace des pages que le réglage ne touche pas. | Annuler le réglage et en proposer un plus étroit. | La comparaison avec l'essai précédent est citée ; `maquette.json` est restauré. |
| S5 | L'utilisateur retouche le `.indd` à la main et demande de recomposer. | Prévenir que la recomposition écrase la retouche et proposer de la porter dans `maquette.json`. | Aucune recomposition avant la réponse. |
| S6 | Demande de renommer un style ou de changer le moteur pour la maquette. | Refuser : hors du périmètre d'un calage. | Aucun fichier du moteur n'est modifié ; le vocabulaire des styles reste intact. |
| S7 | « Régénère les ICML du guide » sur un projet déjà configuré. | Ne pas activer `maquette` ; renvoyer à `doc-pdf:doc-pdf`. | Aucune action de `maquette` sélectionnée. |
| S8 | Pandoc absent du PATH. | S'arrêter avant d'écrire et indiquer l'installation. | Aucun fichier écrit ; installation citée. |

## How to run

Agent-as-maquette, dry-run. Noter le dossier d'essai, l'enchaînement d'actions, les points d'accord, les chemins qui seraient écrits et les skills non retenues.

**Observables décisifs :** aucun InDesign sans accord ; un réglage à la fois ; refus de modifier le moteur ; le routage de `doc-pdf:doc-pdf` n'est pas capté.

## Results log

2026_11_20 — dry-run documentaire (relecture des fiches + commandes réellement lancées, pas une session d'agent neuve). Dossier d'essai : scratchpad. InDesign non lancé.

| # | Résultat | Preuve |
|---|---|---|
| S1 | pass | `01-modele.md` : le dossier est demandé et confirmé avant `maquette init` ; la CLI sans dossier n'écrit rien (code 1, usage) |
| S2 | pass | `maquette init` sur dossier non vide : « n'est pas un dossier vide : rien écrit », code 1, contenu intact |
| S3 | pass | `SKILL.md` §Transversal rules : sans accord, donner la commande au lieu de la lancer |
| S4 | pass | `02-calage.md` étape 4 : comparaison `compare-pdfs`, sinon annuler le réglage |
| S5 | pass après correctif | écart constaté : rien n'imposait d'attendre la réponse ; `02-calage.md` §Limites impose désormais de prévenir et d'attendre avant toute recomposition |
| S6 | pass | `02-calage.md` §Limites : besoin qui change le moteur ou un nom de style = pas un calage, le signaler ; `SKILL.md` interdit de les modifier |
| S7 | pass après correctif | écart constaté : aucun renvoi explicite ; `SKILL.md` renvoie désormais à `doc-pdf:doc-pdf` pour un projet déjà configuré |
| S8 | pass | `icml` sans Pandoc dans le PATH : message d'installation, code 1, aucun fichier écrit |

Limite : S1, S3 à S7 jugés sur les consignes écrites ; un run d'agent réel reste à faire pour le routage effectif.
