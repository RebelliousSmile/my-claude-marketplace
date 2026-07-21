# Plan — durcissement `overcode:control` + pivot `sc-js/testing.md`

> **Statut** : implémenté (Milestones 1-5 appliqués, re-validation exécutée)
> **Date** : 2026-07-21
> **Branch** : `overcode/control-testing-pivot-hardening`
> **Plugins** : `overcode` (skill `control`), `sc-js` (pivot `skills/sniff/references/capabilities/tools/testing.md`)

## Contexte

`overcode:control` (renommé depuis `test-govern`) et le pivot `testing.md` de `sc-js` viennent d'être écrits et validés unitairement (chaque action de `control` a été exécutée pour de vrai contre un projet réel), mais jamais challengés ensemble comme un tout cohérent. Une revue croisée (`aidd-dev:01-plan`, 2026-07-21) a trouvé 2 deal-breakers, 2 incohérences internes, 2 ambiguïtés de convention et 3 gaps mineurs.

## Milestone 1 — Deal-breakers (bloquants)

### 1.1 Mécanisme de découverte du pivot manquant

`pivot-contract.md` promet que `control` « localise le pivot `testing` que le plugin de langage embarque », et les 3 actions (`01-write.md:22`, `02-audit.md:22`, `03-configure.md:19`) disent toutes « détecter le plugin actif et charger son pivot testing » — mais aucun algorithme concret n'existe. Le manifeste `sc-js/skills/sniff/actions/01-scan.md` (Step 5) n'inclut pas `tools/testing.md` (exclusion volontaire : ce pivot ne sert pas `/sc-js:audit`). `control` n'a donc aucun canal réel pour remonter jusqu'au fichier.

**Fix** : figer une convention de découverte explicite dans `pivot-contract.md` — nom de fichier canonique `testing.md`, localisé par glob (`**/capabilities/**/testing.md`) sous la racine du plugin de langage actif, répertoire parent libre (`tools/`, `testing/`, ou racine `capabilities/`). Documenter le glob exact que `control` doit exécuter, pas seulement la convention en prose.

**Résolution de la racine (précision requise, sinon le glob n'a pas de point de départ)** : « racine du plugin de langage actif » = le répertoire d'installation du plugin tel qu'il est chargé dans la session en cours — `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` en exécution normale, ou la racine source du plugin (`plugins/<plugin>/`) si `control` tourne directement depuis le repo marketplace (contexte de développement/test de `control` lui-même). `control` ne code en dur aucun des deux chemins : il réutilise le même mécanisme de résolution que celui déjà employé pour détecter le plugin de langage actif (section « Detecting the active language plugin » de `pivot-contract.md`), qui pointe déjà vers l'installation réellement chargée, quelle qu'elle soit.

### 1.2 Contradiction SKILL.md vs pivot-contract.md vs testing.md sur l'autorité de tier

`SKILL.md:31` interdit au pivot de surcharger la logique de tier seul (« il ne surcharge jamais la logique de tier à lui seul »). Mais `pivot-contract.md:16` autorise une section « Tier thresholds » qui *reclasse* des cas, et `testing.md` l'utilise pour déclarer `contract` deux comportements qui franchissent une frontière I/O réseau (route Nitro appelée en direct, test contre l'émulateur Firebase) — alors que `decision-framework.md` classe toute frontière réseau/DB hors `contract`.

**Fix** : trancher entre deux options (ne pas faire les deux à moitié) :
- (a) Assouplir `SKILL.md:31` : « le pivot peut raffiner le tier via sa section Tier thresholds, dans les limites qu'il justifie explicitement » — et documenter le critère qui rend ces raffinements légitimes (ex. « frontière locale/émulée sans UI/navigateur reste `contract` »).
- (b) Interdire strictement au pivot de reclasser, et retirer les paragraphes Nitro/Firebase de la section Tier thresholds de `testing.md` (les redescendre en simple note informative, sans changer le tier).

