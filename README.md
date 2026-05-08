# AIDD Claude Custom

Collection de commandes personnalisées, règles et templates pour les outils de développement agentique, conçus pour le framework **AIDD** (AI-Driven Development).

## Priorité d'intégration

| Priorité | Outil | Fréquence d'utilisation |
|----------|-------|--------------------------|
| 1️⃣ | Claude Code | Quotidien |
| 2️⃣ | OpenCode | Quotidien |
| 3️⃣ | GitHub Copilot | Pontuel |
| 4️⃣ | Cursor | Rare |

## Structure du dépôt

```
.
├── agents/                    # Agents Claude Code
├── commands/                  # Slash commands Claude Code (/...)
├── memory/                    # Mémoire externe (injectée dans aidd_docs/memory/external/)
├── misc/                      # Ressources optionnelles (non installées par défaut)
│   ├── commands/
│   ├── rules/
│   └── templates/
├── rules/                     # Règles Claude Code
├── skills/                    # Skills Claude Code (/skill:...)
├── templates/                 # Templates (copiés dans aidd_docs/)
│   └── dev/                   # Templates techniques (checklists, audits)
└── .claude-plugin/            # Métadonnées plugin marketplace
```

## Installation automatique

Utiliser `aidd-custom` pour installer automatiquement selon les outils détectés :

```bash
aidd-custom install
```

Détecte automatiquement : `.claude/`, `.opencode/`, `.cursor/`, `.github/`

## Guidelines de rédaction par outil

### 1. Claude Code (priorité最高的)

**Fichiers** : `commands/`, `rules/`, `templates/`, `CLAUDE.md`

**Format** :
- **Commands** : Markdown avec frontmatter YAML, sections `## Goal`, `## Instructions`, steps numérotés
- **Rules** : Bullet points concis, pas de prose
- **Templates** : Markdown avec frontmatter YAML, structure à remplir

**Conventions** :
- `$ARGUMENTS` pour les arguments
- Backticks pour le code inline
- `$HOME` = projet root
- Utiliser les chemins relatifs

### 2. OpenCode (priorité 2)

**Fichiers** : `.opencode/commands/`, `.opencode/agents/`, `.opencode/rules/`, `AGENTS.md`

**Différences avec Claude** :
- Même format de base, mais estructura légèrement différente
- **Commands** : dossier `commands/aidd/custom/` au lieu de `commands/custom/`
- **Instructions root** : `AGENTS.md` au lieu de `CLAUDE.md`
- **Agents** : dans `.opencode/agents/` directement

**Règles de conversion automatique** :
- Les commands sont copiées telles quelles dans `.opencode/commands/aidd/custom/`
- Les rules sont copiées dans `.opencode/rules/custom/`

### 3. GitHub Copilot (priorité 3)

**Fichiers** : `instructions/`, `prompts/custom/`, `.github/instructions/custom/`

**Format** :
- **Instructions** : `.github/copilot-instructions.md` (root) ou `instructions/` (multi-fichier)
- **Prompts** : `.github/prompts/custom/*.prompt.md`

**Conversion depuis Claude** :
- Les rules sont converties en `*.instructions.md` dans `.github/instructions/custom/`
- Les commands sont converties en `*.prompt.md` dans `.github/prompts/custom/`

**Format instructions** :
```markdown
---
description: <description courte>
---

# <Titre>

<Contenu converti en instructions concises>
```

**Format prompts** :
```markdown
---
description: <description>
---

You are an AI developer assistant...

## Context
<contexte>

## Task
<tâche>

## Output
<format de sortie attendu>
```

### 4. Cursor (priorité 4)

**Fichiers** : `rules-mdc/custom/`, `.cursor/rules/`

**Format MDC** :
```markdown
---
description: <description courte>
---

# <Titre>

<contenu>
```

**Conversion automatique** :
- Les rules `.md` sont converties en `.mdc` avec frontmatter
- Ajout automatique de la description basée sur le filename

## Commandes disponibles

| Commande | Description |
|---|---|
| `/migrate_docs` | Migre la documentation existante dans la memory bank AIDD |
| `/aidd:02:decompose_mikado` | Décompose un objectif en graphe de dépendances Mikado |
| `/custom:02:previously` | Snapshot synthétique du projet — tests, couverture, activité récente, santé |
| `/aidd:10:taste` | Évalue si un fichier, plan ou document est toujours d'actualité vs le code réel |
| `/journey` | Exécute un parcours utilisateur depuis une issue, log les résultats étape par étape |
| `/custom:06:test_bruno` | Lance les tests Bruno en CLI contre l'environnement local |
| `/custom:07:project_memory` | Synthétise les fichiers de mémoire et décisions en un markdown exportable |
| `/custom:07:project_status` | Exporte un rapport de statut projet avec audit, sécurité et plan d'action 7 jours |
| `/changelog` | Génère ou met à jour CHANGELOG.md à partir de git, commit et tag la release |
| `/custom:08:end_plan` | Archive le plan en cours, exécute /learn, retourne sur la branche parente |
| `/aidd:10:foresee` | Analyse prospective — détecte les problèmes à moyen terme invisibles aux tests et linters |

