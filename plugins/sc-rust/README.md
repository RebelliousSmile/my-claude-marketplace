# sc-rust

*Knowledge provider pour les stacks Rust (Axum, Actix-web) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte les crates du projet (`Cargo.toml`) et charge à la demande les pivots de capacité applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-rust:sniff` | Détecte les crates depuis `Cargo.toml`, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-rust:audit` | Détecte la stack via sniff puis invoque `aidd-dev:04-audit` (`code-quality`) avec les pivots applicables ; le rapport AIDD reste autoritatif |
| `improve` | `/sc-rust:improve` | Analyse le code — opportunités d'idiomes Rust et de design patterns, plan d'amélioration |
| `legacy` | `/sc-rust:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une édition, propose une migration |
| `log-analysis` | `/sc-rust:log-analysis` | Analyse les logs d'application Rust (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-rust:teach` | Enseigne le langage, l'ownership, les idiomes et les patterns de framework |
| `cd` | `/sc-rust:cd local\|server\|automata` | Façade projet Cargo/xtask ou task runner déjà versionné, release identifiée par source et checksum, bascule atomique et récupération de la release précédente. Aucun outil global ajouté implicitement. |

## Pivots

### Capability pivots — chargés à l'audit, non installés sur disque

| Signal de détection | Pivot |
|---|---|
| Tout projet Rust | `rust/idioms.md` |
| `pyo3` | `rust/pyo3.md` |
| `tauri` | `rust/tauri.md` |

### Pivots perf / data — installés dans `.claude/rules/07-quality/`

| Signal de détection | Pivot | Consommateur |
|---|---|---|
| `axum`, `actix-web` | `perf/axum.md` | `overcode:web-optimize` |
| `sqlx` · `diesel` · `rusqlite` | `data/sqlx.md` · `data/diesel.md` · `data/rusqlite.md` | `overcode:data-optimize` |

### Résumé

| Type | Où ça vit | Qui le charge | Quand |
|---|---|---|---|
| Capability pivot | Plugin uniquement | Claude Code (automatique, via `paths:`) | À chaque édition de fichier matchant |
| Perf / data pivot | `.claude/rules/07-quality/` | `web-optimize` / `data-optimize` (explicite) | Au lancement du skill |

## CD multi-cibles

`sc-rust:cd` passe la cible à un alias ou xtask unique. Chaque cible possède son identité d'artefact, son répertoire de release, ses pointeurs, son verrou et son rollback. Les migrations de schéma précèdent la bascule ; les données persistantes de production ne sont jamais copiées depuis le local. `server` et `automata` reprennent la même invocation.

## Licence

MIT — voir [LICENSE](../../LICENSE).
