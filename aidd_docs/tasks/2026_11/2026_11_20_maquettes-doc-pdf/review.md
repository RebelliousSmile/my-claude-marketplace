# Review: maquettes-doc-pdf

- **Verdict**: approve
- **Diff**: `2011590...e809433` + correctifs non commités du 2026_11_20
- **Axes run**: code, functional, relevancy
- **Date**: 2026_11_20
- **Findings**: 0 critical, 0 warning, 1 minor

## Phases

### Phase 1 — Lanceur InDesign et runbook générique

- [x] 0.2.3 commitée — `2011590`
- [x] `run-elevated.ps1` : code relayé, journal affiché, `finally`, aucune tâche restante — `a8d9e60`
- [x] Codes 2 à 5 avec message distinct, code 0 avec constat d'empreintes — `a8d9e60`
- [x] Runbook sans `pnpm run guides`, `scripts/guides`, `aidd_docs` ; test `icml-transform` vert — `a8d9e60`
- [x] Plus de `scripts/guides` dans `engine/`, `merge --check` vert — `a8d9e60`
- [x] `consistency.mjs` et Jest verts — `phase-1.md` compte rendu
- [x] PDF vendeur sans administrateur, préréglage relevé, InDesign ouvert → code 2 — `run-elevated.ps1` joué InDesign ouvert : code 2, aucune tâche `doc-pdf-*` restante ; `cli.js pdf compose` refuse plus tôt (`compose-guide.js:402`, code 1, aucun fichier écrit)
- [x] SHA noté — `a8d9e60`

### Phase 2 — Maquette au format 1 et banc des moteurs

- [x] Banc : 0 si identique, 1 sur un octet modifié, `versionFile` facultatif, `output` cerascan intact — `engine/tools/compare-engines.js`
- [x] Erreurs format 2, `axes` absent, maquette introuvable — `6ff1d07`
- [x] Accent hors axes refusé, défaut Scriptami — `6ff1d07`
- [x] Hexadécimaux et polices : seules les couleurs fixes restent — `6ff1d07`
- [x] Banc à 0 (273 identiques), Jest 377, SHA noté — `6ff1d07`

### Phase 3 — La maquette porte toute la charte

- [x] Clé de composition, logo ou bloc manquant refusé — `184b866`
- [x] Plus de valeur Scriptami dans `build-idml-template.js` — `184b866`
- [x] `STYLE_TABLE` absent d'`engine/` — grep vide
- [x] Plus de `'Courante'` dans `engine/indesign/`, test de priorité du préréglage — grep vide
- [x] `compare-pdfs` : 0, 1 avec page nommée, nombre de pages différent signalé — `engine/tools/compare-pdfs.js`
- [x] Banc `--pdf` sans écriture dans cerascan, aucune tâche restante — `184b866`
- [x] Bruit mesuré à 0 avant la comparaison entre moteurs — sans objet : ICML, IDML et PDF identiques, bruit nul de fait

### Phase 4 — Moteur sans marque, maquette externe

- [x] Dépôt Scriptami (maquette, logo, charte, gabarits, README), sans distant — `Code/Perso/scriptami/maquette-doc-pdf` `20fa528`, aucun remote
- [x] Fusion du `commun`, `miseAJour`, clé absente nommée — `8808cec`
- [x] Squelette accepté, polices présentes, un modèle par axe — `engine/maquettes/squelette/`
- [x] « Scriptami » absent du moteur ; config sans maquette refusée ; `init --maquette` — grep : `CHANGELOG.md`, `skills/maquette/SKILL.md:55` seulement
- [x] Banc avec deux configurations — `8808cec`
- [x] ICML, IDML, PDF identiques avant/après bascule — assertion v2.20.0 (48/28/23 pages identiques) ; `engine/maquettes/scriptami/` et charte cerascan retirées
- [x] `consistency.mjs` vert, 0.4.0, note de migration — `8808cec`

### Phase 5 — Skill maquette

- [x] Spécimen dans Jest, style absent nommé — `5f4869c`
- [x] `initMaquette`/`addSpecimen` : refus, dossier vide, parent absent, `.gitignore`, accent — `5f4869c`
- [x] Chaque action nomme ses commandes exactes et ses points d'accord — `actions/01-modele.md` (accord sur le dossier, distant), `actions/03-production.md:13-14` (constat d'empreintes, renvoi vers `calage`)
- [x] `scenarios.json` et document d'autonomie (4 situations) — `evals/scenarios.json`, `evals/routing-autonomy-scenarios.md` S1-S8
- [x] Plus de « Ne jamais modifier la charte, les maquettes », test du runbook vert — `5f4869c`
- [x] 0.5.0 et tests verts (Jest 456) — `5f4869c`
- [x] `icml` sur le spécimen, spécimen composé, ajustement limité, aucune tâche restante — `phase-5.md` (5 pages modifiées, même pagination)

## Findings

| Sev | Kind | Phase | Location | Issue | Fix |
| --- | ---- | ----- | -------- | ----- | --- |
| 🟢 | functional | 5 | `skills/maquette/evals/routing-autonomy-scenarios.md:28` | Journal des résultats vide : S1-S8 jamais joués | Jouer les huit scénarios en dry-run et consigner |

## Verification

| Metric        | Value                                             |
| ------------- | ------------------------------------------------- |
| Verified      | 100% (34/34) |
| Files checked | `plan.md`, `phase-1.md`…`phase-5.md`, `skills/maquette/SKILL.md`, `skills/maquette/actions/01-modele.md`, `02-calage.md`, `03-production.md`, `evals/scenarios.json`, `evals/routing-autonomy-scenarios.md`, `engine/maquettes/squelette/maquette.json`, `engine/indesign/`, dépôt `scriptami/maquette-doc-pdf`, `cerascan/aidd_docs/guides/` |
| Unchecked     | none (P1 c7 et P5 c3 corrigés, P3 c7 sans objet) |
| Unplanned     | correctif `${LANGUAGE}` (phase 2) ; fusion `libelles` → `textes` (phase 3) |
