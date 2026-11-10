---
type: plan
statut: livre
parent: 2026_07_30-10-pivots-testing-fournisseurs-master.md
part: 5
objective: "Ecrire les pivots testing de sc-php et sc-css, en creant d'abord l'arbre capabilities absent de sc-css, et cloturer le manifeste"
success_condition: "test -f plugins/sc-php/skills/sniff/references/capabilities/tools/testing.md"
success_condition_amende: "La seconde clause — test -d plugins/sc-css/.../capabilities — est retiree : elle presupposait la reponse a la question (ii) que la phase 2 avait pour objet de trancher, et que le corps du plan (l. 23) declare explicitement ouverte. Un critere de succes qui impose le resultat d'une phase d'arbitrage n'arbitre plus rien. Verdict de la phase 2 : pas de pivot CSS, arbre non cree."
iteration: 0
created_at: 2026-07-30T13:30:51Z
depends_on: [2, 4]
---

# Part 5 — Pivots `sc-php` et `sc-css`, cloture

## Feature

Deux derniers fournisseurs, de difficulte tres inegale.

**`sc-php`** (0.9.0) — arbre `capabilities/` existant, 5 dossiers, 10 fichiers, dont un `testing/bruno.md`. Il manque `testing.md`. Cas ordinaire.

**`sc-css`** (0.3.3) — **aucun `skills/sniff/references/`, aucun `capabilities/`** : la skill `sniff` compte 3 fichiers. Son `02-install-pivots.md` declare pourtant **6 pivots dont 0 existe sur disque**. Deux questions distinctes : (i) creer l'arbre, (ii) un pivot `testing` a-t-il seulement un sens en CSS ?

La question (ii) est reelle. Le contrat demande un runner de tests, un compte de tests, une couverture par fichier. CSS n'a pas de runner de tests natif ; ce qui s'en approche, ce sont les tests de regression visuelle, qui sont des tests **E2E d'un projet**, pas des tests de la stack CSS. **Conclure « pas de pivot legitime » est une sortie autorisee** de cette part — le contrat prevoit l'absence, et un pivot creux vaut moins qu'un pivot absent.

## Projection d'architecture

**Cree**
- `plugins/sc-php/skills/sniff/references/capabilities/tools/testing.md` — ✅ livre
- `plugins/sc-css/skills/sniff/references/capabilities/` — l'arbre, **si** (ii) conclut qu'un pivot a un sens → ❌ **non cree**, (ii) conclut que non
- `plugins/sc-css/skills/sniff/references/capabilities/tools/testing.md` — idem → ❌ **non cree**

