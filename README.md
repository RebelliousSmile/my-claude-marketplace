# my-marketplace

*Marketplace personnelle de plugins Claude Code et Codex — overlay du framework [AIDD](https://github.com/ai-driven-dev/aidd-framework) pour tous mes développements.*

## Plugins disponibles

Le **détail des skills de chaque plugin vit dans son propre README** — ce tableau est l'index.

| Plugin | Doc | `recommended` | Description |
|---|---|---|---|
| [`overcode`](plugins/overcode/README.md) | [README](plugins/overcode/README.md) · [CHANGELOG](plugins/overcode/CHANGELOG.md) | ✅ | Socle commun — workflows AIDD, règles SaaS, enveloppes de livraison, maintenance et audits |
| [`design`](plugins/design/README.md) | [README](plugins/design/README.md) · [CHANGELOG](plugins/design/CHANGELOG.md) | — | Création, critique, figeage, contrôle et diffusion d'un design system. Chaque skill fonctionne seule ; le cycle complet reste disponible pour les refontes globales. |
| [`sc-js`](plugins/sc-js/README.md) | [README](plugins/sc-js/README.md) · [CHANGELOG](plugins/sc-js/CHANGELOG.md) | — | Stack JavaScript : Nuxt / Vue SPA / Vite / Alpine / Astro |
| [`sc-php`](plugins/sc-php/README.md) | [README](plugins/sc-php/README.md) · [CHANGELOG](plugins/sc-php/CHANGELOG.md) | — | Stack PHP : Laravel / Symfony / WordPress / HTMX |
| [`sc-css`](plugins/sc-css/README.md) | [README](plugins/sc-css/README.md) · [CHANGELOG](plugins/sc-css/CHANGELOG.md) | — | Couche CSS pure : architecture (BEM, utility-first, CSS Modules, ITCSS), audit, modernisation |
| [`sc-python`](plugins/sc-python/README.md) | [README](plugins/sc-python/README.md) · [CHANGELOG](plugins/sc-python/CHANGELOG.md) | — | Stack Python : Django / FastAPI / Flask / Celery |
| [`sc-rust`](plugins/sc-rust/README.md) | [README](plugins/sc-rust/README.md) · [CHANGELOG](plugins/sc-rust/CHANGELOG.md) | — | Stack Rust : Axum / Actix-web |
| [`obs`](plugins/obs/README.md) | [README](plugins/obs/README.md) · [CHANGELOG](plugins/obs/CHANGELOG.md) | — | Notes Obsidian — projets Pro, tri d'emails et organisation de l'arborescence |

### Livraison homogène avec `sc-*:cd` et `overcode:deploy`

Les plugins `sc-css`, `sc-js`, `sc-php`, `sc-python` et `sc-rust` conservent une unique façade projet (`deploy:*`) pour chaque cible nommée. `overcode:service` configure les cibles SSH, Alwaysdata, Railway ou Heroku ; `overcode:deploy automata` génère l’enveloppe GitHub, GitLab, Railway ou Heroku. Une cible combine une phase (`staging` ou `production`), un mode (`server` ou `automata`), un fournisseur, une garde de cycle de vie et un verrou indépendant.

Les choix restent natifs à la stack : pnpm côté JavaScript, façade racine existante côté PHP, gestionnaire existant côté Python, Cargo/xtask versionné côté Rust, et propriété sc-css uniquement pour un site statique pur. Les surfaces `code`, `schema`, `data` et `media` sont gouvernées séparément : le local fait autorité sur un staging de présentation, tandis qu'une production conserve l'autorité sur ses données et médias. La synchronisation staging compare des manifestes et ne transfère que les différences ; aucun flux cible-à-cible n'est permis.

### Appels entre plugins

| Appelant | Cible vérifiée | Contrat |
|---|---|---|
| `sc-js:audit`, `sc-php:audit`, `sc-python:audit`, `sc-rust:audit` | `aidd-dev:04-audit`, pilier `code-quality` | Les pivots de stack deviennent des critères supplémentaires du rapport AIDD. |
| `sc-*:cd automata` | `overcode:deploy automata` | La stack conserve la façade applicative ; `overcode:deploy` possède seulement l'enveloppe fournisseur ou CI. |
| Projet avec Firebase, Klaviyo, GTM/Meta, Clarity ou PSI | `overcode:service` | Installe, vérifie ou explique les règles de consommation de ces services. |
| `overcode:alias mirror` | `design/agents/copycat.md` | `copycat` est un contrat de sous-agent interne, pas une skill publique. |
| `obs:project` (projet logiciel) | `aidd-context:01-bootstrap` | Le cadrage d'architecture logicielle reste dans AIDD ; `obs` gère uniquement les notes de projet. |
| `overcode:extract-pdf` | aucune cible implicite | L'extraction s'arrête sous `sources/`; aucun ancien rôle RPG/TTRPG n'est invoqué. |

## Installation

### Prérequis AIDD pour Codex

Les deux marketplaces sont complémentaires. Une installation Codex complète active au minimum :

```bash
codex plugin add aidd-context@aidd-framework
codex plugin add aidd-dev@aidd-framework
codex plugin add aidd-refine@aidd-framework
codex plugin add design@my-marketplace
```

La dernière commande s'exécute après l'enregistrement de `my-marketplace` depuis `.agents/plugins/marketplace.json`. Répéter avec `overcode`, `obs` ou un plugin `sc-*` selon les besoins, puis ouvrir une nouvelle session Codex.

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
| CSS pur (architecture, audit, modernisation) | `sc-css` |
| Web Python | `sc-python` |
| Web Rust | `sc-rust` |
| SaaS tiers (Firebase, Klaviyo, GTM…) | `overcode` (`service`) |
| Notes Obsidian | `obs` |
| Extraction de sources PDF | `overcode` (`extract-pdf`) |

## Licence

MIT — voir [LICENSE](LICENSE).
