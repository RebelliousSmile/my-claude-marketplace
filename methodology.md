# Méthodologie Claude Code v3

**Version**: 3.1.0
**Compatible avec**: Claude Code 2.1+
**Dernière mise à jour**: Janvier 2026

---

## 1. Principes Fondamentaux

### DRY / SOLID
Chaque information n'existe qu'à un seul endroit. Chaque composant a une responsabilité unique.

### Fail Fast
Valider avant d'implémenter, tester pendant, corriger immédiatement.

### Séparation Logique / Configuration
Le workflow décrit **quoi** faire et **quand**. La configuration projet décrit **comment** et avec **quels outils**.

### Progressive Disclosure
Charger le minimum nécessaire, approfondir sur demande explicite.

---

## 2. Architecture des Composants

### 2.1 Structure Projet Recommandée

```
projet/
├── CLAUDE.md                    # Instructions persistantes (< 5000 tokens)
├── .claude/
│   ├── settings.json            # Hooks, permissions (user-level)
│   ├── settings.local.json      # Overrides personnels (gitignored)
│   ├── agents/                  # Agents projet
│   │   └── [agent-name].md
│   ├── skills/                  # Skills projet
│   │   └── [skill-name]/
│   │       └── SKILL.md
│   ├── commands/                # Slash commands
│   │   └── [command-name].md
│   └── hooks/                   # Scripts hooks (optionnel)
│       └── [script].sh
├── project-config.md            # Configuration spécifique projet
└── documentation/
    ├── memory-bank/             # Documentation hiérarchisée
    │   ├── core/                # Toujours chargé
    │   ├── development/         # Via Skills
    │   ├── architecture/        # Via Agents
    │   └── reference/           # Sur demande
    ├── tasks/                   # Backlog de tâches
    └── reviews/                 # Code reviews archivées
```

### 2.2 Hiérarchie de Chargement