**Modifie**
- `plugins/sc-php/CHANGELOG.md` — `sc-php` 0.9.0 → **0.10.0** ✅
- `plugins/sc-php/.claude-plugin/plugin.json` — **non projete**, mais le manifeste du plugin porte lui aussi la version ✅
- ~~`plugins/sc-css/CHANGELOG.md` — `sc-css` 0.3.3 → **0.4.0** (si pivot livre)~~ → pivot non livre, `sc-css` **reste en 0.3.3**, CHANGELOG intouche
- `.claude-plugin/marketplace.json` — bumps + `marketplace` ~~3.6.0 → 3.7.0~~ → **3.9.0 → 3.10.0** (les chiffres du plan datent d'avant les parts 2 a 4)
- `CHANGELOG.md` (racine) — **non projete** : entree `[3.10.0]` due par la convention de bump ✅
- ~~`version.txt`~~ → voir Supprime

**Supprime**
- `version.txt` — **decide en phase 3** : supprime plutot qu'aligne, aucun consommateur dans le depot.
- `capabilities/testing/bruno.md` de `sc-php` reste ou il est (pivot Bruno, autre nature) — inchange comme projete.

## `sc-php` — points a etablir

- *Test runner(s)* — PHPUnit et/ou Pest ; detection par `composer.json` et par la presence de `phpunit.xml`.
- *Test file glob* — `tests/**/*Test.php` ; le suffixe `Test` est la convention PHPUnit, Pest diverge.
- *Coverage command* — necessite **Xdebug ou PCOV** : comme pour Rust, l'outil peut manquer, et le champ doit le detecter. `--coverage-clover` pour un rapport machine-lisible par fichier, produit **hors gate**.
- *Source glob & exclusions* — `vendor/` jamais classifiable ; en WordPress, `wp-admin/`, `wp-includes/`, les themes et plugins tiers.
- *Anchor boundary* — la frontiere reelle est la requete HTTP servie par un vrai serveur ; ce qui n'ancre pas : `WP_UnitTestCase` (in-process, base de test), un double de `wpdb`.
- *Risk signals* — paiement, auth, requetes SQL construites a la main, `unlink`/suppression, options globales ; frontieres externes detectees dans `composer.json` et dans les appels `wp_remote_*`.
- *Domain resolution* — arbres `src/<Domaine>/`, PSR-4 dans `composer.json`, suffixes `<Domaine>Controller`/`<Domaine>Repository`.

Une fixture PHP/WordPress reelle existe sur le poste (projet Mauceri) et peut servir a la verification. **Lecture seule, dry-run.**

## Phases

### Phase 1 — `sc-php` ✅
- [x] Verifier chaque commande contre un projet PHP reel — **trois terrains, pas un**, parce que la stack couvre deux mondes sans intersection. Le terrain prevu par le master (`scriptami/_code/wp-2026`) s'est revele **sans aucune infrastructure de test PHP** : 0 `composer.json`, 0 PHPUnit. Retenus : `site-a/_code/modules` (PrestaShop 8, neuf modules, PHP 8.4.11 / Composer 2.8.2 / PHPUnit 10.5.63, **deux suites executees de bout en bout** — 46 et 29 tests), `mauceri/_code` (WordPress complet en depot, 1640 fichiers PHP) et `wp-2026` comme contraste de layout. Lecture seule tenue : caches rediriges vers le scratchpad, `git status --porcelain` identique avant/apres sur chaque module touche.
- [x] Rediger les 10 sections — `plugins/sc-php/skills/sniff/references/capabilities/tools/testing.md`, **en anglais** (langue des dix autres fichiers `capabilities/` du plugin), titres verbatim du contrat, **aucune table de correspondance due**. Frontmatter vide : un `paths:` le ferait charger a chaque edition `.php`, or il ne decrit pas une famille de fichiers mais une suite.
- [x] Relire contre le contrat **tel qu'amende par la part 4** — clause de prerequis (DEC-009) appliquee au champ *Coverage command* avec sa commande de constat ; clause de non-disjonction non due, PHP separant source et test au fichier (dit en une ligne pour que le consommateur ne l'infere pas du silence).
- **Critere d'acceptation** : ✅ les dix questions sont repondables en lisant le seul pivot.

**Cinq constats mesures que le pivot porte, et qu'aucun pivot precedent ne pouvait porter** :
1. **La couverture echoue en silence.** Sans driver, `phpunit --coverage-clover` avertit, affiche `OK, but there were issues!`, **sort 0** et **n'ecrit aucun fichier**. Un consommateur qui lit le code de retour croit avoir reussi. Contraste net avec Rust, ou l'absence d'outil sort en `no such command`.
2. **`phpdbg -qrr` ne fournit plus de couverture** en PHPUnit 10 — conseil tres repandu, mesure faux.
3. **L'unite de mesure est le composant, pas le depot** : neuf modules, neuf depots git, neuf `vendor/`, **aucune commande racine**. Une mesure lancee a la racine rend zero test sur un projet qui en porte 225.
4. **`tests/**/*.php` sur-compte** — `AbstractServiceTestCase.php` est une classe de base ; le suffixe `Test.php` discrimine, pas le repertoire.
5. **Un `vendor/bin/phpunit` present peut etre mort** (autoloader regenere sans les dev deps, `vendor/phpunit/` reste sur disque) — constat fiable dans `installed.json`, pas sur l'existence du binaire.

### Phase 2 — `sc-css` : trancher avant de creer ✅ — **verdict : pas de pivot**
- [x] Repondre a (ii) par un decompte champ par champ — table ci-dessous, adossee a cinq depots reels (74 fichiers `.css` hors `node_modules`, **zero outillage de test CSS** : ni stylelint, ni BackstopJS, ni harnais de regression declare dans un `package.json`).
- [x] Ne rien creer — `sc-css` reste en **0.3.3**, `skills/sniff/references/` reste absent. Motif ecrit ici et publie sur l'issue #10.
- [ ] ~~Si oui : creer l'arbre puis le pivot~~ — branche non prise.
- **Critere d'acceptation** : ✅ decision adossee au decompte, pas a une impression.

#### Decompte des 10 champs sur la stack CSS

