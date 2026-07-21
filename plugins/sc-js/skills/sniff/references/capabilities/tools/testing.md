---
---

# Testing — pivot de gouvernance (Vitest/Jest + Playwright)

Consommé par `overcode:control`, pas par `/sc-js:audit` (contrairement aux autres fichiers de ce dossier). Contenu factuel structuré, pas des patterns de revue de code. Applicable quand `vitest` et/ou `jest` (contract/unit) et/ou `@playwright/test`/`playwright` (e2e) sont détectés en devDependencies.

## Test runner(s)

- **Contract/unit — Vitest** (défaut Vite/Nuxt) : `vitest run` (jamais `vitest` seul en CI, reste en watch et bloque le pipeline). Coverage : `vitest run --coverage` (`@vitest/coverage-v8`).
- **Contract/unit — Jest** (legacy, projets pré-Vite ou héritage CRA/pages-router) : `jest --ci`. Coverage : `jest --coverage`.
- La présence simultanée de `vitest` **et** `jest` en devDependencies sur un même projet est elle-même un signal à remonter côté action `configure` (double runner = dette d'outillage), pas un état neutre à ignorer.
- **E2E — Playwright** : `playwright test`. Les scripts `test:e2e`, `test:smoke`, `test:critical`, `test:e2e:nightly` sont des sous-ensembles par vitesse/criticité du même outil, pas des outils différents.

## Test file glob

- Contract/unit (Vitest) : `**/*.{test,spec}.{js,ts}`, hors dossier E2E dédié.
- Contract/unit (Jest) : idem + `**/__tests__/**/*.{js,ts}` (convention historique Jest).
- E2E (Playwright) : sous un dossier dédié (`tests/e2e/`, `e2e/`) — même extension que les specs unitaires en TS, se distingue par l'emplacement, pas par un motif de nom de fichier.

## Test-count command

Énumérer les fichiers correspondant au glob applicable (Vitest ou Jest), hors dossier E2E. Ni Vitest ni Jest n'exposent de flag de comptage direct.

## Tier thresholds (raffinements de `decision-framework.md`)

### Générique JS/TS

- Composable Vue ou action de store Pinia sans accès DOM/réseau/navigateur → toujours `contract`, même si elle manipule des refs réactives (la réactivité n'est pas une frontière d'I/O).
- Composant qui ne fait que rendre selon props/slots, sans effet de bord `onMounted` touchant `window`/`document`/réseau → `contract` (via `@vue/test-utils`, pas Playwright).
- Comportement observable seulement après une navigation complète, un parcours multi-étapes inter-routes, ou un aller-retour session/auth réel → `e2e`.

### Nuxt (si Nuxt détecté)

- Comportement isomorphe (branches `process.client` / `import.meta.client`) → `contract`, testable via `@nuxt/test-utils` (`mountSuspended`/`renderSuspended`, environnement Nuxt contrôlé). Pas besoin de Playwright pour prouver qu'une branche SSR vs client s'exécute correctement.
- Un mismatch d'hydratation réel (le rendu serveur diverge du rendu client après montage) n'est prouvable qu'en `e2e` — un test contract avec DOM émulé ne reproduit pas le cycle SSR → hydratation du vrai navigateur.
- Une route serveur Nitro (`server/api/*`) est testable en `contract` via un appel direct au handler exporté, sans passer par le réseau HTTP — ne pas remonter systématiquement en `e2e` au seul motif que c'est "côté serveur".

### Firebase (si `firebase`/`firebase-admin` détecté)

- Une assertion sur une règle de sécurité Firestore/Storage testée contre un SDK **mocké** n'est PAS un contract test valide — elle vide l'assertion de son sens, puisque c'est justement l'application de la règle qui est sous test. Utiliser l'émulateur (`@firebase/rules-unit-testing`, lancé via `firebase emulators:exec`).
- Un test contre l'émulateur reste `contract`, pas `e2e` : il traverse une frontière réseau locale mais n'implique aucune UI/navigateur/parcours utilisateur — le remonter en `e2e` gonflerait inutilement le tier le plus coûteux du budget.
- `onSnapshot` (listener temps réel) dans un test doit être désabonné explicitement en fin de test (`unsubscribe()`). Un listener qui fuit entre tests est une cause classique de flakiness/timeout — c'est un défaut du test à corriger, pas un signal qu'il faudrait le tier `e2e`.

## Known tooling gotchas

- **Gate de coverage silencieux (Vitest)** — `coverage.thresholds` déclaré dans `vitest.config.ts` ne bloque rien tant que rien n'invoque `vitest run --coverage` : un script `test` qui lance `vitest run` nu ne déclenche jamais le seuil. Détection : grep les scripts `package.json` et tout workflow CI pour `--coverage`/`test:coverage` ; si absent alors que `thresholds` existe en config, le gate est inerte. Fix : câbler `--coverage` dans le script réellement exécuté en CI/pre-commit.
- **Watch mode en CI** — script `test` qui lance `vitest`/`jest` sans `run`/`--ci` ne se termine jamais : ressemble à un hang, pas à un échec. Détection : `"test": "vitest"` (sans `run`) ou `"test": "jest"` (sans `--ci`). Fix : ajouter `run`/`--ci`.
- **Jest + ESM Nuxt/Vite** — Jest ne comprend pas nativement l'ESM que Vite/Nuxt produisent par défaut, ce qui impose une config de transform (`babel-jest`/`ts-jest`) lourde et fragile. Si Vitest est disponible sur le même projet, c'est un signal de dette d'outillage (double runner, transform superflue), pas une contrainte à documenter comme normale.
- **`waitForTimeout` (Playwright)** — attente arbitraire au lieu d'une attente d'état, flaky par construction. Détection : grep `waitForTimeout(` dans le glob E2E. Fix : `waitForLoadState`, assertion web-first `expect(locator)...`, ou `locator.waitFor()`.
- **Émulateur Firebase non démarré en CI** — des tests qui importent `@firebase/rules-unit-testing` mais dont le script CI ne lance pas `firebase emulators:exec`/`firebase emulators:start` échouent en connexion, ou pire, tapent silencieusement le vrai projet Firebase si `FIRESTORE_EMULATOR_HOST` n'est pas forcé. Détection : `@firebase/rules-unit-testing` en dépendance sans `emulators:exec` dans le script de test correspondant. Fix : envelopper le script concerné dans `firebase emulators:exec --only firestore,auth "vitest run ..."`.

## Canonical E2E tool

Playwright, quand détecté en devDependencies. Informationnel uniquement — `control` ne propose jamais de le remplacer.