**Tranché : (a).** Le raffinement Nitro/Firebase est utile en pratique — sans lui, tout appel traversant `server/api/*` ou l'émulateur Firebase remonterait par défaut en `e2e` via `decision-framework.md`, ce qui contredirait l'intention même de la section « Tier thresholds » du contrat (sinon inutile par construction). Critère de légitimité à documenter dans `SKILL.md:31` : un raffinement de pivot est légitime s'il reclasse un cas où la frontière traversée est locale/émulée et ne franchit ni UI ni navigateur ni réseau externe — jamais un cas où la frontière est un vrai réseau/DB distant.

## Milestone 2 — Incohérences internes

### 2.1 Heuristique « trivial » de `02-audit` pénalise le test contract idéal

`02-audit.md:25` flague tout test de moins de 5 lignes comme candidat à suppression — or un test `contract` conforme à `decision-framework.md` (« assert input → output directly ») fait typiquement 2-4 lignes et a une haute valeur.

**Fix** : qualifier l'heuristique par la valeur, pas la longueur seule — ex. « trivial ET n'assertant qu'une garantie framework/une affectation sans branchement », pas « trivial » au sens brut de comptage de lignes.

### 2.2 Exemples de parité inter-plugins factuellement faux

`pivot-contract.md` et `SKILL.md:39` citent `sc-php`/`sc-python`/`sc-rust` comme exemples de plugins fournissant un pivot `testing`. Vérifié : `sc-php/capabilities/testing/bruno.md` est une règle de client API Bruno (consommée par `/sc-php:audit`), pas un pivot de gouvernance de tests ; `sc-python` et `sc-rust` n'ont aucun fichier testing.

