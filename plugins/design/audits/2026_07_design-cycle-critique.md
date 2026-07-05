# Audit — cycle design (5 skills), critique d'amélioration

- **Cible** : plugin `design` — les 5 verbes `define · destructure · adjust · enforce · diffuse` (+ réceptacle `sc-js:design-bridge`).
- **Méthode** : audit *expérientiel* — exécution complète du cycle sur un vrai projet (Nuxt 4 / Vue 3 / Tailwind v3, site personnel Scriptami), 2026-07-05. Chaque finding trace à un point de friction réel rencontré pendant le run.
- **Lentilles** : code-quality + architecture des skills. Read-only.
- **Verdict global** : l'entonnoir est cohérent et la séparation contrat/pivot est saine, mais le socle porte un fort **ADN BEM / maquette / WordPress** qui rend le chemin **utility-first (Tailwind/Vue/React) sous-servi** — l'enforcement à dents réelles n'existe que parce que je l'ai construit à la main dans le pivot.

## Findings (triés par sévérité)

| # | Sév. | Pilier | Emplacement | Problème | Correctif suggéré | Effort |
|---|------|--------|-------------|----------|-------------------|--------|
| 1 | **High** | code-quality | `enforce/adapters/lint-core.mjs:82-84` (`cssVarToTokenPath`) | `.replace(/-/g,'.')` mappe mal tout token à **groupe ou clé hyphénée** : `--color-semantic-grimoire-background` → `color.semantic.grimoire.background` ≠ token réel `color.semantic-grimoire.background`. Idem `rose-light`, `ink-deep`, `lineHeight`. → **faux "unknown token"**. M'a forcé à éviter ces vars dans le wireframe `diffuse`. | Dériver l'ensemble autorisé depuis les `--noms` réels de `adapters/tokens.css` (exacts) au lieu de reconstruire le path ; ou stocker un reverse-map path→varname au flatten. | S |
| 2 | **High** | architecture | `adjust/references/manifest-schema.md`, `enforce/adapters/lint-core.mjs:89-100` | Tout le contrat suppose **BEM / HTML écrit à la main**. Sur un projet utility-first, les classes BEM du manifeste **n'apparaissent jamais** dans le code → la concordance couche2↔code est fictive et la baseline `lint-core` est **quasi vacue** (prouvé : 0 hit `class-vocab` sur le code réel avant que je bâtisse le pivot). L'enforcement utile (usage tokens, hex bruts) n'existe **que** via le pivot que j'ai dû écrire. | Mode **utility-first** de première classe : la couche 2 encode des **règles d'usage de tokens** (namespaces couleur autorisés, hex brut interdit, état=couleur+icône) plutôt qu'un vocabulaire BEM. À livrer dans la baseline design, pas seulement dans `sc-js`. | L |
| 3 | **High** | architecture | `references/token-schema.md` (tout le fichier) | **Aucun modèle de thème/mode**. `tokens.json` est mono-valeur/token. Le projet a un dark mode par classe **+** un 2e territoire "Grimoire" ; je n'ai pu modéliser que le thème par défaut et j'ai dû jeter le dark mode en *Open questions* sans support contractuel. | Ajouter une dimension mode/thème au schéma (`$value` par mode, ou overlay `themes`) ; adapters émettant `.dark` / `[data-theme]`. | L |
| 4 | **Medium** | code-quality | `sc-js/skills/design-bridge/actions/01-realize-lint.md:54-74` | La règle-exemple ne visite que `JSXAttribute`/`className` (**React**). Sur un SFC Vue elle ne matche **rien** ; j'ai dû tout réécrire contre `vue-eslint-parser` (`defineTemplateBodyVisitor`, `VAttribute`). | Fournir la variante **Vue template** (la détection de framework existe déjà dans le SKILL) + variante `.vue`. | S |
| 5 | **Medium** | code-quality | `references/write-system-procedure.md:3,34` · `references/token-schema.md:83` | **Doc drift** : verbes supprimés (refonte 5-verbes, CHANGELOG:219) encore cités — "from-reference/from-brief", "next step `/design:wireframe` ou `/design:component`", bannière générée "Regenerate via /design:from-reference". `define/04-write-material` surcharge le next-step, mais le fichier partagé qu'il **référence** le contredit encore. | Remplacer par `define`/`destructure`/`diffuse`. | S |
| 6 | **Medium** | architecture | `references/token-schema.md:96-98` | **Biais Tailwind v4** (`@theme`). Le v3 n'a droit qu'à "emit a tailwind.config.js extend", mais l'artefact nommé du contrat est `adapters/theme.css` (inadapté à un config JS) → j'ai dû inventer `adapters/tailwind-theme.js` **hors contrat**, et ses valeurs doivent être **re-fusionnées à la main** dans `tailwind.config.ts` (l'adapter n'est pas consommé automatiquement). | Définir explicitement l'artefact adapter v3 (nom + câblage) et signaler l'étape de merge pour projets à config existante (Nuxt). | M |
| 7 | **Medium** | architecture | `adjust/actions/01-arbitrate.md:42-54` | La règle **"motif dominant ≥ 2/3 sources"** est dégénérée pour le cas courant : un seul `define` + pistes `destructure` → rien à voter. L'arbitrage se réduit à "appliquer les pistes acceptées" et la cérémonie de comptage ajoute du bruit. | Cas spécial **direction unique** (define+destructure) par défaut ; réserver le motif-dominant aux vrais inputs multi-maquettes. | S |
| 8 | **Low** | architecture | `enforce/actions/03-lint-instances.md`, `05-fidelity-gate.md`, `agents/copycat.md`, `references/wordpress-pitfalls.md` | **ADN WordPress/maquette** omniprésent (`wp post get`, oracle `measure.py` par breakpoint, copycat, BEM) — non pertinent pour une extraction *from-code*. Correctement *skippable*, mais domine la surface du skill et masque le chemin SPA. | Factoriser un track **"app JS moderne"** vs un track **"WP/maquette"** pour que chaque flux se lise proprement. | M |
| 9 | **Low** | process | `define/SKILL.md` (règle "core trio d'abord") | L'**approbation du core trio** n'est pas un vrai point d'arrêt : je l'ai présenté puis enchaîné immédiatement. Honor-system. | En faire un checkpoint réel, ou adoucir le libellé ("présenter, poursuivre sauf objection"). | S |

