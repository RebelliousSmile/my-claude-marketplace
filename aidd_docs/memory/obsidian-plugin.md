# obsidian — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 0.13.0 |
| Dernière release | 2026-06-13 |

## Skills

| Skill | Rôle |
|---|---|
| `project` | Projets Pro (create, fill, log-session, export-rag) |
| `pc` | Fiches PJ JDR solo (new, fill, reorganize, log-session, show, companion) |
| `rpg` | Prep MJ (campaign, scenario, prep-session, npc, faction, review) |
| `solo-mc` | MJ en direct Claude Code (play, scene, oracle, roll, setup…) |
| `mail` | Tri, résumé, fusion d'emails Markdown |
| `tree` | Organiseur Documents/ piloté par cache (index, check, fix, sort) |
| `brief` | Construit `_brief/` autosuffisant (summary.md + personas/ + output-styles/) |
| `forge` | Développe et challenge le concept / brief narratif |
| `research` | Recherche documentaire cross-référencée |
| `lore-extract` | Extrait et organise le lore d'univers (canon/ + mj/) |
| `rules-keeper` | Restructure les règles en format LLM (canon/ + mj/) |
| `extract-pdf` | Pipeline multi-sessions extraction PDF → sources |

## Agents

| Agent | Rôle |
|---|---|
| `narrateur` | Voix MJ pour solo-mc (load-bearing — invoqué par solo-mc) |
| `oracle` | Moteur de décision invisible pour solo-mc (load-bearing) |

## Modèle JDR autonome (v0.13.0, BREAKING)

`R = <jeu>` (ex : `Perso/RPG/zombiology/`) — domaine autosuffisant, résolu localement via le marqueur `_savoir/`.

| Répertoire | Contenu |
|---|---|
| `R/_savoir/systeme/{canon,mj}/` | Règles du système de jeu |
| `R/_savoir/subsystems/<n>/{canon,mj}/` | Sous-systèmes génériques (Parallaxe, Cinério…) |
| `R/_savoir/univers/<u>/{canon,mj}/` | Lore d'univers |
| `R/_savoir/*/sources/` | Sources brutes (input extract-pdf, jamais touché par lore-extract) |
| `R/_campagnes/<c>/` | Config + prep (scenarios/, prep/, fronts.md) |
| `R/_campagnes/<c>/<AAAA>/<MM>/` | Journaux de session datés |
| `R/_pjs/<pj>/` | Fiches PJ |
| `R/.current-session` | Marqueur de campagne active |
| `R/bank.yml` | Cache des ressources (maintenu par tree, lu par brief uniquement) |

Référence : `plugins/obsidian/references/jdr-layout.md`.