| Niveau | Contenu | Chargement | Tokens Max |
|--------|---------|------------|------------|
| **CLAUDE.md** | Quick-start, conventions critiques | Toujours | < 5k |
| **core/** | Conventions essentielles | Référencé dans CLAUDE.md | < 10k |
| **development/** | Patterns, testing | Via Skills | Sur demande |
| **architecture/** | ADRs, décisions techniques | Via Agents | Sur demande |
| **reference/** | Documentation exhaustive | Explicite uniquement | Sur demande |

---

## 3. Composants Claude Code

### 3.1 Agents Natifs (Built-in)

Claude Code inclut des agents natifs optimisés. **Utiliser en priorité avant les agents custom.**

| Agent | Model | Tools | Quand l'utiliser |
|-------|-------|-------|------------------|
| **Explore** | Haiku | Read-only | Exploration codebase, recherche fichiers, questions sur le code |
| **Plan** | Inherit | Read-only | Recherche approfondie en mode plan |
| **general-purpose** | Inherit | Tous | Tâches complexes multi-étapes nécessitant écriture |

**Agents utilitaires:**
| Agent | Model | Usage |
|-------|-------|-------|
| **Bash** | - | Commandes terminal dans contexte séparé |
| **statusline-setup** | Sonnet | Configuration `/statusline` |
| **Claude Code Guide** | Haiku | Questions sur fonctionnalités Claude Code |

**Recommandations:**
1. **Exploration** → Utiliser `Explore` (rapide, économique)
2. **Recherche + Plan** → Utiliser `Plan`
3. **Tâches complexes** → Utiliser `general-purpose` ou agent custom spécialisé
4. **Rôle métier spécifique** → Agent custom (code-reviewer, debugger, etc.)

### 3.2 Tableau de Décision

| Composant | Trigger | Contexte | Tools | Cas d'Usage |
|-----------|---------|----------|-------|-------------|
| **CLAUDE.md** | Toujours | Partagé | N/A | Conventions critiques, stack |
| **Skill** | Model-invoked | Partagé/Fork | Hérité | Expertise domaine, patterns |
| **Agent natif** | Model | **Isolé** | Prédéfini | Exploration, plan, tâches génériques |
| **Agent custom** | Model ou User | **Isolé** | Configurable | Tâches complexes, rôles spécialisés |
| **Command** | User (`/cmd`) | Partagé/Fork | Configurable | Workflows, raccourcis |
| **Hook** | Events système | N/A | N/A | Validation, automation |

### 3.3 Différences Clés

#### Skills vs Agents

```
┌─────────────────────────────────────────────────────────────┐
│                          SKILL                               │
├─────────────────────────────────────────────────────────────┤
│ • Chargé automatiquement selon contexte                     │
│ • Partage le contexte de la conversation                    │
│ • PAS de champ `allowed-tools` (hérite des permissions)     │
│ • Frontmatter: name, description, version                   │
│ • Pour: expertise, patterns, validation                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          AGENT                               │
├─────────────────────────────────────────────────────────────┤
│ • Invoqué explicitement ou par le modèle                    │
│ • Contexte ISOLÉ (propre fenêtre de contexte)              │
│ • Champ `tools` optionnel pour restreindre                 │
│ • Frontmatter: name, description, model, color, tools      │
│ • Pour: tâches complexes, analyse approfondie              │
└─────────────────────────────────────────────────────────────┘
```

#### Commands vs Skills

```
┌─────────────────────────────────────────────────────────────┐
│                         COMMAND                              │
├─────────────────────────────────────────────────────────────┤
│ • Invoqué par l'utilisateur: /command-name                  │
│ • `allowed-tools` pour restreindre les outils              │
│ • `$ARGUMENTS`, `$1`, `$2` pour les paramètres             │
│ • Pour: workflows répétitifs, raccourcis                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Frontmatter Reference

#### Skill SKILL.md
```yaml
---
name: skill-name                    # Requis: kebab-case (max 64 chars)
description: This skill should be used when...  # Requis: triggers explicites (max 1024 chars)
# --- Optionnels ---
allowed-tools: Read, Grep, Glob     # Restreindre les outils disponibles
model: sonnet                       # Override du modèle
context: fork                       # Exécution isolée (contexte séparé)
agent: general-purpose              # Type d'agent si context: fork
user-invocable: true                # Visible dans menu slash (défaut: true)
disable-model-invocation: false     # Empêcher invocation auto par le modèle
hooks:                              # Hooks spécifiques à la skill
  PreToolUse: [...]
---
```

#### Agent .md
```yaml
---
name: agent-name                    # Requis: kebab-case
description: Expert in... Use PROACTIVELY when... # Requis: avec triggers
# --- Optionnels ---
tools: Read, Write, Grep            # Outils autorisés (hérite tout si omis)
disallowedTools: Bash               # Outils interdits
model: inherit                      # inherit, sonnet, opus, haiku
permissionMode: default             # default, acceptEdits, dontAsk, bypassPermissions, plan
skills: skill-a, skill-b            # Skills à charger (contenu injecté)
hooks:                              # Hooks spécifiques à l'agent
  PreToolUse: [...]
  PostToolUse: [...]
  Stop: [...]
---
```

#### Command .md
```yaml
---
description: Brief description      # Pour /help
# --- Optionnels ---
allowed-tools: Read, Write, Bash(git:*)  # Restriction d'outils
argument-hint: [arg1] [arg2]        # Documentation des arguments
model: sonnet                       # Override du modèle
context: fork                       # Exécution isolée
agent: general-purpose              # Type d'agent si context: fork
disable-model-invocation: true      # Empêcher invocation via Skill tool
hooks:                              # Hooks spécifiques
  PreToolUse: [...]
---
```

---

## 4. Hooks System

### 4.1 Events Disponibles

| Event | Quand | Use Case |
|-------|-------|----------|
| `PreToolUse` | Avant exécution d'un outil | Validation, sécurité |
| `PostToolUse` | Après exécution d'un outil | Logging, post-processing |
| `Stop` | Quand l'agent principal s'arrête | Vérification de complétion |
| `SubagentStart` | Quand un subagent démarre | Setup environnement |
| `SubagentStop` | Quand un subagent s'arrête | Cleanup, validation |
| `SessionStart` | Début de session | Chargement contexte |
| `UserPromptSubmit` | Soumission d'un prompt | Guidance, warnings |

### 4.2 Types de Hooks

#### Command Hook (rapide, déterministe)
```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 60
}
```

#### Prompt Hook (flexible, contextuel)
```json
{
  "type": "prompt",
  "prompt": "Validate if this operation is safe: $TOOL_INPUT",
  "timeout": 30
}
```

### 4.3 Configuration Hooks

#### Dans settings.json (user/project)
```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate file write safety."
        }
      ]
    }
  ],
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Verify task completion."
        }
      ]
    }
  ]
}
```

#### Dans plugin hooks.json
```json
{
  "description": "Plugin hooks",
  "hooks": {
    "PreToolUse": [...],
    "Stop": [...]
  }
}
```

### 4.4 Stratégie Recommandée

**Pattern: Block-at-Commit, Not Block-at-Write**

Ne pas bloquer pendant l'écriture. Laisser terminer le plan, puis valider au moment du commit.

```
Write → Continue → Write → Continue → Commit → VALIDATE (hooks)
```

---

## 5. Workflow à Boucles

### 5.1 Concept

Chaque étape valide avant de passer à la suivante. Boucle jusqu'à succès ou escalade.

```
INIT → PLAN → IMPLEMENT → REVIEW → FINALIZE
         ↺        ↺          ↺
```

### 5.2 Étapes

| Phase | Loop | Max Retries | Action si échec |
|-------|------|-------------|-----------------|
| Planning | Plan → Review → Adjust | 3 | Checkpoint utilisateur |
| Implementation | Code → Validate → Fix | 3 | Checkpoint utilisateur |
| Review | Review → Fix → Re-review | 3 | Manual review required |

### 5.3 Stratégies d'Exécution

| Stratégie | Condition | Comportement |
|-----------|-----------|--------------|
| **DIRECT** | < 5 fichiers, risque faible | Implémentation unique + commit |
| **STEP-BY-STEP** | > 5 fichiers, risque élevé | Milestones + commits intermédiaires |

### 5.4 Intent Mapping

Les intents abstraits sont résolus via `project-config.md`:

| Intent | Description | Commande Type |
|--------|-------------|---------------|
| `VALIDATE` | Analyse statique | lint, typecheck |
| `TEST_UNIT` | Tests unitaires | unit tests, contract tests |
| `TEST_E2E` | Tests E2E | e2e tests (critiques uniquement) |
| `QUALITY` | Validation complète | VALIDATE + TEST_UNIT |

### 5.5 Checkpoints

Déclencher un checkpoint quand:
- Milestone terminé (mode step-by-step)
- Échecs de validation répétés (> 3)
- Context window > 80%
- Opération destructive imminente
- Plus de 5 fichiers impactés
- Changement architectural détecté

---

## 6. Standards de Développement

### 6.1 Règles de Décision

**Avant modification:**
- [ ] Requirement clair identifié
- [ ] État actuel compris (VALIDATE exécuté)
- [ ] Impact évalué

**Avant refactoring:**
- [ ] Justification technique (test fail, lint error)
- [ ] Scope limité (< 5 fichiers)
- [ ] Séparé du feature work

### 6.2 Anti-Patterns

| ❌ Ne Jamais | ✅ Toujours |
|-------------|-------------|
| Committer sans VALIDATE | Valider avant commit |
| Implémenter hors scope | Rester focus sur la tâche |
| Refactorer pendant un fix | Séparer refactor et fix |
| Assumer sans vérifier | Utiliser les outils |
| Gros changements sans checkpoint | Demander confirmation |

### 6.3 Recovery

Si contexte perdu:
1. Lire `project-config.md`
2. Lire `CLAUDE.md`
3. Exécuter `VALIDATE`
4. Consulter historique git récent

---

## 7. Stratégie de Tests

### 7.1 Ratio 70/20/10

| Couche | % | Cible |
|--------|---|-------|
| Validation statique | 70% | Lint, types, format |
| Tests de contrat | 20% | Interfaces publiques |
| Tests E2E | 10% | Chemins critiques uniquement |

### 7.2 Tests de Contrat

- Tester l'interface publique, pas l'implémentation
- < 10 lignes par test
- Un assert par test (idéalement)
- Noms descriptifs

### 7.3 Temps Cibles

| Usage | Intent | Temps |
|-------|--------|-------|
| Quotidien | `TEST_UNIT` | < 5s |
| Avant commit | `VALIDATE` | < 30s |
| Avant deploy | `QUALITY` | < 2min |

---

## 8. Agents : Collaboration

### 8.1 Contraintes Importantes

- Subagents **ne peuvent pas** spawner d'autres subagents (pas de nesting)
- Maximum **7 Task agents** en parallèle
- Chaque subagent a un **contexte isolé**
- Résultats retournent comme **summary** uniquement

### 8.2 Pattern de Collaboration

```
Agent Principal
    ├── Task → Agent A → Résultat A
    ├── Task → Agent B → Résultat B  (parallèle si possible)
    └── Synthèse des résultats
```

### 8.3 Classification des Agents

| Type | Mots-clés Description | Usage |
|------|----------------------|-------|
| PLAN_REVIEW | "review", "plan", "architecture" | Validation de plans |
| CODE_REVIEW | "code", "quality", "security" | Review de code |
| IMPLEMENTATION | "implement", "build", "develop" | Génération de code |
| DOCUMENTATION | "doc", "readme", "comment" | Documentation |

---

## 9. Outils Disponibles

### 9.1 Outils Standard

| Outil | Description | Lecture | Écriture |
|-------|-------------|---------|----------|
| `Read` | Lire fichiers | ✅ | ❌ |
| `Write` | Écrire fichiers | ❌ | ✅ |
| `Edit` | Modifier fichiers | ✅ | ✅ |
| `Bash` | Exécuter commandes | ✅ | ✅ |
| `Glob` | Rechercher fichiers | ✅ | ❌ |
| `Grep` | Rechercher contenu | ✅ | ❌ |
| `Task` | Lancer subagent | N/A | N/A |

### 9.2 Patterns d'Utilisation

```bash
# Discovery
Glob: **/*.{ts,js}           # Trouver fichiers
Grep: import|from            # Chercher patterns