## Règles

| Règle | Description |
|---|---|
| `01-file-language-and-style` | Langue des fichiers selon l'audience — anglais pour LLM, français pour humains |
| `01-normative-vs-archive` | Le contenu normatif (must / never / always) doit vivre dans les chemins auto-loadés |
| `04-git-main-protection` | Interdit git commit/push sur main sans validation |
| `07-dry-refactor` | Évite la duplication — extrait la logique partagée avant de copier, enforce DRY |
| `09-challenge-plan` | Challenge le plan jusqu'à 0 deal breakers |
| `09-double-review-after-implement` | Double review après implémentation |
| `09-harvest-trigger` | Suggère `/harvest` proactivement quand `aidd_docs/tasks/` s'accumule |
| `09-plan-before-implement` | Exige un plan avant toute implémentation |

## Agents

| Agent | Description |
|---|---|
| `ada` | Agent quiz interactif — apprend et révise le codebase ou la memory bank |

## Skills

| Skill | Description |
|---|---|
| `harvest` | Maintenance globale — réconcilie le tracker, extrait les décisions en mémoire, purge les fichiers éphémères |
| `reconcile-normative` | Réconcilie le contenu normatif entre archives, mémoire projet et règles codifiées — détecte doublons, contradictions et règles obsolètes |
| `web-optimize` | Audit perf web framework-aware (LCP, CLS, INP, TBT, bundle size, N+1) avec checklist adaptée au stack et roadmap priorisée |

## Templates

| Template | Description |
|---|---|
| `harvest.md` | Rapport de session harvest — inventaire, décisions extraites, issues fermées, fichiers purgés |
| `journey.md` | Rapport de test de parcours utilisateur lié à une issue |
| `previously.md` | Snapshot synthétique pour la commande /previously |
| `project_memory.md` | Export de la mémoire projet et des décisions avec métriques de taille |
| `project_status.md` | Rapport de statut projet avec audit, sécurité et plan d'action |
| `quiz_report.md` | Rapport de session quiz avec score et détail par question |
| `dev/perf_checklist_nuxt.md` | Checklist d'audit perf Nuxt 3 (LCP, CLS, INP, bundle, render-blocking) — utilisée par /web-optimize |

## Memory (mémoire externe)

Fichiers injectés dans `aidd_docs/memory/external/` du projet cible — chargés uniquement sur demande explicite (pas en auto-load), pour transmettre des intentions de gouvernance ou raisonnements LLM réutilisables entre projets.

| Fichier | Description |
|---|---|
| `llm-thoughts.md` | Intentions de gouvernance mémoire — load probability, triage binaire, risques de bloat |

## Misc (ressources optionnelles)

Fichiers non installés par défaut — à copier manuellement selon les besoins du projet.

| Catégorie | Fichier | Description |
|---|---|---|
| Rules | `04-agentic-tooling.md` | Bonnes pratiques d'outillage agentique |
| Rules | `04-bruno.md` | Règles client API Bruno pour fichiers `.bru` |
| Rules | `06-agentic-tests.md` | Stratégie de tests pour projets agentiques |
| Rules | `07-agentic-type-safety.md` | Type safety dans les contextes agentiques |
| Rules | `07-async-components-marketing.md` | Composants async pour pages marketing |
| Rules | `07-preconnect-strategy.md` | Stratégie preconnect pour les ressources externes |
| Rules | `08-agentic-branching.md` | Stratégie de branches pour le développement agentique |
| Rules | `00-shared-component-scope.md` | Périmètre des composants partagés |
| Rules | `01-seo-robots-txt.md` | Directives robots.txt pour le SEO |
| Rules | `03-icons.md` | Pattern lucide-vue-next |
| Rules | `03-image-optimization.md` | Optimisation images WebP |
| Rules | `05-test-localstorage.md` | Tests impliquant le localStorage |
| Templates | `agentic_readiness_framework.md` | Grille d'évaluation architecture compatible IA |
| Templates | `architecture_summary.md` | Résumé d'architecture projet |
| Templates | `audit_score.md` | Score d'audit projet |
| Commands | `01/agentic_architecture.md` | Architecture agentique initiale |
| Instructions | `instructions.md` | Instructions pour Mistral Vibe avec AIDD |

## Ajout de nouveau contenu

Pour ajouter une nouvelle commande ou règle :

1. **Créer le fichier source** :
   - Commandes → `commands/<phase>_<nom>.md`
   - Règles → `rules/<catégorie>-<nom>.md`
   - Templates → `templates/<nom>.md`
   - Agents → `agents/<nom>.md`
   - Skills → `skills/<nom>/SKILL.md`
   - Mémoire externe → `memory/<nom>.md`
   - Ressources optionnelles → `misc/rules/`, `misc/templates/`, `misc/commands/`

2. **Mettre à jour ce README** avec la nouvelle entrée dans le tableau correspondant

## Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [OpenCode](https://github.com/opencodeai/opencode)
- [AIDD](https://github.com/ai-driven-dev/aidd-framework)
- `gh` CLI pour les commandes interagissant avec GitHub