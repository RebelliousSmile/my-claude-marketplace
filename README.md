# my-marketplace

*Marketplace personnelle de plugins Claude Code — overlay du framework [AIDD](https://github.com/ai-driven-dev/aidd-framework) pour tous mes développements.*

## Plugins disponibles

Le **détail des skills de chaque plugin vit dans son propre README** — ce tableau est l'index.

| Plugin | Doc | `recommended` | Description |
|---|---|---|---|
| [`overcode`](plugins/overcode/README.md) | [README](plugins/overcode/README.md) · [CHANGELOG](plugins/overcode/CHANGELOG.md) | ✅ | Socle commun — workflows projet-agnostiques (alias, harvest, audits perf, readme, changelog…) |
| [`design`](plugins/design/README.md) | [README](plugins/design/README.md) · [CHANGELOG](plugins/design/CHANGELOG.md) | — | Design system en entonnoir : define → destructure → adjust → enforce → diffuse |
| [`game-writer`](plugins/game-writer/README.md) | [README](plugins/game-writer/README.md) · [CHANGELOG](plugins/game-writer/CHANGELOG.md) | — | Écriture narrative de jeu vidéo (8-MINE) : timelines Dialogic, bank d'assets |
| [`sc-godot`](plugins/sc-godot/README.md) | [README](plugins/sc-godot/README.md) · [CHANGELOG](plugins/sc-godot/CHANGELOG.md) | — | Stack Godot / GDScript : sniff, audit, improve, legacy, teach |
| [`sc-js`](plugins/sc-js/README.md) | [README](plugins/sc-js/README.md) · [CHANGELOG](plugins/sc-js/CHANGELOG.md) | — | Stack JavaScript : Nuxt / Vue SPA / Vite / Alpine / Astro |
| [`sc-php`](plugins/sc-php/README.md) | [README](plugins/sc-php/README.md) · [CHANGELOG](plugins/sc-php/CHANGELOG.md) | — | Stack PHP : Laravel / Symfony / WordPress / HTMX |
| [`sc-python`](plugins/sc-python/README.md) | [README](plugins/sc-python/README.md) · [CHANGELOG](plugins/sc-python/CHANGELOG.md) | — | Stack Python : Django / FastAPI / Flask / Celery |
| [`sc-rust`](plugins/sc-rust/README.md) | [README](plugins/sc-rust/README.md) · [CHANGELOG](plugins/sc-rust/CHANGELOG.md) | — | Stack Rust : Axum / Actix-web |
| [`sc-tiers`](plugins/sc-tiers/README.md) | [README](plugins/sc-tiers/README.md) · [CHANGELOG](plugins/sc-tiers/CHANGELOG.md) | — | SaaS tiers : Firebase, Klaviyo, GTM, Clarity, PSI |
| [`obs`](plugins/obs/README.md) | [README](plugins/obs/README.md) · [CHANGELOG](plugins/obs/CHANGELOG.md) | — | Notes Obsidian — projets Pro, tri d'emails, organisation de l'arborescence, recherche documentaire |

## Installation

### 1. Enregistrer le marketplace (une seule fois, global)

**Depuis GitHub** — ajouter dans `~/.claude/settings.json` :

```json
{
  "extraKnownMarketplaces": {
    "my-marketplace": {
      "source": {
        "source": "github",
        "repo": "RebelliousSmile/my-claude-marketplace"
      }
    }
  }
}
```

**En local (développement)** — utiliser `"source": "directory"` avec le chemin absolu ; les modifications sont prises en compte sans push.

### 2. Activer des plugins

Global (tous les projets) — `~/.claude/settings.json` :

```json
{
  "enabledPlugins": {
    "overcode@my-marketplace": true
  }
}
```

Par projet — `.claude/settings.json` du projet, ou via commande :

```
/plugin install sc-js@my-marketplace
```

### Référence rapide

| Type de projet | Plugin |
|---|---|
| Socle (tous projets) | `overcode` |
| Design system / UI mobile-first | `design` |
| Web JavaScript / Nuxt / Vue | `sc-js` |
| Web PHP | `sc-php` |
| Web Python | `sc-python` |
| Web Rust | `sc-rust` |
| SaaS tiers (Firebase, Klaviyo, GTM…) | `sc-tiers` |
| Jeu vidéo (contenu narratif) | `game-writer` |
| Jeu vidéo (code Godot) | `sc-godot` |
| Notes Obsidian | `obs` |

## Licence

MIT — voir [LICENSE](LICENSE).
