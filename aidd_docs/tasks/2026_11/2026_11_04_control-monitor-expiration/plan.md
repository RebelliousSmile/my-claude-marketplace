---
status: implemented
---

# Plan — `overcode:control` : ne plus perdre de lots entre deux notifications

## Overview

**Source** (debrief du 2026-11-04, session `489916be`, recommandation 2) : corriger `overcode:control` pour armer le Monitor à 30 min et relire le transcript à chaque expiration, pas seulement à chaque notification. Preuve : 16 réarmements, et 34 lots (#235 à #268, de 18:10 à 18:47) sans notification alors que le compteur de la sonde avançait.

**Reformulation après lecture du code** : la moitié de la recommandation est déjà écrite.

- `actions/01-watch.md` § 5 impose déjà `timeout_ms` = 1 800 000, et l'eval L1 le vérifie. Les 16 réarmements viennent de l'exécution, qui a d'abord armé sans `timeout_ms` : c'est un écart d'application, pas un défaut du texte. Il suffit de rendre la consigne plus visible.
- Le vrai défaut est ailleurs. La sonde écrit chaque lot sur stdout et nulle part ailleurs. Une ligne que le Monitor ne remonte pas est donc perdue : aucun fichier ne la garde, et le commentateur ne détecte pas le trou. `tlines`/`tlines_prev` ne gardent que le dernier lot.

**Correction retenue** :

1. **La sonde journalise** chaque ligne émise (baseline, lot, idle) dans `$state/emitted.log`, en ajout.
2. **Le commentateur détecte et rattrape les trous.** Après chaque commentaire, il écrit le numéro du dernier lot commenté dans `$state/commented` : ce fichier survit au compactage de la conversation et à l'expiration du Monitor. Si le lot reçu porte un `k` supérieur au dernier + 1, ou si le Monitor expire, il relit `emitted.log` depuis ce dernier lot. Il commente alors les lots manquants d'un bloc groupé : une ligne par lot, ou un résumé au-delà de 5, avec ses `⚠`.

Le debrief proposait de « relire le transcript ». C'est remplacé par la relecture du journal des lots : il porte déjà les plages de lignes du transcript (`a-b`), si bien que le transcript n'est relu que sur ces plages, selon la règle existante du § 7.

## Phases

| #   | Phase                                   | Fichier       |
| --- | --------------------------------------- | ------------- |
| 1   | Journal des lots dans la sonde          | `phase-1.md`  |
| 2   | Rattrapage dans les consignes et evals  | `phase-2.md`  |

## Resources

- `plugins/overcode/skills/control/scripts/watch.sh` : la fonction `tick`, émissions aux lignes 108, 154 et 157
- `plugins/overcode/skills/control/actions/01-watch.md` : § 5 (armement), § 7 (commentaire par lot)
- `plugins/overcode/skills/control/SKILL.md` : règles transversales « Un lot, un commentaire » et « La sonde vit au-delà d'un Monitor »
- `tools/eval/control-watch.mjs` : contrat W1 à W9
- `plugins/overcode/skills/control/evals/lifecycle-scenarios.md` : L1 à L7

## Decisions

- **Journal plutôt que relecture du transcript** : le journal est la source des lots elle-même, et il est petit (une ligne par lot). Le transcript reste lu sur les plages qu'il cite.
- **Journal dans `--state`**, hors du dépôt observé : la lecture seule est respectée (W7).
- **`$state/commented` écrit par le commentateur** : le dossier d'état appartient à control, hors du dépôt observé ; la règle « Lecture seule » vise le dépôt observé et le dit désormais explicitement.
- **Hors périmètre** : `02-recap` garde son compte sur `batch`, sur lequel repose son test ; aucun changement de `host-portability.md`, qui ne parle pas du Monitor (un hôte sans Monitor lit la sortie de `--once` directement).
- **Aucune rotation du journal** : il est supprimé avec le dossier d'état par `03-stop`. Une session de plusieurs heures ne produit que quelques centaines de lignes.
- **Le Monitor n'est pas la cause certaine** : on ne sait pas si la perte vient du filtrage de Claude Code ou de l'émission. Le journal rend la correction indépendante de cette cause.
- **Version** : 6.2.0 → 6.2.1 (correctif), entrée `### Fixed` dans `plugins/overcode/CHANGELOG.md`. Le bump passe par `overcode:alias bump-plugin`, hors de ce plan.