| # | Champ | Requis ? | Reponse reelle ? | Motif |
|---|---|---|---|---|
| 1 | Test runner(s) | **requis** | ❌ | Aucun outil n'execute du CSS. Ce qui s'en approche — la regression visuelle — execute des **pages** et appartient a la stack JS (mesure : harnais `tools/qa/*.mjs`, Playwright). |
| 2 | Test file glob | **requis** | ❌ | Il n'existe pas de fichier de test CSS. Mesure amusante et probante : la seule occurrence de `test` dans un nom de `.css` du terrain est `mau-testimonials.css`. |
| 3 | Test-count command | **requis** | ❌ | Sans population, pas de decompte. |
| 4 | Coverage command | optionnel | ❌ | `page.coverage.startCSSCoverage()` existe, mais mesure les regles **utilisees au chargement d'une page**, pas les regles couvertes par un test — et c'est une API Playwright. Repondre ca, c'est repondre a une autre question sous le titre du champ. |
| 5 | Source glob & exclusions | optionnel | ✅ | `**/*.{css,scss,less}` ; exclusions `node_modules/`, `vendor/`, `dist/`, `build/`, `*.min.css`, sortie de preprocesseur ou de Tailwind. **Seul champ qui recoit une reponse propre a la stack et non deja fournie ailleurs.** |
| 6 | Anchor boundary | optionnel | ❌ | Le champ separe deux natures de preuve **dans une suite**. Il n'y a pas de suite. La connaissance voisine (seul un vrai navigateur applique la cascade et calcule les valeurs) qualifie la preuve d'une **page**, produite par un harnais JS. |
| 7 | Risk signals | optionnel | ⚠️ redondant | Les signaux existent, mais `sc-css:audit#01-audit.md:11-16,50` les porte **deja**, et plus finement qu'un pivot ne les resumerait : specificite calculee correctement (`:where()` = 0), verdict `!important` conditionne a la topologie de layer *mesuree*, contraste non calculable declare plutot que fabrique. Et l'inventaire « lu dans un manifeste » n'a pas d'objet : CSS n'a pas de manifeste. |
| 8 | Known tooling gotchas | **requis** | ❌ | Le champ demande les pieges de l'outillage **de test** de la stack. Aucun outillage de test → aucun piege. Les pieges de build (ordre des `@layer`, purge Tailwind) ne sont pas ce champ. |
| 9 | Domain resolution | optionnel | ⚠️ redondant | BEM / ITCSS / utility-first sont bien la reponse — mais `sc-css:sniff#01-scan.md:12-15,23` **classifie deja l'architecture** (`bem | utility | modules | itcss | adhoc`) et l'emet dans son pivot manifeste. Le meme plugin fournit deja l'information, sous une autre forme. |
| 10 | Canonical E2E tool | **requis** | ❌ par renvoi | La regression visuelle est l'E2E de facto du CSS, mais l'outil est celui de la stack JS. Repondre « Playwright » ferait dire a un pivot CSS ce qu'un pivot JS dit deja, **a propos de fichiers qui ne sont pas les siens** — exactement ce que DEC-008 interdit (« un champ est resolu par le pivot de la stack a laquelle le fichier appartient »). |

**1 reponse reelle sur 10, et 0 sur les 5 champs requis.** Un pivot dont aucun champ requis n'aboutit n'est pas un pivot a moitie rempli : c'est un fichier qui repond a des questions qu'on ne lui pose pas.

**Le livrer couterait plus qu'il ne rapporterait, et c'est l'argument decisif.** Par la regle d'union de DEC-008, l'univers source d'un run est l'union des *Source glob* contribues. Un pivot CSS y ferait entrer les fichiers `.css` — 62 sur le seul terrain WordPress — alors que la population de tests qu'il contribue est **vide par construction**. Le run rendrait « stack CSS : 0 test / 62 fichiers source », un zero qui n'est le defaut de personne. Sans pivot, le contrat § *Absence* impose de dire « cette stack a tourne non raffinee » : c'est plus vrai, et c'est deja ce qui se passe aujourd'hui.

**Ce qui reste a faire, et qui n'est pas ce chantier** : si la resolution de domaine CSS merite d'etre ecrite pour les consommateurs qui lisent *Domain resolution*, sa place est une capability `sc-css` ordinaire sous `skills/sniff/references/capabilities/`, **pas** un fichier nomme `testing.md` — que la decouverte `**/capabilities/**/testing.md` chargerait comme fournisseur de la stack pour les dix champs, dont les huit qu'il ne remplit pas.

