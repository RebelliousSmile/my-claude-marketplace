# Changelog — obsidian

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/obsidian`.

## [0.7.0] — 2026-06-01

### Added
- **`pc` : compagnons (team du PJ)** — nouvelle action `companion` (create / fill / show). Fiches canoniques légères « Minimale jouable » dans `pjs/<pj>/compagnons/<slug>.md` (jouées par substitution pour le feeling table) ; roster actif dans le `config.yaml` de la campagne (clé `compagnons:`) qui référence les fiches. Lues par `hermes:solo-mc` au jeu.

### Removed
- **`solo-mc` déplacé vers le plugin `hermes`** (`hermes:solo-mc`). Le jeu en direct quitte `obsidian` pour rejoindre un plugin sous contrat d'architecture Hermes Agent. Les agents `mj-solo` et `oracle` suivent. Le trio JDR solo est désormais réparti : `obsidian` (`pc`, `rpg`) + `hermes` (`solo-mc`). Renvois et invocations (`/hermes:solo-mc setup`) mis à jour dans `rpg` et `pc`.

## [0.6.0] — 2026-05-31

### Changed
- **Lore d'univers en dossiers visibles** : `JDR/<jeu>/univers/<univers>/.docs/{canon,mj}/` → `univers/<univers>/{canon,mj}/`. Aligné sur `systeme/{canon,mj}/` et `subsystems/<nom>/{canon,mj}/` ; le lore devient lisible dans Obsidian (les dossiers `.docs/` y étaient masqués). Convention partagée avec `rpg-writer:lore-extract`. Skills alignés : `rpg` (campaign / scenario / prep-session / npc / faction / review), `solo-mc`, `pc`.

## [0.4.0] — 2026-05-29

### Added
- **`rpg`** — prep MJ du JDR solo : écriture de scénarios et préparation de campagne. Actions : `campaign` (couche prep + synopsis + rattachement univers), `scenario` (situation jouable : lieux, PNJ, fronts, amorces, issues), `prep-session` (objectif, scènes probables, questions oracle pré-armées, tables, accroches), `npc`, `faction` (faction durable + fronts/horloges), `review` (cohérence et jouabilité). Complète `pc` (fiches PJ) et `solo-mc` (jeu en direct) ; campagne dans `JDR/<campagne>/`, ancrée sur l'`intention.md` du PJ et le **sous-système Parallaxe**.
- **`solo-mc`** — maître de jeu du JDR solo en direct (play, scene, oracle, roll, setup, journal-pdf…), **déplacé depuis `aidd-overlay`** pour regrouper la suite JDR solo. Skill inchangé.

### Changed
- **`pc` : sous-système Parallaxe** (auparavant Jauges & Tarot). Parallaxe est un sous-système (greffé sur le système de jeu), pas un jeu. Les termes de mécanique J&T (jauge narrative, échos, points de destin, as/cavaliers…) sont remplacés par une déférence à la référence ; le `_template/`, `pj-manager.py` et les règles `JDR/subsystems/parallaxe/` (hors dépôt) doivent être alignés côté coffre.
- **Données univers partagées, scindées canon / MJ** : l'univers vit dans `JDR/univers/<univers>/.docs/` avec deux sous-arbres thématiques identiques — `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`). `rpg` n'écrit jamais dans `canon/` et ne contredit pas le canon en silence. Même arborescence partagée avec `lore-extract` (plugin writing).
- **Règles partagées, scindées canon / mj** : `pc`, `rpg` et `solo-mc` consultent la même référence de règles — système de jeu + **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles…) — au format `writing:rules-keeper`, en `JDR/subsystems/<nom>/canon/` (officiel) + `JDR/subsystems/<nom>/mj/` (house rules du MJ qui déclarent leurs overrides). Règles effectives = système de jeu + sous-systèmes actifs (canon + house rules déclarées) ; aucune mécanique inventée hors de ces références.

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
