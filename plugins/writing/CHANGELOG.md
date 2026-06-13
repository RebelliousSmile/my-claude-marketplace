# Changelog — writing

> Fusion de `doc-writer` (v0.1.0) et `rpg-writer` (v0.10.0). Historique détaillé : `git log -- plugins/writing plugins/doc-writer plugins/rpg-writer`.

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
- Agents JDR : `claude-code-optimizer-jdr`, `documentation-architect-jdr`.

### Removed (de writing)
- `tabula-rasa` (obsolète — système de reset projet abandonné).

### Removed
- Plugins `doc-writer` et `rpg-writer` retirés du marketplace (contenu absorbé par `writing` et `obsidian`, sans alias de transition).
