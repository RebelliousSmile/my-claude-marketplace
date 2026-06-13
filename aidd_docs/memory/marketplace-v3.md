# Marketplace — état v3.0.0

| Plugin | Version | Rôle |
|---|---|---|
| `aidd-overlay` | 2.1.5 | Extensions AIDD : dig, harvest, status, alias… |
| `design` | 1.0.0 | Entonnoir 5 verbes (define→enforce→diffuse) + linter sc-* |
| `writing` | 1.0.0 | Production éditoriale à partir d'un brief (doc pro + craft narratif) |
| `game-writer` | 1.0.0 | Contenu narratif jeu vidéo (bank, dialogic-draft, dialogic-review) |
| `sc-godot` | 0.1.0 | Godot/GDScript — coquille (skills à porter) |
| `sc-js` | 0.7.0 | Écosystème JS (Nuxt/Vue/Svelte/Vite/Astro) |
| `sc-php` | 0.5.0 | Écosystème PHP (WP/Laravel/Symfony) |
| `sc-python` | 0.5.2 | Écosystème Python (Django/FastAPI/Flask) |
| `sc-rust` | 0.4.3 | Écosystème Rust (Axum/Actix + SQLx/Diesel) |
| `sc-tiers` | 0.2.0 | SaaS tiers (Firebase/Supabase/DynamoDB/Hasura) |
| `obsidian` | 0.13.0 | Notes Obsidian, JDR solo, assemblage des intrants pour writing |

## Plugins supprimés

| Plugin | Remplacé par |
|---|---|
| `doc-writer` | `writing` (fusion) |
| `rpg-writer` | `writing` (craft narratif) + `obsidian` (skills JDR + assemblage intrants) |
| `gamedesign` | `game-writer` (renommé) |
| `tabula-rasa` | — (supprimé, système de reset abandonné) |

## Séparation des responsabilités (BREAKING v3)

- **`obsidian`** assemble les intrants : `brief` (construit `_brief/`), `forge` (concept), `research` (données), `lore-extract`, `rules-keeper`, `extract-pdf`.
- **`writing`** produit à partir d'un brief : ne remonte jamais vers `R` ni `bank.yml`.
