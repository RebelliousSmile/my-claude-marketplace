# Changelog — writing

> Fusion de `doc-writer` (v0.1.0) et `rpg-writer` (v0.10.0). Historique détaillé : `git log -- plugins/writing plugins/doc-writer plugins/rpg-writer`.

## [1.1.0] — 2026-06-13

### Added
- **Boucle de review convergente + PLATEAU** (`references/review-loop.md`, source unique partagée par `review`/`write`/`persona`/`tone-finder`) : `comment` → triage → correction (`doctor` / `write --feedback` / révision d'intrant) → re-scoring → comparaison. Arrêt au **PLATEAU** (`Δ < 1.0` entre itérations) ; garde anti-boucle à 5 itérations (`CAP-ITERATIONS`) ; `PLATEAU` jamais déclaré tant que `Δ ≥ 1.0`. Terminal = chapitre figé (export ICML = étape séparée).
- **Artefact d'historique** `<output>/review/chapter-NN-scores.md` écrit par `comment` (une ligne/itération : consensus, `Δ`, verdict, route).
- **Routes de triage formalisées** : pattern systémique récurrent sur ≥3 chapitres → `tone-finder:improve` (output-style `v+1`) ; même persona plafonnée sur ≥3 chapitres → `persona:train`.

### Changed
- **Contrat brief resserré** (`references/brief-model.md`) : `<brief>/personas/` et `<brief>/output-styles/` exigent désormais **≥3 entrées distinctes** chacun (triangulation du scoring de `comment`).
- `persona:train` et `tone-finder:improve` documentent leur **déclencheur** (seuil ≥3 chapitres) via `review-loop.md`.

## [1.0.0] — 2026-06-13

### Added (fusion doc-writer + rpg-writer)
- **Documentation professionnelle** (ex-`doc-writer`) : `specification`, `technical-document`, `user-guide`, plus les références partagées `references/doc-principles.md` et `references/export-icml.md`.
- **Craft narratif — production à partir d'un brief** (ex-`rpg-writer`) : `toc`, `write`, `tone-finder`, `persona`, `review`, `storyboard`, `upgrade`.

### Changed
- **BREAKING** — les invocations passent de `/doc-writer:*` et `/rpg-writer:*` à `/writing:*`.
- **Séparation des responsabilités** : `writing` produit à partir d'un brief ; l'assemblage des intrants est délégué à `obsidian`. Refs cross-plugin namespacées (`obsidian:forge`, `obsidian:brief`, …).
- **BREAKING — nouveau modèle de travail `brief → output`** (`references/brief-model.md`). Tous les skills narratifs (`toc`, `write`, `review`, `persona`, `tone-finder`, `storyboard`, `upgrade`) abandonnent `bank.yml` et tout couplage au vault JDR (`<univers-root>`, `<systeme-root>`, `rules-files`, `.toc/`, `.wip/`, `chapitres/`). Désormais :
  - Entrée lecture seule `<brief>/` : `summary.md` (autosuffisant), `personas/`, `output-styles/`.
  - Sortie `<output>/` : `toc/INDEX.md` + `toc/chapter-NN.md`, `chapters/chapter-NN.md`, `review/chapter-NN-<persona>.md`, `storyboard/chapter-NN.md`.
  - Invocation : `<brief>` positionnel + `--out <output>`.
  - Écriture courte supportée : 0 TOC, 1 seul chapitre.

### Moved out (vers `obsidian`)
- Assemblage des intrants : `forge` (concept), `research` (données), `brief` (construit `_brief/`).
- Skills spécifiquement JDR : `lore-extract`, `rules-keeper`, `extract-pdf`.
- Agents JDR : `claude-code-optimizer-jdr`, `documentation-architect-jdr` (depuis supprimés en obsidian v0.13.0).

### Removed (de writing)
- `tabula-rasa` (obsolète — système de reset projet abandonné).

### Removed
- Plugins `doc-writer` et `rpg-writer` retirés du marketplace (contenu absorbé par `writing` et `obsidian`, sans alias de transition).
