# AIDD Claude Custom Commands

Collection de commandes personnalisées (slash commands) pour [Claude Code](https://docs.anthropic.com/en/docs/claude-code), conçues pour le framework **AIDD** (AI-Driven Development).

## Commandes disponibles

| Commande | Description |
|---|---|
| `migrate_docs` | Scanne les dossiers `docs/` et `documentation/`, classifie chaque fichier et le reformate selon les templates AIDD dans `aidd_docs/` |
| `release_to_site` | Récupère une release GitHub et traduit les changements notables en contenu marketing sur le site |
| `site_section` | Planifie et implémente une section sur le site marketing (Nuxt + Vue + UnoCSS) |
| `changelog` | Génère ou met à jour `CHANGELOG.md` à partir de l'historique git, puis commit et tag la release |

## Installation

Cloner ce dépôt dans le dossier `.claude/commands/` de votre projet :

```bash
git clone <repo-url> .claude/commands/custom
```

Ou ajouter comme sous-module git :

```bash
git submodule add <repo-url> .claude/commands/custom
```

Les commandes seront ensuite accessibles dans Claude Code via `/custom:01:migrate_docs`, `/custom:02:release_to_site`, etc.

## Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [AIDD](https://github.com/RebelliousSmile/aidd) configuré dans le projet cible
- `gh` CLI pour les commandes interagissant avec GitHub
