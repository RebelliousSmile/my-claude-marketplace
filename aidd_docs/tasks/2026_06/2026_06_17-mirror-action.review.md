# Code Review: action `mirror` (overcode/alias)

Revue qualité du prompt-action `10-mirror.md` — orchestrateur de réconciliation maquette↔implémentation via `design:copycat`, avec mode correction directe et boucle multi-page.

- **Verdict**: ~~changes-requested~~ → **résolu** (corrigé le 2026_06_17, non commité)
- **Diff scope**: `604dede...62458f5` (`plugins/overcode/skills/alias/actions/10-mirror.md`)
- **Date**: 2026_06_17
- **Findings**: 0 critical, 3 warning, 3 minor — **tous adressés**

Verdict initial : `changes-requested`. Les 3 🟡 et les 2 minor liés au multi-page ont été corrigés directement dans l'action (ancrage origine/page, Step 4b layout, mode A forcé en multi-page, registre indexé par page).

## Expected changes

Ce que le diff devait livrer :

- [x] Orchestrateur qui ancre les deux sources avant analyse (Step -1, gate)
- [x] Mode A (analyse via copycat) vs mode B (correction directe sans re-analyse)
- [x] Prompt copycat à périmètre ouvert (pas de liste fermée de propriétés)
- [x] Step 5 vérification non-bloquant si navigateur déjà ouvert
- [x] Option `--page` répétable → comparaison multi-page séquentielle + rapport global

## Findings

| Sev | Category     | Location           | Issue                                                                                                                                                                                 | Suggested fix                                                                                                                                  |
| --- | ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟡  | architecture | `10-mirror.md:71`  | Step -1 dit « si les sources sont déjà connues du contexte… ne pas les re-demander — les réutiliser ». En multi-page, chaque page a une URL **différente** → réutiliser l'URL de la page précédente produit un ancrage faux. | Restreindre la réutilisation à l'**implémentation base** (même origine) ; l'URL/chemin de page doit être ré-identifié à chaque itération.       |
| 🟡  | code-health  | `10-mirror.md:62`  | Les findings de type `layout` (Step 1, ex. « Carte 3 absente ») sont inventoriés mais aucun step ne les traite : ni Step 2 (texte) ni Step 4 (style). Ils tombent en « à corriger manuellement » au rapport — chemin orphelin. | Ajouter un sous-pas explicite (Step 4b ou note dans Step 1) : tenter une correction template pour les écarts layout simples (bloc manquant), sinon flaguer manuel avec la raison. |
| 🟡  | code-health  | `10-mirror.md:48`  | Step -2 point 3 impose « exécuter les Steps -1 à 5 » par page, mais le branchement mode B (sauts Step 2/4) n'a pas de sens en multi-page (pas de description verbale par page). L'instruction « Steps -1 à 5 » entre en tension avec le routing mode B. | Préciser que le mode multi-page est **mode A par nature** ; le routing mode B ne s'applique qu'en single-page.                                 |
| 🟢  | code-health  | `10-mirror.md:30`  | Combinaison `--page` + description d'écarts verbaux (mode B) non définie — comportement ambigu si l'utilisateur fournit les deux.                                                       | Une ligne : `--page` force le mode A ; ignorer/avertir si des corrections directes sont aussi décrites.                                          |
| 🟢  | standards    | `10-mirror.md:88`  | Pas de garde sur le nombre de pages : une longue file s'exécute sans plafond ni avertissement de durée.                                                                                | Optionnel — afficher « N pages, traitement séquentiel long » dans le bloc de confirmation Step -2.                                              |
| 🟢  | code-health  | `10-mirror.md:120` | Step 6 rapport global préfixe les lignes `[Page X]`, mais le registre d'accumulation (Step -2 pt 3) ne dit pas de stocker l'indice de page avec chaque correction → risque de préfixe manquant. | Préciser que chaque entrée du registre porte son numéro de page.                                                                                |

## Coverage

- **Scanned**: cohérence du flow inter-steps, contradictions d'instructions, chemins orphelins (findings non traités), routing des modes, interaction `--page`×`--ref`×mode B, accumulation registre multi-page, robustesse Step 5.
- **Not applicable**: security, performance runtime, error-handling code (artefact = prompt markdown, pas de code exécutable), backend, frontend.

## Follow-up

- **Top fixes** (hand off `aidd-dev:07-refactor`) :
  1. 🟡 Ancrage multi-page — distinguer origine réutilisable vs URL/chemin de page ré-identifié par itération (`10-mirror.md:71`).
  2. 🟡 Chemin orphelin layout — donner une issue de sortie aux findings `layout` (`10-mirror.md:62`).
  3. 🟡 Clarifier mode A par nature en multi-page (`10-mirror.md:48`).
- **Notes**: les corrections du `rechallenge` précédent (routing mode B mixte, fallback copycat, liste de propriétés ouverte) sont bien présentes et propres. Les findings ci-dessus sont tous nés de l'ajout `--page` qui a introduit une boucle au-dessus d'un workflow conçu pour une page unique.
