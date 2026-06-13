---
name: code-review
description: Revue de l'infra de test (tools/eval/) + feature boucle review/PLATEAU → plan d'amélioration
argument-hint: N/A
---

# Code Review for : infra de test `tools/eval/` + boucle review/PLATEAU

Revue qualité du diff `325cc55~1..HEAD` (harness/coverage/behavioral + fixtures +
`review-loop.md` + câblage skills). Findings uniquement ; fixes **décrits**, non appliqués.

- Statuts: **à améliorer** — l'infra est fonctionnelle et verte, mais 1 défaut bloquant la reviewabilité + plusieurs fausses confiances.
- Confidence: **85%** (findings vérifiés par exécution ; F9/F10 relèvent d'une décision produit, pas d'un bug).

---

- [Main expected Changes](#main-expected-changes)
- [Scoring](#scoring)
- [Code Quality Checklist](#code-quality-checklist)
- [Final Review](#final-review)

## Main expected Changes

- [x] Harness déterministe structure brief→output (`harness.mjs`)
- [x] Couverture de routage par action (`coverage.mjs`)
- [x] Spec comportementale LLM-juge (`behavioral/`)
- [x] 4 fixtures golden + contrat ≥3 personas/styles
- [x] Feature boucle de review + PLATEAU (`review-loop.md` + câblage)

## Scoring

### 🔴 Bloquant

- [🔴] **Fichier source classé binaire par git** `tools/eval/harness.mjs:~32` — la définition `const NON_ASCII_RE = /[^\x00-\x7f]/;` contient un **octet NUL réel** (byte 1334) : l'écriture a converti `\x00` en U+0000 au lieu des 4 caractères littéraux. Conséquence : `git diff` affiche `Bin`/`-	-`, le fichier est **non reviewable** et non patchable en diff. Marche au runtime par chance (intervalle NUL→0x7f ≡ 0x00→0x7f). *Fix : redéfinir sans échappement hex converti — `const NON_ASCII_RE = /[^ -~]/;` (espace→tilde, plage ASCII imprimable) ou détecter via `[...name].some(c => c.codePointAt(0) > 0x7e)` ; ajouter `.gitattributes` avec `*.mjs text` pour forcer le traitement texte.*

### 🟡 Important

- [🟡] **Fausse confiance de `coverage.mjs`** `tools/eval/coverage.mjs:parseSkill` — le parsing de markdown libre rate les triggers non standard : `enforce`, `seo-optimize`, `web-optimize`, `adjust`, `diffuse` affichent « 0 action routable » et passent ✓ alors qu'ils **ont** des déclencheurs → le tool certifie « couvert » sans rien avoir testé. *Fix : avertir/échouer quand `actions.size > 0 && routable.length === 0` (heuristique « skill non trivial sans aucune action routable détectée → format suspect »), ou imposer une section « Trigger-to-action mapping » machine-lisible.*
- [🟡] **Front-matter faux-positif** `tools/eval/harness.mjs:FRONT_TYPE_RE/FRONT_LANG_RE` — le flag `/m` fait matcher `^---` **n'importe où** ; un doc avec un `---` thématique en milieu suivi d'un `type:` plus loin **passe** (vérifié : `true`). *Fix : exiger le bloc en tête — `/^---\r?\n/` ancré au tout début, lire jusqu'au `---` fermant, chercher `type:`/`language:` dans ce bloc seul.*
- [🟡] **Harness inutilisable sur un vrai projet** `tools/eval/harness.mjs:validateProjet` (check I1) — tout dossier racine non-`_` est flaggé, dont `.git`, `.vscode`, `.obsidian` (vérifié : `.git` → violation). *Fix : exempter les dotdirs (`if (d.startsWith('.')) continue;`).*
- [🟡] **Cas comportementaux non runnables** `tools/eval/behavioral/cases.json` — `persona-train-from-feedback` et `triage-*-3chapters` supposent « fantasy-novella enrichie de retours sur ≥3 chapitres », or la fixture n'a **qu'1 chapitre** et aucun retour accumulé. Les cas décrivent un input à fabriquer. *Fix : committer une fixture multi-chapitres avec `_output/review/` accumulé, ou marquer explicitement « input à construire » par cas.*
- [🟡] **Détection négative non versionnée** `tools/eval/` — la capacité du harness à **rejeter** les violations a été prouvée à la volée dans `$TEMP`, rien dans le dépôt ne garde contre une régression qui rendrait le harness permissif. *Fix : `tools/eval/fixtures-invalid/` + `tools/eval/selftest.mjs` qui exige `exit 1` sur chaque cas cassé.*

### 🟢 Mineur / amélioration

- [🟢] **Pas de runner ni gate enforced** racine — aucun `package.json`/script `test` ; les gates de CONTRIBUTING (« avant de pousser ») ne sont ni en pre-push hook ni en CI. *Fix : `package.json` minimal `"scripts": { "test": "node tools/eval/harness.mjs && node tools/eval/coverage.mjs" }` (cohérent pnpm) + workflow CI ou hook.*
- [🟢] **`validateScores` fragile** `tools/eval/harness.mjs:validateScores` — parse de table par `split('|')` (casse si une cellule contient `|`) ; un Δ malformé donne `NaN` affiché tel quel ; la 1re ligne ne vérifie pas `verdict==INITIAL` (seulement l'absence de Δ). *Fix : parse plus strict + garde NaN explicite.*
- [🟢] **Magic numbers de la boucle en prose** `plugins/writing/references/review-loop.md` — seuil PLATEAU `Δ<1.0`, garde `5 itérations`, triggers `≥3 chapitres` sont dispersés en texte, non centralisés ; le déclencheur `persona:train` à « ≥3 chapitres » est un **choix que j'ai introduit** (le schéma ne le spécifiait pas). *Fix : à valider avec l'auteur ; regrouper les seuils dans un encart « Constantes » de la réf.*
- [🟢] **Convention `expect_action` non tranchée** dépôt — mélange d'ids d'action (`restructure`) et de labels sémantiques (`build+wire`, `run`) ; `coverage` ne fait que les signaler en info. *Fix : décider (ids stricts == nom d'action) puis normaliser design + sc-*, ou documenter formellement les labels sémantiques comme admis.*

## Code Quality Checklist

### Potentially Unnecessary Elements
- [x] RAS — pas de code mort ; `contentFiles` justifié (dotfiles).

### Standards Compliance
- [ ] **Naming/format** — F1 (NUL) casse le traitement texte du fichier.
- [x] Style cohérent (mjs zéro-dép, commentaires FR alignés sur le dépôt).

### Architecture
- [x] Séparation nette des 3 couches (structure / routage / comportemental).
- [x] `review-loop.md` source unique référencée (DRY), pas de reduplication dans les SKILL.

### Code Health
- [x] Tailles de fichiers/fonctions raisonnables, complexité OK.
- [ ] **No magic numbers** — F9 (1.0 / 5 / 3 en prose).
- [ ] **Error handling** — F8 (NaN Δ), F3 (front-matter), F4 (dotdirs).

### Security
- [x] Aucun secret, aucun réseau, aucune exécution de contenu. Lecture FS seule. RAS.

### Error management
- [ ] Parsing markdown/JSON robuste — F2 (fausse confiance), F8.

### Performance
- [x] N/A — scan FS local, trivial.

### Frontend specific
- [x] N/A (outillage CLI).

### Backend specific (Logging)
- [x] Sorties lisibles (✓/✗ par check) ; exit codes corrects (0/1).

## Final Review

- **Score**: 🟡 **7/10** — infra solide et verte, mais F1 bloque la reviewabilité et F2/F3/F4 créent des angles morts (fausse confiance / faux positifs).
- **Feedback**: Les trois couches sont bien séparées et le déterministe fait son travail (positif + négatif prouvés). Le point dur est que `coverage.mjs` peut certifier « couvert » des skills qu'il n'a pas su lire (F2) et que `harness.mjs` est corrompu en binaire (F1). Ces deux-là d'abord.
- **Follow-up Actions** (plan d'amélioration, ordonné) :
  1. **F1** — déNULifier `NON_ASCII_RE` + `.gitattributes *.mjs text`. *(5 min, bloquant reviewabilité.)*
  2. **F2** — `coverage.mjs` : échec/avertissement si `actions>0 && routable==0`. *(évite la fausse confiance — le plus dangereux.)*
  3. **F3 + F4** — harness : ancrer le front-matter en tête + exempter les dotdirs. *(correctness + utilisabilité réelle.)*
  4. **F6 + F7** — `fixtures-invalid/` + `selftest.mjs` ; `package.json` script `test` + CI/hook. *(verrouille les gardes.)*
  5. **F5** — fixture multi-chapitres pour rendre les cas behavioral runnables.
  6. **F8** — durcir `validateScores`.
  7. **F9 + F10** — décisions produit : valider seuils + trigger `persona:train` ; trancher la convention `expect_action`.
- **Additional Notes**: F9/F10 ne sont pas des bugs mais des décisions en attente de ton arbitrage. Aucune des corrections n'est risquée ; F1→F4 sont mécaniques et testables immédiatement via les gates existantes.
