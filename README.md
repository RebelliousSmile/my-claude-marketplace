# my-claude-marketplace

Marketplace personnelle de plugins Claude Code, construite comme overlay du framework [AIDD](https://github.com/ai-driven-dev/aidd-framework).

## Installation

### 1. Enregistrer le marketplace (une seule fois, global)

Ajouter dans `~/.claude/settings.json` :

**Machine de développement** (répertoire local, modifications prises en compte sans push) :
```json
{
  "extraKnownMarketplaces": {
    "my-marketplace": {
      "source": {
        "source": "directory",
        "path": "/chemin/absolu/vers/my-claude-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "aidd-overlay@my-marketplace": true
  }
}
```

**Autres machines** (depuis GitHub) :
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

> **Si Claude Code demande « Enter marketplace source »**, saisir : `RebelliousSmile/my-claude-marketplace`

### 2. Activer des plugins par projet (optionnel)

Ajouter dans `.claude/settings.json` à la racine du projet :

```json
{
  "enabledPlugins": {
    "gamedesign@my-marketplace": true
  }
}
```

Ou via commande dans le projet :

```
/plugin install gamedesign@my-marketplace
```

**Référence rapide par type de projet :**

| Type de projet | Plugin à activer |
|---|---|
| Web PHP | `sc-php@my-marketplace` |
| Jeu vidéo | `gamedesign@my-marketplace` |
| Projet avec Obsidian | `obsidian@my-marketplace` |
| Projet rédactionnel | `writing@my-marketplace` |

---

## Plugins disponibles

| Plugin | `recommended` | Description |
|---|---|---|
| `aidd-overlay` | ✅ | Socle commun — workflows projet-agnostiques |
| `gamedesign` | — | Game design : dialogue, bank d'assets |
| `writing` | — | Rédaction : ton, style, typographie |
| `obsidian` | — | Export vers Obsidian (mémoire projet, statut) |
| `sc-php` | — | Stack PHP : Bruno API client |

---

## aidd-overlay

Plugin principal, installé globalement. Étend le framework AIDD avec des workflows transversaux.

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `harvest` | `/harvest` | Maintenance globale — réconcilie le tracker, extrait les décisions, purge les éphémères, appelle taste |
| `reconcile-normative` | `/reconcile-normative` | Détecte doublons, contradictions et règles obsolètes entre archives, mémoire et règles actives |
| `taste` | `/taste [fichier]` | Détecte les contenus obsolètes — assess-doc (claims vs codebase), assess-code (imports, symboles, règles, TODOs) |
| `foresee` | `/foresee <cible>` | Analyse prospective — problèmes à moyen terme sur docs, code ou dépendances |
| `dig` | `/dig` | Quiz interactif sur le codebase ou la memory bank |
| `web-optimize` | `/web-optimize` | Audit perf web (LCP, CLS, INP, bundle, N+1) avec roadmap priorisée |
| `data-optimize` | `/data-optimize` | Audit perf données (N+1, index, pagination, cache) |
| `decompose` | `/decompose` | Décompose un objectif en graphe Mikado |
| `journey` | `/journey` | Teste un parcours utilisateur depuis une issue |
| `changelog` | `/changelog` | Génère/met à jour CHANGELOG.md depuis git |
| `end-plan` | `/end-plan` | Archive le plan en cours, retourne sur la branche parente |
| `previously` | `/previously` | Snapshot synthétique du projet (tests, activité, santé) |

---

## gamedesign

Pour les projets de jeux vidéo.

### Skills

| Skill | Description |
|---|---|
| `dialogic-draft` | Rédaction de scènes dialogiques (spec, PNJ, arcs, DTL) |
| `dialogic-review` | Revue de graphes dialogiques (précheck, persona, audit, nœuds) |
| `bank` | Initialisation et challenge d'une bank d'assets narrative |

---

## writing

Pour les projets rédactionnels.

### Skills

| Skill | Description |
|---|---|
| `tone-finder` | Analyse et formalise le ton éditorial (style, typographie) |

---

## obsidian

Pour les projets utilisant Obsidian comme outil de gestion de projet.

### Skills

| Skill | Description |
|---|---|
| `project-status` | Export mémoire projet, audit et rapport de statut en format Obsidian |

---

## sc-php

Pour les stacks PHP.

### Skills

| Skill | Description |
|---|---|
| `bruno` | Tests API Bruno en CLI — scripts, environnements, assertions |

---

## Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) ≥ 1.x
- [AIDD framework](https://github.com/ai-driven-dev/aidd-framework) installé
- `gh` CLI pour les skills interagissant avec GitHub
