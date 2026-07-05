---
name: review-code
description: Code review report template for a diff
argument-hint: N/A
---

# Code Review: design — contract utility-first + dimension thème/mode

Deux lots additifs et rétrocompatibles (quick-win 1.10.0 + Part 1 du plan thème/mode 1.11.0) : correct, cohérents, gate exécutable vert ; quelques dérives doc↔implémentation et incohérences internes mineures, une seule à corriger avant merge.

- **Verdict**: changes-requested
- **Diff scope**: `main...design/contract-utility-first-theme` (working tree, non committé)
- **Date**: 2026_07_05
- **Findings**: 0 critical, 1 warning, 5 minor

Verdict: `approve` = no critical findings, ship it; `changes-requested` = warnings or a fixable critical to address first; `blocked` = a critical that must not merge.

## Expected changes

Ce que le diff devait livrer (dérivé du CHANGELOG + master/part-1) ; coché = réellement présent.

Lot quick-win (1.10.0) :
- [x] Fix mapping token→var dans `lint-core.mjs` (Règle 2 : forward-map chemin→var, plus d'inversion ambiguë)
- [x] Support `className=` (JSX/TSX) en plus de `class=` (Règle 1)
- [x] Mode `--strict` opt-in + champ `$utilityPrefixes` documenté au manifeste
- [x] Résorption dérive doc (verbes `from-reference`/`from-brief` → `define` ; règle kebab/camelCase)
- [x] Gate 0 (import `tokens.css`) câblé dans gate-wiring, wire-gates, SKILL, README, plugin.json
- [x] Étape d'arbitrage : cas « direction unique » saute la cérémonie de comptage
- [x] Multi-framework du linter natif (archétypes A/B/C) dans sc-js realize-lint

Lot Part 1 (1.11.0) :
- [x] Section « Modes / themes » (overlay `themes`, invariant, rétrocompat, exemple) dans token-schema
- [x] Émission theme-aware (`.dark` / `[data-theme]`) documentée pour `tokens.css`
- [x] `Themes:` ajouté aux specs enforcement + render de sc-pivot-contract
- [x] Fixtures `themed/` + `themed-{clean,dirty}.html` ; success_condition vert (exit 0 / exit 1) — revérifié
- [x] Audit overlays au freeze (1d) + table de bump ; invariant contraste par thème (6)
- [x] Bump `plugin.json` 1.11.0 + entrées CHANGELOG 1.10.0 & 1.11.0 en phase

## Findings

| Sev | Category    | Location                                                                 | Issue                                                                                                                                                                                                                                     | Suggested fix                                                                                                                                             |
| --- | ----------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟡  | standards   | `plugins/sc-js/skills/design-bridge/actions/01-realize-lint.md:179`      | Le hook pre-commit grep `.js` **inconditionnellement**, en contradiction directe avec la règle posée l.154 (« Ne pas enrôler `.js` si le projet n'a pas de vanilla… sinon faux positifs »). Un projet sans archétype B verra soit le hook casser (`design/class-vocab` non résolu pour `.js`), soit du JS applicatif linté à tort. | Conditionner l'inclusion de `.js` à la détection d'une cible vanilla (archétype B), ou retirer `.js` du grep par défaut et le documenter comme opt-in, cohérent avec le bloc `files` ESLint. |
| 🟢  | code-health | `plugins/design/skills/enforce/adapters/lint-core.mjs:99`                | `flattenTokenPaths` parcourt aussi le sous-arbre `themes.*`, injectant des vars synthétiques `--themes-<nom>-…` dans `validVars`. Ces vars ne sont **jamais émises** par l'adaptateur (qui réutilise `--color-…` dans `.dark`) : une référence themée typotée coïncidant avec un chemin synthétique passerait le lint (faux négatif). Documenté comme « inoffensif » mais c'est une réelle expansion de l'ensemble accepté. | Exclure la clé `themes` lors du flatten pour `validVars` (`flattenTokenPaths` sur `tokens` sans `themes`), ou valider la couverture des overlays séparément — au lieu de rationaliser l'angle mort en commentaire. |
| 🟢  | standards   | `plugins/design/skills/adjust/references/manifest-schema.md:63`          | L'invariant 6 (contraste WCAG AA « résolu dans le thème du variant ») et la ligne « Consommation par enforce » décrivent une vérification de contraste/fond que `lint-core.mjs` **n'implémente pas** (le core ne fait que vocab de classes + références var). Élargit une dérive doc↔impl préexistante. | Préciser que le contraste/fond relève du gate de fidélité (`measure.py`) ou d'une revue manuelle — pas du linter portable statique ; ou implémenter la règle. |
| 🟢  | code-health | `plugins/design/skills/enforce/references/gate-wiring.md:77`             | La variable du hook reste nommée `CHANGED_HTML` alors qu'elle collecte désormais `.astro/.vue/.jsx/.tsx/.svelte` ; l'`echo` a été mis à jour (« component files ») mais pas l'identifiant → nom trompeur. | Renommer `CHANGED_HTML` → `CHANGED_FILES` (idem l.79, l.85). |
| 🟢  | code-health | `plugins/design/audits/2026_07_design-cycle-critique.md:1`               | Un document d'audit/critique interne est placé **sous l'arbre distribuable du plugin** (`plugins/design/audits/`) : il sera embarqué chez tout utilisateur installant le plugin. Fichier non suivi mais listé comme livrable du lot. | Relocaliser vers `aidd_docs/` (hors package plugin) ou l'exclure de la distribution. |
| 🟢  | code-health | `plugins/design/skills/enforce/adapters/lint-core.mjs:11`               | `process.argv.includes('--strict')` scanne l'argv complet (indices 0/1 = node + chemin script) alors que `args` utilise `slice(2)` — incohérence cosmétique de source de vérité pour le même flag. | Dériver `strict` du même `slice(2)` : `const raw = process.argv.slice(2); const strict = raw.includes('--strict');`. |

## Coverage

- **Scanned**: standards, architecture, code-health, error-handling, frontend
- **Not applicable**: security (n/a — pas d'entrée réseau/authz ; le seul JS est un scanner de fichiers local, entrées = chemins CLI), performance (n/a — linter one-shot sur petits fichiers, aucune boucle chaude introduite), backend (n/a — aucun code serveur/DB dans le diff)

## Follow-up

- **Top fixes** (ranked, hand off to `aidd-dev:07-refactor`):
  1. 🟡 `01-realize-lint.md:179` — aligner l'inclusion `.js` du hook pre-commit sur la règle conditionnelle vanilla (seul point à traiter avant merge).
  2. 🟢 `lint-core.mjs:99` — exclure `themes.*` du flatten `validVars` (supprime l'angle mort de faux négatif thémé).
  3. 🟢 `manifest-schema.md:63` — clarifier l'ownership du contrôle contraste/fond (fidélité vs linter).
  4. 🟢 `gate-wiring.md:77` — renommer `CHANGED_HTML`.
- **Notes**:
  - success_condition Part 1 revérifié localement : exit 0 sur `themed-clean.html`, exit 1 sur `themed-dirty.html` (contrat `fixtures/themed`) ✓ ; fixtures existantes non re-testées ici (hors demande).
  - Dérive doc `from-reference`/`from-brief` : les occurrences restantes (`define/02-extract.md`, `03-construct.md`, `define/SKILL.md`, `plugin.json`) sont des mentions **historiques** légitimes (« l'ancien from-reference », « Replaces: … ») — pas des liens de commande morts. Cleanup effectivement complet côté références actives.
  - Cohérence de version : `plugin.json` 1.11.0, CHANGELOG 1.10.0+1.11.0, terminologie « 4 gates » propagée (SKILL, README, plugin.json) — en phase. Aucun résidu « 3 gates » réel (le hit `critique-lenses.md` = « 3 composants », faux positif grep).
  - Le linter reste fidèle au principe « aucune valeur codée en dur » : validVars et validClasses dérivent intégralement du contrat ; le support thème n'introduit aucune règle par thème côté vocabulaire (conforme à la décision A2).
  - Avertissements git CRLF→LF sur les fichiers touchés : cosmétique (normalisation EOL au prochain touch), sans impact.
