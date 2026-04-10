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
├── commands/custom/           # Slash commands Claude Code (/custom:...)
├── rules/custom/              # Règles Claude Code
├── templates/custom/          # Templates (copiés dans aidd_docs/)
│
└── instructions/              # Fichiers d'instructions root
    ├── CLAUDE.md              # Pour Claude Code (root)
    ├── AGENTS.md              # Pour OpenCode (root)
    └── copilot-instructions.md  # Pour Copilot
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
| `/custom:01:migrate_docs` | Migre la documentation existante dans la memory bank AIDD |
| `/custom:02:decompose_mikado` | Décompose un objectif en graphe de dépendances Mikado |
| `/custom:02:previously` | Snapshot synthétique du projet — tests, couverture, activité récente, santé |
| `/custom:06:journey` | Exécute un parcours utilisateur depuis une issue, log les résultats étape par étape |
| `/custom:07:project_status` | Exporte un rapport de statut projet avec audit, sécurité et plan d'action 7 jours |
| `/custom:08:changelog` | Génère ou met à jour CHANGELOG.md à partir de git |
| `/custom:08:close_issue` | Review du plan, génère une entrée changelog, puis ferme l'issue liée |
| `/custom:08:end_plan` | Archive le plan en cours, exécute /learn, retourne sur la branche parente |

## Règles

| Règle | Description |
|---|---|
| `04-git-main-protection` | Interdit git commit/push sur main sans validation |
| `04-rules-namespace` | Namespace custom/ pour règles projet |
| `08-issue-closing` | Protocole de clôture de ticket avec plan & review |
| `09-challenge-plan` | Challenge le plan jusqu'à 0 deal breakers |
| `09-double-review-after-implement` | Double review après implémentation |
| `09-plan-before-implement` | Exige un plan avant toute implémentation |

## Templates (`aidd_docs/`)

| Template | Description |
|---|---|
| `close-issue.md` | Commentaire de clôture d'issue — résumé, changelog et checklist |
| `journey.md` | Rapport de test de parcours utilisateur lié à une issue |
| `previously.md` | Snapshot synthétique pour la commande /previously |
| `project_status.md` | Rapport de statut projet avec audit, sécurité et plan d'action |

## Ajout de nouveau contenu

Pour ajouter une nouvelle commande ou règle :

1. **Créer le fichier source** :
   - Commandes → `commands/custom/<phase>/<nom>.md`
   - Règles → `rules/custom/<catégorie>-<nom>.md`
   - Templates → `templates/custom/<nom>.md`

2. **Mettre à jour ce README** avec la nouvelle entrée dans le tableau correspondant

## Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [OpenCode](https://github.com/opencodeai/opencode)
- [AIDD](https://github.com/ai-driven-dev/aidd-framework)
- `gh` CLI pour les commandes interagissant avec GitHub