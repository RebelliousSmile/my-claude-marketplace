---
---

# Testing — pivot de gouvernance (Vitest/Jest + Playwright)

Consommé par `overcode:control`, pas par `/sc-js:audit` (contrairement aux autres fichiers de ce dossier). Contenu factuel structuré, pas des patterns de revue de code. Applicable quand `vitest` et/ou `jest` (contract/unit) et/ou `@playwright/test`/`playwright` (e2e) sont détectés en devDependencies.

## Test runner(s)

- **Contract/unit — Vitest** (défaut Vite/Nuxt) : `vitest run` (jamais `vitest` seul en CI, reste en watch et bloque le pipeline). Coverage : voir `Coverage command`, le `--coverage` nu ne suffit pas à `strengthen`.
- **Contract/unit — Jest** (legacy, projets pré-Vite ou héritage CRA/pages-router) : `jest --ci`. Coverage : voir `Coverage command`.
- La présence simultanée de `vitest` **et** `jest` en devDependencies sur un même projet est elle-même un signal à remonter côté action `configure` (double runner = dette d'outillage), pas un état neutre à ignorer.
- **E2E — Playwright** : `playwright test`. Les scripts `test:e2e`, `test:smoke`, `test:critical`, `test:e2e:nightly` sont des sous-ensembles par vitesse/criticité du même outil, pas des outils différents.

## Test file glob

- Contract/unit (Vitest) : `**/*.{test,spec}.{js,ts}`, hors dossier E2E dédié.
- Contract/unit (Jest) : idem + `**/__tests__/**/*.{js,ts}` (convention historique Jest).
- E2E (Playwright) : sous un dossier dédié (`tests/e2e/`, `e2e/`) — même extension que les specs unitaires en TS, se distingue par l'emplacement, pas par un motif de nom de fichier.

## Test-count command

Énumérer les fichiers correspondant au glob applicable (Vitest ou Jest), hors dossier E2E. Ni Vitest ni Jest n'exposent de flag de comptage direct.

## Coverage command

Commandes vérifiées sur un projet réel (Vitest 4.1.0 + `@vitest/coverage-v8`, 55 fichiers / 1829 tests) — les reporters par défaut ne produisent **aucun** rapport exploitable par `strengthen`, le reporter machine-lisible doit être demandé explicitement.

- **Vitest** : `npx vitest run --coverage --coverage.reporter=json-summary --coverage.reportOnFailure`
- **Jest** : `npx jest --ci --coverage --coverageReporters=json-summary`
- **Fichier produit** (les deux) : `coverage/coverage-summary.json` — une entrée par fichier, chacune portant `lines` / `branches` / `functions` / `statements` sous la forme `{total, covered, skipped, pct}`, plus une entrée agrégée `total`.

Trois règles d'usage, chacune adossée à un piège constaté :

- **`--coverage.reportOnFailure` n'est pas optionnel.** Il vaut `false` par défaut : un seul test rouge et aucun rapport n'est écrit. Sans ce flag, `strengthen` conclurait à l'absence d'outillage de coverage sur un projet qui en a un.
- **Ignorer le code de sortie.** Les seuils (`coverage.thresholds` / `coverageThreshold`) sont évalués *après* l'écriture des rapports et n'agissent que sur le code de sortie. Le rapport est donc lisible même sous seuil : `strengthen` lit un rapport, il ne fait pas passer un gate.
- **Lire `covered`/`total`, jamais `pct` seul.** Un fichier sans aucune branche affiche `branches.pct = 100` alors qu'aucune de ses lignes n'est couverte. Classer au pourcentage ferait passer un fichier jamais testé pour parfaitement couvert.

**Univers du rapport** : Vitest ne rapporte que les fichiers effectivement couverts, *sauf* si le projet déclare `coverage.include` (équivalent Jest : `collectCoverageFrom`), auquel cas les fichiers jamais importés par un test remontent à 0 %. `coverage.all` a été supprimé en Vitest 4 : `include` est le seul mécanisme. Conséquence pour `strengthen` : c'est le `Source glob & exclusions` ci-dessous qui définit l'univers à classer, le rapport ne fait que l'enrichir — un fichier du glob absent du rapport est **non couvert**, pas inexistant.

## Source glob & exclusions

Code de production classable, par convention de la stack :

- `src/**/*.{js,ts,vue}`, `lib/**/*.{js,ts}`
- Nuxt : `composables/**`, `stores/**`, `server/api/**`, `server/utils/**`, `middleware/**`, `utils/**`, `plugins/**`, `components/**`

Jamais classable — ne doit jamais apparaître comme un gap :

- Artefacts de build et caches : `dist/`, `.output/`, `.nuxt/`, `.vite/`, `coverage/`, `node_modules/`, `public/`
- Configuration : `*.config.{js,ts,mjs}`, `nuxt.config.*`, `vitest.config.*`, `playwright.config.*`, `eslint.config.*`
- Déclarations et code généré : `*.d.ts`, `*.gen.{js,ts}`, sorties de codegen GraphQL/Prisma/OpenAPI, `auto-imports.d.ts`, `components.d.ts`
- Réexports purs (`index.{js,ts}` ne contenant que des `export … from`), fichiers de constantes sans logique
- Les fichiers de test eux-mêmes, et les fixtures/mocks (`__mocks__/`, `tests/fixtures/`)
- Stories et bancs de démo : `*.stories.{js,ts}`, `*.demo.*`

## Risk signals

Priorisent le classement de `strengthen`. **Ne classent jamais un tier** : l'autorité de tier reste `Tier thresholds` et le `decision-framework.md` générique. Un signal peut faire remonter un gap en tête de table, jamais changer le tier proposé pour lui.

À forte conséquence dans cette stack :

- **Argent** — panier, calcul de prix/remise/taxe, appels Stripe/facturation, tout ce qui produit un montant affiché ou débité.
- **Autorisation** — guards de route et middlewares Nuxt, règles Firestore/Storage, vérification de rôle ou de propriété d'une ressource, gestion de session/token.
- **Persistance destructrice** — suppression, `batch`/`transaction` Firestore, écriture en masse, migration de données : l'erreur n'y est pas rattrapable par un rechargement.
- **Entrées externes non maîtrisées** — handlers de webhook, parsing de payload tiers, désérialisation de données stockées : le code y reçoit ce qu'il n'a pas produit.
- **État transverse** — store Pinia partagé par plusieurs vues, cache applicatif, singleton d'initialisation : une régression y rayonne au-delà de son fichier.
- **Routes serveur Nitro exposées** (`server/api/**`) — frontière publique du projet, souvent sans autre filet.

### Frontières externes de la stack

Dépendances à un contrat qu'on ne maîtrise pas : elles cassent sans qu'aucune ligne du dépôt ne bouge, donc aucun signal interne (churn, branches, blast radius, commits de fix) ne les remonte jamais. Détection par le manifeste (`package.json`), par les scripts chargés dans le `<head>`/layout, et par tout client HTTP visant un domaine que le projet ne possède pas.

- **Mesure et marketing** — Meta Pixel et Conversions API (`react-facebook-pixel`, `fbq`, appels `graph.facebook.com`), Google Tag Manager / gtag / GA4 (`@nuxtjs/gtm`, `vue-gtag`, conteneur `GTM-*`), Klaviyo, Brevo (ex-Sendinblue), Hotjar, Segment. Meta est le cas d'école : ses librairies changent de majeure et ses schémas d'événement évoluent côté serveur, sans préavis exploitable par le dépôt.
- **Paiement** — `@stripe/stripe-js`, `stripe`, PayPal, Mollie, Adyen : SDK versionné côté client **et** contrat d'API côté serveur, les deux pouvant bouger séparément.
- **Clients d'API sortants** — `fetch`/`axios`/`ofetch` vers un domaine tiers, webhooks émis, SDK d'un fournisseur d'auth (Auth0, Clerk, Firebase Auth côté contrat réseau), n'importe quel `baseURL` qui n'est pas le projet.

Ce qu'un test peut y prouver, en `contract` et sans appeler le fournisseur : que la charge utile construite est bien celle qu'on croit envoyer, et que le **chemin dégradé** tient quand le fournisseur échoue, renvoie un schéma inattendu ou ne renvoie rien. Ce qu'il ne peut pas prouver : que le fournisseur accepte encore cette charge utile — cela relève de la surveillance, pas de la suite. Plafond de coût et arbitrage : voir `phase-framework.md` côté `control`.

Structurellement sans test propre — un gap sur ces éléments ne se propose pas :

- Pass-through de framework : composant qui ne fait que relayer props/slots, wrapper qui délègue sans transformer.
- Getters Pinia triviaux, computed de renommage, accesseurs sans logique.
- Glue générée, réexports de barrel, objets de configuration statiques.

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
- **Rapport de coverage supprimé par un test rouge (Vitest/Jest)** — `coverage.reportOnFailure` vaut `false` par défaut : dès qu'un test échoue, aucun rapport n'est écrit, y compris pour les fichiers dont les tests passent. Un projet correctement outillé paraît alors dépourvu de coverage. Détection : le script de coverage tourne, sort en échec, et `coverage/` ne contient aucun fichier plus récent que le run. Fix : ajouter `--coverage.reportOnFailure` (Vitest) ou lire le rapport partiel produit avant l'échec (Jest), et ne jamais déduire « pas d'outillage » d'un run rouge.
- **Fichiers non testés absents du rapport** — sans `coverage.include` (Vitest) ni `collectCoverageFrom` (Jest), seuls les fichiers effectivement importés par un test figurent au rapport : les modules les moins testés, donc les plus à risque, en disparaissent purement et simplement. `coverage.all` ayant été supprimé en Vitest 4, `include` est le seul mécanisme. Détection : comparer le nombre d'entrées du rapport au nombre de fichiers du `Source glob & exclusions` — un écart important signe l'absence d'`include`. Fix : déclarer `coverage.include` en config ; côté `strengthen`, traiter tout fichier du glob absent du rapport comme non couvert.
- **`pct` trompeur sur un fichier sans branche** — un fichier sans aucune branche conditionnelle affiche `branches.pct = 100` même quand aucune ligne n'est couverte. Un classement au pourcentage le déclare parfaitement couvert. Détection : `branches.total === 0` conjugué à `lines.covered === 0`. Fix : raisonner sur `covered`/`total`, jamais sur `pct` isolé.
- **Race sur les fichiers temporaires du provider v8** — un run de coverage peut échouer en `ENOENT … coverage/.tmp/coverage-<n>.json` sans qu'aucun test ne soit en cause (constaté sur Vitest 4.1.0). Détection : l'erreur remonte en « Unhandled Error » hors de tout fichier de test, et le run suivant passe à l'identique. Fix : relancer une fois avant de conclure quoi que ce soit ; ne pas interpréter cette erreur comme une absence d'outillage ni comme un test rouge.
- **Majeure de SDK tiers déplacée, aucun test ne touche l'intégration** — un `package.json` dont une dépendance de frontière externe (Meta, GTM, Klaviyo, Brevo, Stripe…) a changé de majeure, alors qu'aucun fichier du glob de test ne référence l'intégration correspondante. C'est la rupture la plus probable et la moins signalée : elle n'a produit aucun churn applicatif, aucun commit de fix, aucune branche non couverte. Détection : croiser les dépendances de frontière externe du manifeste avec `git log -- package.json` pour les changements de majeure, puis grep du nom du SDK dans le glob de test ; zéro occurrence = intégration sans filet. Fix : proposer le chemin dégradé (et la charge utile construite si elle porte un montant, une commande, une autorisation ou un consentement) via `strengthen` ; ne jamais proposer d'appeler réellement le fournisseur dans la suite.
- **Watch mode en CI** — script `test` qui lance `vitest`/`jest` sans `run`/`--ci` ne se termine jamais : ressemble à un hang, pas à un échec. Détection : `"test": "vitest"` (sans `run`) ou `"test": "jest"` (sans `--ci`). Fix : ajouter `run`/`--ci`.
- **Jest + ESM Nuxt/Vite** — Jest ne comprend pas nativement l'ESM que Vite/Nuxt produisent par défaut, ce qui impose une config de transform (`babel-jest`/`ts-jest`) lourde et fragile. Si Vitest est disponible sur le même projet, c'est un signal de dette d'outillage (double runner, transform superflue), pas une contrainte à documenter comme normale.
- **`waitForTimeout` (Playwright)** — attente arbitraire au lieu d'une attente d'état, flaky par construction. Détection : grep `waitForTimeout(` dans le glob E2E. Fix : `waitForLoadState`, assertion web-first `expect(locator)...`, ou `locator.waitFor()`.
- **Émulateur Firebase non démarré en CI** — des tests qui importent `@firebase/rules-unit-testing` mais dont le script CI ne lance pas `firebase emulators:exec`/`firebase emulators:start` échouent en connexion, ou pire, tapent silencieusement le vrai projet Firebase si `FIRESTORE_EMULATOR_HOST` n'est pas forcé. Détection : `@firebase/rules-unit-testing` en dépendance sans `emulators:exec` dans le script de test correspondant. Fix : envelopper le script concerné dans `firebase emulators:exec --only firestore,auth "vitest run ..."`.

## Canonical E2E tool

Playwright, quand détecté en devDependencies. Informationnel uniquement — `control` ne propose jamais de le remplacer.
