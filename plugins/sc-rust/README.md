# sc-rust

*Knowledge provider pour les stacks Rust (Axum, Actix-web) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte les crates du projet (`Cargo.toml`) et charge à la demande les pivots de capacité applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-rust:sniff` | Détecte les crates depuis `Cargo.toml`, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-rust:audit` | Auditeur qualité Rust — détecte la stack via sniff puis délègue la revue avec les pivots applicables |
| `improve` | `/sc-rust:improve` | Analyse le code — opportunités d'idiomes Rust et de design patterns, plan d'amélioration |
| `legacy` | `/sc-rust:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une édition, propose une migration |
| `log-analysis` | `/sc-rust:log-analysis` | Analyse les logs d'application Rust (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-rust:teach` | Enseigne le langage, l'ownership, les idiomes et les patterns de framework |

## Licence

MIT — voir [LICENSE](../../LICENSE).
