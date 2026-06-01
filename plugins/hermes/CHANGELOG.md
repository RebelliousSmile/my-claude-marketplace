# Changelog — hermes

## [0.1.0] — 2026-06-01

### Added
- **Plugin `hermes`** — conteneur sous **contrat d'architecture Hermes Agent** (Nous Research) : boucle de conversation + dispatch d'outils, mémoire persistante, assemblage de prompt à trois tiers (stable → context → volatile), six principes architecturaux. README documente l'architecture et son mapping normatif vers un plugin Claude Code.
- **`solo-mc`** — maître de jeu du JDR solo en direct (play, scene, oracle, roll, setup, journal-pdf…), **déplacé depuis `obsidian`** comme implémentation de référence du contrat Hermes. Skill et agents (`mj-solo`, `oracle`) déplacés tels quels.

### Changed
- `solo-mc` : `narrateur-latex-agent` retiré (agent supprimé). T2 mis à jour ; `12-journal-pdf` convertit le Markdown en LaTeX en direct, sans agent dédié.
- `solo-mc` : **apprentissages de jeu intégrés dans `SKILL.md`** depuis `SKILL-remote.md` — règles T8 (rôles narratif/mécanique), T9 (conventions HRP/RP), T10 (journalisation narrative continue obligatoire), T11 (cohérence PNJ & continuité), T12 (lire avant d'inventer), + section *Common Pitfalls*. Actions `01-play` (numérotation de session depuis le système de fichiers, en-tête « Précédemment », `session_log_path`) et `10-play-end` (récap appendé au log + marqueur de fin, `session_courante` = nom de fichier) enrichies.
- `SKILL-remote.md` (variante runtime Hermes) : isolée sur le seul domaine `solo-mc` (détails d'actions `pc`/`rpg` retirés) ; racine du vault passée de `~/JDR/` en dur à `<vault>` résolu via `~/.jdr.yaml` (chemin par machine + remote `tnn-jdr`).
