# Changelog — obsidian

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/obsidian`.

## [0.4.0] — 2026-05-29

### Added
- **`rpg`** — prep MJ du JDR solo : écriture de scénarios et préparation de campagne. Actions : `campaign` (couche prep + synopsis + rattachement univers), `scenario` (situation jouable : lieux, PNJ, fronts, amorces, issues), `prep-session` (objectif, scènes probables, questions oracle pré-armées, tables, accroches), `npc`, `faction` (faction durable + fronts/horloges), `review` (cohérence et jouabilité). Complète `pc` (fiches PJ) et `solo-mc` (jeu en direct) ; campagne dans `JDR/<campagne>/`, ancrée sur l'`intention.md` du PJ et le système **Parallaxe**.
- **`solo-mc`** — maître de jeu du JDR solo en direct (play, scene, oracle, roll, setup, journal-pdf…), **déplacé depuis `aidd-overlay`** pour regrouper la suite JDR solo. Skill inchangé.

### Changed
- **`pc` : système Parallaxe** (auparavant Jauges & Tarot). Les termes de mécanique J&T (jauge narrative, échos, points de destin, as/cavaliers…) sont remplacés par une déférence à la référence Parallaxe ; le `_template/`, `pj-manager.py` et `parallaxe-synthese.md` (hors dépôt) doivent être alignés côté coffre.
- **Données univers partagées** : `rpg` consigne le lore durable (terminologie, factions, personnages, lieux, histoire) dans `JDR/univers/<univers>/.docs/`, **même arborescence que `lore-extract`** (plugin writing).

## [0.3.1] — 2026-05-29 (baseline)

Skills : `project`, `pc`, `mail`.

### Fixed
- `mail` : gestion d'un frontmatter non-YAML lors de l'insertion de `processed: true`.

## [0.3.0]
- `mail` ajouté — tri, classification, fusion et résumé des emails exportés (Thunderbird) en Markdown ; v0.3.0 intègre 9 améliorations issues d'une session réelle.

## [0.2.0]
- `pc` ajouté — gestion des PJ JDR solo (Jauges & Tarot) : new, fill, reorganize, log-session, show.

## Antérieur
- `project` (gestion des projets Pro). Voir `git log -- plugins/obsidian` pour l'historique complet.
