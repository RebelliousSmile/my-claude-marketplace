# my-claude-marketplace

Marketplace personnelle de plugins Claude Code, construite comme overlay du framework [AIDD](https://github.com/ai-driven-dev/aidd-framework).

## Installation

### 1. Enregistrer le marketplace (une seule fois, global)

Ajouter dans `~/.claude/settings.json` :

```json
{
  "extraKnownMarketplaces": {
    "my-marketplace": {
      "source": {
        "source": "github",
        "repo": "RebelliousSmile/my-claude-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "aidd-overlay@my-marketplace": true
  }
}
```

> **Sur la machine de développement**, utiliser une clé distincte avec `"source": "directory"` et le chemin local — les modifications sont prises en compte sans push.

> **Si Claude Code demande « Enter marketplace source »**, saisir : `RebelliousSmile/my-claude-marketplace`

### 2. Activer des plugins par projet (optionnel)

Ajouter dans `.claude/settings.json` à la racine du projet :

```json
{
  "enabledPlugins": {
    "sc-js@my-marketplace": true
  }
}
```

Ou via commande dans le projet :

```
/plugin install sc-js@my-marketplace
```

**Référence rapide par type de projet :**

| Type de projet | Plugin à activer |
|---|---|
| Design system / UI mobile-first | `design@my-marketplace` |
| Documentation (guides, technique, cahier des charges) | `doc-writer@my-marketplace` |
| Web JavaScript / Nuxt / Vue | `sc-js@my-marketplace` |
| Web PHP | `sc-php@my-marketplace` |
| Web Python | `sc-python@my-marketplace` |
| Web Rust | `sc-rust@my-marketplace` |
| Intégrations SaaS (Firebase, Klaviyo, GTM…) | `sc-tiers@my-marketplace` |
| Jeu vidéo | `gamedesign@my-marketplace` |
| Projet rédactionnel | `rpg-writer@my-marketplace` |
| Projet avec Obsidian | `obsidian@my-marketplace` |

---

## Plugins disponibles

Le **détail des skills de chaque plugin vit dans son propre README** (colonne Doc) — ce tableau est l'index.

| Plugin | Doc | `recommended` | Description |
|---|---|---|---|
| [`aidd-overlay`](plugins/aidd-overlay/README.md) | [README](plugins/aidd-overlay/README.md) · [CHANGELOG](plugins/aidd-overlay/CHANGELOG.md) | ✅ | Socle commun — workflows projet-agnostiques (alias, harvest, audits perf, readme, changelog…) |
| [`design`](plugins/design/README.md) | [README](plugins/design/README.md) · [CHANGELOG](plugins/design/CHANGELOG.md) | — | Design system mobile-first : référence/brief → tokens, wireframes HTML, composants, audit, doctor/refactor (prod), export WordPress |
| [`doc-writer`](plugins/doc-writer/README.md) | [README](plugins/doc-writer/README.md) · [CHANGELOG](plugins/doc-writer/CHANGELOG.md) | — | Documentation : guides utilisateur, documents techniques, cahiers des charges (specification) |
| [`sc-js`](plugins/sc-js/README.md) | [README](plugins/sc-js/README.md) · [CHANGELOG](plugins/sc-js/CHANGELOG.md) | — | Stack JavaScript : Nuxt / Vue SPA / Vite / Alpine / Astro |
| [`sc-php`](plugins/sc-php/README.md) | [README](plugins/sc-php/README.md) · [CHANGELOG](plugins/sc-php/CHANGELOG.md) | — | Stack PHP : Laravel / Symfony / WordPress / HTMX |
| [`sc-python`](plugins/sc-python/README.md) | [README](plugins/sc-python/README.md) · [CHANGELOG](plugins/sc-python/CHANGELOG.md) | — | Stack Python : Django / FastAPI / Flask |
| [`sc-rust`](plugins/sc-rust/README.md) | [README](plugins/sc-rust/README.md) · [CHANGELOG](plugins/sc-rust/CHANGELOG.md) | — | Stack Rust : Axum / Actix-web |
| [`sc-tiers`](plugins/sc-tiers/README.md) | [README](plugins/sc-tiers/README.md) · [CHANGELOG](plugins/sc-tiers/CHANGELOG.md) | — | SaaS tiers : Firebase, Klaviyo, GTM, Clarity, PSI |
| [`gamedesign`](plugins/gamedesign/README.md) | [README](plugins/gamedesign/README.md) · [CHANGELOG](plugins/gamedesign/CHANGELOG.md) | — | Game design (8-MINE) : timelines dialogiques, bank d'assets |
| [`rpg-writer`](plugins/rpg-writer/README.md) | [README](plugins/rpg-writer/README.md) · [CHANGELOG](plugins/rpg-writer/CHANGELOG.md) | — | Rédaction narrative : concept, TOC, chapitres, ton, lore, relecture |
| [`obsidian`](plugins/obsidian/README.md) | [README](plugins/obsidian/README.md) · [CHANGELOG](plugins/obsidian/CHANGELOG.md) | — | Notes Obsidian — projets Pro, JDR solo (PJ, scénarios, prep de campagne, jeu en direct), tri d'emails |

> Tous les plugins ont un README et un CHANGELOG.

---

## Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) ≥ 1.x
- [AIDD framework](https://github.com/ai-driven-dev/aidd-framework) installé
- `gh` CLI pour les skills interagissant avec GitHub

---

## Maintenance du cache

Les plugins sont mis en cache à l'installation dans `~/.claude/plugins/cache/`. `/reload-plugins` recharge depuis ce cache — il ne re-synchronise **pas** depuis la source.

Après avoir ajouté ou modifié des fichiers dans la source :

```powershell
# Copier un nouveau skill dans le cache (exemple : sc-js sniff)
Copy-Item -Path ".\plugins\sc-js\skills\sniff" `
          -Destination "$env:USERPROFILE\.claude\plugins\cache\aidd-overlay\sc-js\0.1.0\skills\sniff" `
          -Recurse -Force
```

Puis faire `/reload-plugins` dans Claude Code.

> Pour forcer une réinstallation complète : supprimer le répertoire `~/.claude/plugins/cache/aidd-overlay/<plugin>/` et réinstaller via `/plugin install <plugin>@my-marketplace`.
