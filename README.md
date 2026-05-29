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
| Projet rédactionnel | `writing@my-marketplace` |
| Projet avec Obsidian | `obsidian@my-marketplace` |

---

## Plugins disponibles

| Plugin | `recommended` | Description |
|---|---|---|
| `aidd-overlay` | ✅ | Socle commun — workflows projet-agnostiques |
| `design` | — | Design system mobile-first : référence/brief → tokens, wireframes HTML, composants, audit, doctor/refactor (prod), export WordPress |
| `doc-writer` | — | Documentation : guides utilisateur, documents techniques, cahiers des charges (specification) |
| `sc-js` | — | Stack JavaScript : Nuxt / Vue SPA / Vite / Alpine / Astro |
| `sc-php` | — | Stack PHP : Laravel / Symfony / WordPress / HTMX |
| `sc-python` | — | Stack Python : Django / FastAPI |
| `sc-rust` | — | Stack Rust : Axum / Actix-web |
| `sc-tiers` | — | SaaS tiers : Firebase, Klaviyo, GTM, Clarity, PSI |
| `gamedesign` | — | Game design : dialogue, bank d'assets |
| `writing` | — | Rédaction : ton, style, typographie, chapitres |
| `obsidian` | — | Gestion notes Obsidian — projets Pro et PJ JDR solo |

---

## aidd-overlay

Plugin principal, installé globalement. Étend le framework AIDD avec des workflows transversaux.

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `alias` | `/alias` | Enchaîne des skills AIDD en une commande (plan→challenge, implement→review) |
| `harvest` | `/harvest` | Maintenance globale — réconcilie le tracker, extrait les décisions, purge les éphémères |
| `reconcile-normative` | `/reconcile-normative` | Détecte doublons, contradictions et règles obsolètes entre archives, mémoire et règles actives |
| `taste` | `/taste [fichier]` | Détecte les contenus obsolètes — assess-doc (claims vs codebase) ou assess-code (imports, symboles) |
| `foresee` | `/foresee <cible> [--depth N]` | Analyse prospective — problèmes à moyen terme sur docs, code ou dépendances |
| `dig` | `/dig` | Quiz interactif sur le codebase ou la memory bank — 5 questions, /20 |
| `web-optimize` | `/web-optimize` | Audit perf web (LCP, CLS, INP, bundle, N+1) avec roadmap priorisée |
| `data-optimize` | `/data-optimize` | Audit perf données (N+1, index, pagination, cache) |
| `readme` | `/readme` | Rédige ou met à jour un README.md (write depuis zéro, update par section) |
| `previously` | `/previously` | Snapshot synthétique du projet (tests, activité, santé) |
| `decompose` | `/decompose` | Décompose un objectif en graphe Mikado |
| `journey` | `/journey` | Teste un parcours utilisateur depuis une issue |
| `changelog` | `/changelog` | Génère/met à jour CHANGELOG.md depuis git |

---

## design

Plugin de design system mobile-first et responsive. Deux entrées (référence fournie ou brief/user story) convergent vers un système complet, puis production de wireframes et composants vérifiés contre ce système.

