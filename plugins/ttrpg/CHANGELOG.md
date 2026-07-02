# Changelog — ttrpg

## [0.2.0] — 2026-07-02

### Added — extraction de `lore-extract` et `rules-keeper` depuis `obs`
- Les skills de ventilation JDR `lore-extract` et `rules-keeper`, laissés dans `obs` lors de la première extraction (0.1.0), rejoignent `ttrpg` : tout l'outillage JDR (jeu **et** assemblage) vit désormais dans un seul plugin. `obs` reste en amont sur le même domaine `R` via `extract-pdf` (sources brutes) et `research` (rapports).
- `README.md` mis à jour : nouvelles entrées de skills, retrait de la framing « consomme `obs:lore-extract`/`obs:rules-keeper` ».
- `references/jdr-layout.md` et `jdr-layout-checks.py` (copies `obs`/`ttrpg`) resynchronisés ; mentions résiduelles `rpg` (pré-0.1.0) corrigées en `campaign`.

## [0.1.0] — 2026-07-02

### Added — extraction depuis `obs`
- Nouveau plugin, extrait de `obs` (0.26.0) : trio JDR solo `pc`, `campaign` (ex-`obs:rpg`) et `solo-mc`, ainsi que les agents `narrateur` et `oracle`.
- `references/jdr-layout.md` et `jdr-layout-checks.py` dupliqués depuis `obs/references/` (pas de mécanisme cross-plugin — copies à resynchroniser manuellement).
- Consomme `obs:lore-extract` et `obs:rules-keeper`, restés dans `obs` et désormais partagés entre `writing` et `ttrpg`.