### Phase 3 — Coherence du manifeste ✅
- [x] `marketplace.json` : `sc-php` 0.9.0 → **0.10.0**, racine 3.9.0 → **3.10.0**. ⚠️ Le plan projetait `3.6.0 → 3.7.0` : chiffres perimes, ecrits avant les parts 2 a 4 qui ont porte le marketplace a 3.9.0.
- [x] `version.txt` (3.1.0) — **supprime**, pas realigne. Motif : **aucun fichier du depot ne le lit** (verifie), il avait diverge de six mineures, et rien ne le maintenait — le realigner le ferait rediverger au bump suivant. `.claude-plugin/marketplace.json` reste la seule source de verite.
- [x] `index.json` inchange — verifie : **zero occurrence** de `version` dans le fichier.
- **Critere d'acceptation** : ✅ une seule source de verite. Arbre **non commite** (regle projet : pas de commit sans demande) — l'exigence « `git status` propre avant tout install » vaut donc au moment de l'install, et aucun install n'a ete lance.

### Phase 4 — Cloture ✅
- [x] Relecture croisee des **4** pivots livres (et non 5 — la phase 2 en a retire un). Meme emplacement `skills/sniff/references/capabilities/tools/testing.md`, memes 10 titres verbatim, meme frontmatter vide. **Une divergence trouvee et corrigee** : `sc-php` ordonnait *Anchor boundary* avant *Risk signals* — l'ordre du contrat — la ou les trois autres font l'inverse. Le contrat n'imposant aucun ordre, `sc-php` a ete aligne sur la majorite : les quatre pivots sont desormais strictement homogenes, aucune divergence residuelle a declarer entre eux.
- [x] Issue #10 mise a jour (commentaire date) : item 1 deja fait avant ce plan, sort de `sc-css`, `sc-godot` hors perimetre avec son motif.
- **Critere d'acceptation** : ✅ `find plugins -name testing.md -path '*capabilities*'` rend **4** (`sc-js`, `sc-php`, `sc-python`, `sc-rust`). Les deux absences restantes ont chacune un motif ecrit : `sc-css` par decompte (phase 2), `sc-godot` parce que le plugin est un squelette sans skill portee et sans terrain de mesure disponible — ecrire un pivot pour une stack dont aucun projet n'est mesurable produirait exactement le pivot documentaire que les quatre autres ont evite.

## Risques

| Risque | Mitigation |
|---|---|
| Fabriquer un pivot CSS creux pour cocher la case | Phase 2 : decompte des champs reellement repondus, sortie « pas de pivot » autorisee |
| Les faux pivots declares de `sc-css` sont traites ici | Hors perimetre (#11) sauf ce que la creation de l'arbre impose |
| `version.txt` re-diverge | Trancher : source unique, ou suppression |
| Pivots incoherents entre eux apres 5 redactions successives | Phase 4 : relecture croisee obligatoire |

## Log

| Date | Evenement |
|---|---|
| 2026-07-30 | Cree |
| 2026-07-30 | Phase 1 — terrain : le projet prevu par le master (`wp-2026`) est **sans infrastructure de test PHP** (0 `composer.json`). Bascule sur `site-a/_code/modules` (PrestaShop, PHPUnit 10.5.63) + `mauceri/_code` (WordPress) + `wp-2026` en contraste. Deux suites executees, 46 et 29 tests. |
| 2026-07-30 | Phase 1 — `plugins/sc-php/skills/sniff/references/capabilities/tools/testing.md` livre, 10 sections, anglais. Fait neuf : la stack **n'a pas de point d'entree unique**, la mesure est par composant. Couverture sans driver = avertissement + **exit 0** + aucun fichier ecrit. |
| 2026-07-30 | Phase 2 — decompte CSS sur 5 depots (74 `.css`, 0 outil de test) : **1 champ sur 10, 0 sur les 5 requis**. Verdict **pas de pivot**, arbre non cree, `sc-css` reste 0.3.3. `success_condition` amende en consequence (voir frontmatter). |
| 2026-07-30 | Phase 3 — `sc-php` 0.10.0, marketplace 3.10.0, `version.txt` **supprime** (0 consommateur), `index.json` verifie sans version. |
| 2026-07-30 | Phase 4 — relecture croisee des 4 pivots : divergence d'ordre de sections dans `sc-php` corrigee (Risk avant Anchor, comme les 3 autres). `rtk pnpm test` vert : 71 skills, 0 probleme. Issue #10 commentee. |
| 2026-07-30 | Part 5 livree. **Non commite** (regle projet : pas de commit sans demande). |