Philosophie : décider vite le trio palette / typo / icônes (jamais d'émoticons), établir les tokens, oser le contenu enrichi sur grand écran (toujours additif) et l'UX mobile-only (avec équivalent desktop), contrôler la conformité — et intervenir aussi sur des projets déjà en production.

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/design:setup` | Installe les règles mobile-first / responsive / iconographie / a11y dans `.claude/rules/08-design/` |
| `from-reference` | `/design:from-reference` | Établit le design system depuis une référence (screenshot, URL, Figma, CSS) |
| `from-brief` | `/design:from-brief` | Établit le design system depuis un besoin / user story (sans référence) |
| `wireframe` | `/design:wireframe` | User story → preview HTML mobile-first annoté (enrichi / mobile-only) |
| `component` | `/design:component` | Composant réutilisable à options/variants — spec puis implémentation |
| `audit` | `/design:audit` | Vérifie wireframes / pages / composants contre le système (rapport par sévérité, `--fix`) |
| `doctor` | `/design:doctor` | Diagnostic design d'un projet déjà en production + ordonnance de remédiation |
| `refactor` | `/design:refactor` | Migration incrémentale d'un code existant vers les tokens (vérifiée par audit) |
| `export-wordpress` | `/design:export-wordpress` | Bascule un design vers WordPress : `theme.json` (v3) + block patterns |

Artefacts produits dans le projet : `design/tokens.json` (source W3C DTCG), `design/design-system.md`, `design/adapters/{tokens.css,theme.css}` (générés), `design/components/*.md`, `design/wireframes/*.html`.

---

## doc-writer

Rédaction de documentation professionnelle. Distinct du plugin `writing` (narratif) et du skill `aidd-overlay:readme` (README de dépôt).

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `user-guide` | `/doc-writer:user-guide` | Documentation utilisateur final, orientée tâches (prise en main, how-to, dépannage, FAQ) — outline → write → review |
| `technical-document` | `/doc-writer:technical-document` | Doc développeur/ops (architecture, API, intégration, runbook, design note), vérifiée contre le code — scope → write → verify |
| `specification` | `/doc-writer:specification` | Cahier des charges : exigences fonctionnelles/non-fonctionnelles (ID + MoSCoW + critère d'acceptation), périmètre in/out, livrables — elicit → draft → challenge |

---

## sc-js

Pour les stacks JavaScript (Nuxt 3, Vue SPA, Vite, Alpine.js, Astro, 11ty).

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/sc-js:setup` | Installe **toutes** les règles JS/TS (coding rules + perf pivots + data pivots) dans `.claude/rules/` |
| `sniff` | `/sc-js:sniff` | Détecte le framework et les ORMs depuis `package.json`, puis installe/met à jour uniquement les règles pertinentes |

---

## sc-php

Pour les stacks PHP (Laravel, Symfony, WordPress, HTMX).

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-php:sniff` | Détecte la stack depuis `composer.json` et sentinelles, puis installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-php:audit` | Délègue la revue PHP à `aidd-dev:reviewer` en chargeant les pivots de capacité applicables |
| `log-analysis` | `/sc-php:log-analysis` | Analyse les logs PHP/Apache/Nginx (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `bruno` | `/sc-php:bruno` | Tests API Bruno en CLI — scripts, environnements, assertions |

Note: skill `bruno` is PHP-specific and is intentionally not propagated to sc-python/sc-rust.

---

## sc-python

Pour les stacks Python (Django, FastAPI, Flask).

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/sc-python:setup` | Installe **toutes** les règles Python (perf pivots + data pivots) dans `.claude/rules/` |
| `sniff` | `/sc-python:sniff` | Détecte la stack depuis les manifests Python, puis installe/met à jour uniquement les règles pertinentes |

---

## sc-rust

Pour les stacks Rust (Axum, Actix-web).

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/sc-rust:setup` | Installe **toutes** les règles Rust (perf pivots + data pivots) dans `.claude/rules/` |
| `sniff` | `/sc-rust:sniff` | Détecte les crates depuis `Cargo.toml`, puis installe/met à jour uniquement les règles pertinentes |

---

## sc-tiers

Pour les projets intégrant des services SaaS tiers.

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/sc-tiers:setup` | Installe les règles de consommation SaaS (Firebase, Klaviyo, GTM, Clarity, PSI/Lighthouse) + data pivots (Supabase, DynamoDB, Hasura) dans `.claude/rules/` |

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

Pour les projets rédactionnels (romans, RPG, guides, articles).

### Skills

| Skill | Description |
|---|---|
| `forge` | Développe et challenge le concept d'un projet narratif jusqu'à validation de la structure |
| `toc` | Génère la table des matières depuis un document source |
| `write` | Rédige des chapitres narratifs (roman ou RPG) en Markdown, selon la TOC |
| `upgrade` | Améliore itérativement un texte ou un prompt d'atelier par critique structurée |
| `review` | Pipeline de relecture qualitative basée sur persona (analyse, audit, nœuds) |
| `tone-finder` | Génère ou met à jour un fichier de style pour un univers éditorial |
| `persona` | Crée et affine des fichiers YAML de persona lecteur pour le pipeline de relecture |
| `research` | Recherche documentaire cross-référencée pour projets d'écriture |
| `storyboard` | Identifie les moments visuels clés d'un chapitre et génère des briefs d'illustration |
| `lore-extract` | Extrait et organise le lore d'un univers depuis des fichiers sources bruts |
| `rules-keeper` | Restructure un fichier de règles de jeu en format optimisé pour LLM |

---

## obsidian

Pour la gestion des notes Obsidian — projets Pro et personnages JDR solo.

### Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (Jauges & Tarot) : new, fill, reorganize, log-session, show |

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