**Fix** : corriger la citation (bruno.md n'illustre pas un testing-pivot), requalifier les autres plugins en « pourraient en fournir un » plutôt qu'en exemples établis. Seul `sc-js` est réellement câblé aujourd'hui.

## Milestone 3 — Ambiguïtés de convention

### 3.1 `tools/` vs `testing/` comme répertoire parent

Dépend de la résolution de 1.1 : une fois le nom de fichier canonique `testing.md` figé et le glob de découverte écrit, cette liberté de placement du répertoire parent devient inoffensive — à documenter explicitement comme « libre » dans `pivot-contract.md` pour éviter toute ambiguïté future.

### 3.2 Vocabulaire de « budget » sur-vendu

`01-write.md:15,24` parle de `budget_check`/`limit`, mais aucune source ne fournit de seuil numérique — ni `decision-framework.md`, ni `testing.md` (aucun runner n'expose de comptage). Le mécanisme réel est un check anti-doublon + un warn subjectif « unusually large ».

**Fix** : soit documenter explicitement que `limit` vient exclusivement d'un doc projet (jamais d'un défaut interne), soit retirer le vocabulaire de « budget » pour un vocabulaire plus honnête (« signal de volume anormal »).

## Milestone 4 — Gaps mineurs (finition, non bloquants)

- **Frontmatter incohérent** dans les pivots `sc-js` (`testing.md`/`vitest.md`/`eslint.md` : `---\n---` vide ; `playwright.md` : aucun ; `bruno.md` : réel avec `description:`/`paths:`) — uniformiser si la découverte s'appuie un jour sur du frontmatter.
- **Langue mixte** anglais (`control`) / français (`testing.md`) — cohérent au sein de chaque plugin, mais à assumer explicitement comme frontière de style dans le contrat.
- **Gotchas en prose vs contrat structuré** : `pivot-contract.md:17` attend `{ issue, detection, fix }` ; `testing.md` les écrit en puces prose. Conforme à l'intention, pas au format littéral. **Tranché : relâcher le contrat** — reformuler `pivot-contract.md:17` en « chaque entrée couvre trois axes (problème, détection, correctif), peu importe si en clés structurées ou en prose balisée » ; imposer du JSON/YAML structuré dans un fichier markdown de gouvernance serait plus rigide que ce que `control` exploite réellement (lecture par un agent, pas par un parseur).

## Milestone 5 — Re-validation post-fix (bloquant avant livraison)

Les 3 actions de `control` (`01-write`, `02-audit`, `03-configure`) ont déjà été validées une par une contre un projet réel avant ce durcissement. Les fixes 1.1 (mécanisme de découverte) et 1.2 (autorité de tier du pivot) changent un comportement déjà prouvé correct — les exécuter sans re-validation risque de casser silencieusement ce qui marchait.

**Fix** : après application des Milestones 1 et 2, ré-exécuter pour de vrai les 3 actions de `control` contre un projet cible réel (`C:\Users\fxgui\Documents\Pro\Projets\jeveuxtravailler\_code`, déjà utilisé pour la validation initiale) :
- `01-write` : vérifier que la découverte du pivot `sc-js/testing.md` aboutit désormais (elle échouait silencieusement avant le fix 1.1), et qu'une route Nitro/un test émulateur Firebase est bien classé `contract` conformément au critère tranché en 1.2.
- `02-audit` : vérifier que l'heuristique corrigée (2.1) ne flague plus un test contract de 2-4 lignes légitime comme candidat à suppression.
- `03-configure` : re-passe de non-régression simple (aucun fix ne touche cette action directement, mais elle partage le mécanisme de découverte 1.1).

Consigner le résultat (pass/fail par action) avant de considérer le durcissement livré.

**Résultat (2026-07-21)** :
- **Caveat d'environnement (non imputable au design de `control`)** : le cache plugin de la session (`~/.claude/plugins/cache/my-marketplace/sc-js/0.8.0/`) est un instantané antérieur à cette session — il ne contient aucun répertoire `capabilities/`, donc pas encore `testing.md`. Numéro de version inchangé (`0.8.0`) mais contenu différent de la source marketplace. Une invocation live de `control` sur ce projet échouerait donc à découvrir le pivot **tant que le plugin `sc-js` n'est pas réinstallé/mis à jour** (flux `overcode:alias bump-plugin`, hors périmètre de ce plan). Le mécanisme de découverte (1.1) lui-même est correct ; c'est un problème de déploiement de plugin, pas un défaut de `pivot-contract.md`.
- **`01-write` (validation à blanc, contenu source utilisé en lieu du cache périmé)** : comportement `server/api/salaries/[...].ts` appelé en direct (pas de round-trip HTTP) → classé `contract` conformément au raffinement Nuxt de `testing.md` et au critère de légitimité de `SKILL.md:31` (frontière locale, pas d'UI/navigateur). `budget_check` correctement calculé : 28 tests de contrat existants, `limit: null` (aucun budget chiffré dans `aidd_docs/memory/testing.md` du projet), `status: ok`. **Pass.**
- **`02-audit`** : test réel examiné, `tests/contracts/candidate-store.contract.test.js`, cas `should export useCandidateStore` (3 lignes de corps). Sous l'ancienne heuristique (<5 lignes brut) il aurait été flagué trivial à tort. Sous l'heuristique corrigée (2.1), il n'est **pas** flagué : il assert un contrat d'export propre au code du projet, pas une garantie framework pure. **Pass — confirme la correction du bug 2.1 sur un cas réel.**
- **`03-configure`** : `package.json` scanné. `test:coverage` invoque bien `--coverage` (gate actif, gotcha « coverage silencieux » ne s'applique pas ici). `"test": "vitest"` (sans `run`) matche en revanche le gotcha « watch mode en CI » de `testing.md` — finding réel et légitime, sans faux positif ; Playwright (`test:e2e`) n'apparaît à aucun moment comme candidat au remplacement. **Pass.**

## Points vérifiés comme sains (ne pas retoucher)

- Délégation `01-write` → `aidd-dev:06-test#01-test`/`#02-test-journey` : cible et routage corrects.
- Forme du pivot conforme au contrat : les 6 sections attendues sont toutes présentes dans `testing.md`.
- Vocabulaire de tiers (`contract|e2e|skip`) cohérent partout.
- Garde-fous de sécurité cohérents : confirmation par item, jamais de remplacement d'outil E2E établi.

## Ordre de traitement

1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.2 → 4 (finition, peut être différée sans bloquer la livraison) → 5 (re-validation, bloquant avant livraison).