## Top actions (rang décroissant)

1. **#1 — corriger `cssVarToTokenPath`** (bug de correctness, effort S, débloque la fiabilité du gate token-ref). Quick win.
2. **#2 — mode utility-first de première classe** (le manque structurel : la valeur d'enforcement pour Tailwind/Vue/React doit vivre dans la baseline, pas être re-bâtie par chaque utilisateur).
3. **#3 — modèle de thème/mode dans le schéma de tokens** (dark mode = table stakes ; aujourd'hui non contractualisable).
4. **#4 + #5** — corriger l'exemple Vue du pivot et purger la doc-drift des verbes (deux S, crédibilité immédiate).
5. **#6** — clarifier le contrat adapter Tailwind v3.

## Ce qui marche (à préserver)

- **`destructure`** : lentilles excellentes ; a produit un vrai levier (le constat "2 mondes visuels / palette Grimoire non tokenisée" venait directement des lentilles). Le meilleur skill du lot.
- **Rejouabilité d'`adjust`** : le re-figeage additif (système de statut, bump mineur 1.0.0→1.1.0) a été propre et sans friction.
- **Contrat de pivot** (design = QUOI / sc-* = COMMENT) : séparation saine ; le pivot ESLint est exactement là où doit vivre l'enforcement idiomatique.
- **Invariant `diffuse`** (gate vert avant livraison) : bonne discipline, m'a forcé à produire un wireframe réellement conforme (exit 0).

## Coverage

- **Scannés** : code-quality + architecture des 5 skills design + réceptacle `sc-js:design-bridge`, par exécution réelle bout-à-bout.
- **Skippés** (N/A à un audit de définitions de skills, pas de runtime/deps propres en périmètre) :
  - `security`, `dependencies`, `performance`, `tests`, `ui` — sans objet sur des fichiers d'instructions Markdown + un linter Node de ~120 lignes. Non inventés.

---
*Read-only : ce rapport identifie et classe ; il ne modifie aucun skill. Chaque finding se corrige dans le plugin `design` (ou `sc-js`) à l'emplacement indiqué.*