# Analysis
Read: src/main.ts            # Lire fichier
Bash: git diff --name-only   # Git operations

# Modification
Write: src/new-file.ts       # Créer fichier
Edit: src/existing.ts        # Modifier fichier
```

### 9.3 Fonctionnalités Avancées (Claude Code 2.0+)

#### Checkpoints & Rewind

Claude Code sauvegarde automatiquement l'état avant chaque modification.

| Action | Raccourci | Description |
|--------|-----------|-------------|
| Rewind | `Esc` × 2 | Annuler les dernières modifications |
| Rewind | `/rewind` | Revenir à un point précédent |

**Quand utiliser** :
- Modification non désirée appliquée
- Exploration d'une approche alternative
- Retour arrière après erreur

#### Background Tasks

Exécuter des commandes longues sans bloquer la conversation.

| Action | Raccourci | Description |
|--------|-----------|-------------|
| Lancer en arrière-plan | `Ctrl+B` | Dev servers, builds longs |
| Lister les tâches | `/tasks` | Voir les tâches actives |

**Cas d'usage** :
- Démarrer un serveur de développement
- Exécuter des tests E2E longs
- Builds et compilations

#### LSP Tool (Intelligence de Code)

Outil pour la navigation dans le code :
- Go-to-definition
- Find references
- Hover documentation

---

## 10. Maintenance

### 10.1 Checklist Mensuelle

- [ ] Skills encore pertinentes ?
- [ ] Agents utilisés ou à retirer ?
- [ ] Hooks fonctionnels ?
- [ ] CLAUDE.md à jour ?
- [ ] Nouvelles features Claude Code à adopter ?

### 10.2 Évolutions

Lors de mises à jour Claude Code:
1. Lire changelog officiel
2. Identifier breaking changes
3. Tester en environnement isolé
4. Mettre à jour composants un par un
5. Valider avec `/agents` et tests

---

## Annexe A : Checklist de Validation

### Skill
- [ ] `SKILL.md` en majuscules (case-sensitive)
- [ ] `---` sur ligne 1 (pas de ligne vide avant)
- [ ] `name`: kebab-case (max 64 chars)
- [ ] `description`: triggers explicites (max 1024 chars)
- [ ] `allowed-tools`: optionnel, pour restreindre les outils
- [ ] `context: fork` si isolation nécessaire
- [ ] `user-invocable`: false si skill interne uniquement

### Agent
- [ ] Fichier dans `.claude/agents/`
- [ ] `name`: kebab-case
- [ ] `description`: avec "PROACTIVELY" ou triggers clairs
- [ ] `model`: inherit (défaut), sonnet, opus, haiku
- [ ] `tools`: liste si restriction nécessaire
- [ ] `disallowedTools`: outils à interdire
- [ ] `permissionMode`: si besoin de permissions spéciales
- [ ] `skills`: si skills à charger dans l'agent

### Command
- [ ] Fichier dans `.claude/commands/`
- [ ] `description` présent (pour /help)
- [ ] `allowed-tools` si restriction nécessaire
- [ ] `$ARGUMENTS` ou `$1`, `$2` pour paramètres
- [ ] `context: fork` si isolation nécessaire
- [ ] `disable-model-invocation`: true si invocation manuelle uniquement

### Hook
- [ ] Event valide: PreToolUse, PostToolUse, Stop, SubagentStart, SubagentStop, SessionStart, UserPromptSubmit
- [ ] `type`: command ou prompt
- [ ] `timeout` raisonnable
- [ ] `once: true` si exécution unique par session

### Agents Natifs
- [ ] Utiliser `Explore` pour exploration (rapide, économique)
- [ ] Utiliser `Plan` pour recherche en mode plan
- [ ] Utiliser `general-purpose` pour tâches complexes génériques
- [ ] Créer agent custom seulement si rôle métier spécifique

---

**Document Type**: Méthodologie
**Compatible avec**: Claude Code 2.1+
**Version**: 3.1.0
