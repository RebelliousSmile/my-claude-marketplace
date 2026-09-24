---
objective: "Les constats de la review du gate figé et de l'audit design du 2026-09-24 sont corrigés ou écartés avec une raison, et les suites design tournent en local comme en CI."
status: implemented
---

# Plan: corrections review + audit design

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Corriger les 4 faux verts, remettre les suites design sous garde (`test:design` + CI), tester les scripts de gate non couverts, tenir le contrat exit 2, durcir les frontières d'entrée, factoriser les helpers, unifier les schémas, accélérer la mesure, publier design 2.18.0 |
| **Estimate** | Unité coûteuse : ~60 fichiers source réécrits, ~12 fichiers de test créés, ~10 runs `pnpm test:design` (un par phase, dont les tests Chromium). Ordre de grandeur 5-8 h. Point de coupe naturel après la phase 4 (faux verts corrigés, suites gardées et testées) ; garde-fou : faire le point à chaque frontière de phase au-delà de 2 h |
| **Source** | [`review.md`](../2026_09_24_fidelity-gate-frozen-by-adjust/review.md) (5 constats, 3 déjà corrigés par le diff 2.17.1 non committé) + [`report.md`](../2026_09_24_audit/report.md) (59 constats : 4 🔴, 39 🟡, 16 🟢) |

## Phases

| #   | Phase                                               | File                           |
| --- | --------------------------------------------------- | ------------------------------ |
| 1   | Clôture du correctif 2.17.1                         | [`phase-1.md`](./phase-1.md)   |
| 2   | Faux verts de gate                                  | [`phase-2.md`](./phase-2.md)   |
| 3   | Suites design lancées et gardées                    | [`phase-3.md`](./phase-3.md)   |
| 4   | Tests des scripts de gate non couverts              | [`phase-4.md`](./phase-4.md)   |
| 5   | Contrat d'entrée : exit 2 et écritures sûres        | [`phase-5.md`](./phase-5.md)   |
| 6   | Frontières de sécurité et gabarit wireframes        | [`phase-6.md`](./phase-6.md)   |
| 7   | Helpers partagés                                    | [`phase-7.md`](./phase-7.md)   |
| 8   | Une source par schéma et carte juste                | [`phase-8.md`](./phase-8.md)   |
| 9   | Mesure plus rapide                                  | [`phase-9.md`](./phase-9.md)   |
| 10  | Release design 2.18.0                               | [`phase-10.md`](./phase-10.md) |

## Resources

| Source | Verified          |
| ------ | ----------------- |
| https://osv.dev (requête `pillow` 12.2.0, audit du 2026-09-24) | 13 avis, dont 10 HIGH, tous corrigés en 12.3.0 |
| https://www.w3.org/TR/WCAG22/#non-text-contrast | Bords de composants non textuels ≥ 3:1 (constat `--line`) |
| https://nodejs.org/api/vm.html | « The node:vm module is not a security mechanism » ; `codeGeneration: { strings: false, wasm: false }` existe sur `createContext` |

## Decisions

| Decision   | Why   |
| ---------- | ----- |
| `pnpm test` commence par `test:design` au lieu d'attendre que `debrief-contract` soit réparé | `debrief-contract` (overcode, 4 échecs de fixture d'extracteur) est hors périmètre design ; la chaîne `&&` le laisse masquer toutes les suites design, et la CI ne les lance pas. Réparer `debrief-contract` reste une tâche overcode séparée |
| Une seule release 2.18.0 à la fin, 2.17.1 non publiée à part | Le diff 2.17.1 n'est ni committé ni taggé ; ce plan livre dans le même cycle. Version mineure parce que le manifeste wireframes gagne un champ `lang` et que `requirements-dev.txt` et `test:design` s'ajoutent |
| `lint-core.mjs` reste dans `skills/enforce/adapters/` (constat architecture écarté) | Son chemin est une interface publiée : 355 occurrences dans 82 fichiers, dont les design-bridge de `sc-js` et `sc-php` et les fixtures dual-host. Le déplacer casse des plugins versionnés séparément pour un gain de rangement |
| `manifest-schema.md` reste dans `skills/adjust/references/` (constat architecture écarté) | Les design-bridge de `sc-css`, `sc-js` et `sc-php` citent ce chemin ; le déplacer casse trois plugins versionnés séparément, même raison que `lint-core.mjs` |
| `run-gates.py`, `status.py` et `migrate-contract.py` n'importent pas `tools/_common.py` | Ils sont copiés seuls dans `design/lint/` du projet (`skills/enforce/actions/01-build-linter.md:52`) ; un import de `_common` casserait le linter installé. Leurs helpers restent locaux, le doublon est le prix de la portabilité |
| Pas de préfixe imposé à `auth_hook_env` (constat sécurité écarté) | Le nom en usage, `WP_EDITOR_AUTH_HOOK`, ne respecterait pas le préfixe, et le contenu d'une variable d'environnement vient déjà du shell de l'utilisateur, qui est de confiance |
| Hors plan, à planifier séparément : WordPress sorti du cœur de mesure vers `sc-php`, découpage de `measure.py` et `harness.py`, module unique de chargement du contrat, découpage de `02-freeze.md` | Effort L chacun, et la sortie de WordPress touche deux plugins. Ce plan corrige les défauts ; la restructuration se fait mieux sur des tests déjà verts (phases 3-4) |
| Hors plan : montée `playwright` 1.63 / `numpy` 2.5, lockfile avec hashes, fusion de `screenshot.py` dans `measure.py` | Changer Playwright change le Chromium qui rend, donc toutes les mesures de référence à revalider. Aucun avis de sécurité ne presse ; à grouper avec la restructuration |
| Les corrections qui peuvent faire passer au rouge un contrat déjà vert (alpha au contraste, `var()` avec fallback, `COLOR_PROPS` complété) passent en `Fixed` avec une note de migration | Ce sont des faux verts : le rouge qui apparaît est le vrai verdict. L'utilisateur doit savoir pourquoi son gate change |
