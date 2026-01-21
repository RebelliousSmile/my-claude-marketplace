---
name: task
description: Execute complete task with validation loops. Reads workflow logic from automated-workflow.md and project config from project-config.md. Use for any development task requiring plan → implement → review → commit cycle.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, TodoWrite
---

# Task Execution Command

Orchestrateur léger qui exécute le workflow défini dans `automated-workflow.md`.

**Cette commande ne contient PAS de logique métier** - elle délègue à :
- `automated-workflow.md` → Logique du workflow (loops, conditions, fallbacks)
- `project-config.md` → Commandes et configuration projet

---

## Initialisation

### 1. Charger la Configuration

```
# Ordre de priorité
1. Read documentation/memory-bank/core/automated-workflow.md
   → Si absent: Read .claude/automated-workflow.md
   → Si absent: FALLBACK (workflow minimal intégré)

2. Read documentation/memory-bank/projects/{project}/project-config.md
   → Si absent: Read project-config.md
   → Si absent: Read CLAUDE.md (chercher section Commands)
   → Si absent: AUTO-DETECT (package.json, pyproject.toml, Makefile, etc.)
   → Si absent: PROMPT USER
```

### 2. Découvrir les Agents

```
Scan:
├── .claude/agents/*.md (projet)
└── ~/.claude/agents/*.md (utilisateur)

Classifier par description:
├── PLAN_REVIEW: mots-clés "review", "plan", "architecture"
├── CODE_REVIEW: mots-clés "code", "quality", "security", "test"
└── Autres: selon description

Construire capability_map:
├── plan_reviewers: [agents]
├── code_reviewers: [agents]
├── backgroundable: [agents pouvant tourner en parallèle]
└── count: N
```

### 3. Valider les Prérequis

```
Si workflow non trouvé ET fallback désactivé:
    ERROR: "automated-workflow.md not found. Cannot execute task."
    STOP

Si project-config non trouvé:
    WARNING: "No project-config found. Using auto-detection."
    Tenter auto-détection des commandes
    
Si aucune commande détectée:
    PROMPT: "Enter command for VALIDATE intent (or 'skip'):"
    Stocker réponse pour cette session
```

---

## Exécution

### Phase 1: Analyse de la Tâche

```
Input: $ARGUMENTS (description ou fichier de tâche)

Si fichier existe:
    Read fichier → extraire description, critères, scope
Sinon:
    Utiliser $ARGUMENTS comme description

Estimer complexité:
├── Temps estimé
├── Nombre de fichiers
├── Niveau de risque
└── Dépendances

Déterminer stratégie:
├── DIRECT: < seuil fichiers ET < seuil temps ET risque faible
└── STEP-BY-STEP: sinon

(Seuils définis dans automated-workflow.md ou defaults: 5 fichiers, 2h)
```

### Phase 2: Planning Loop

```
Référence: automated-workflow.md Section 3

attempt = 0
max_attempts = 3 (ou workflow.retry_policy.planning)

LOOP:
    Générer plan technique
    
    SI capability_map.plan_reviewers non vide:
        Lancer reviews en parallèle (max 7 backgrounded)
        Collecter résultats
        Merger feedback
    SINON:
        Self-review avec checklist du workflow
    
    SI approved:
        BREAK → Phase 3
    SINON SI attempt < max_attempts:
        Ajuster plan selon feedback
        attempt++
        CONTINUE
    SINON:
        CHECKPOINT: Demander guidance utilisateur
```

### Phase 3: Implementation Loop

```
Référence: automated-workflow.md Section 4

SI stratégie == DIRECT:
    Implémenter tout
    run_intent(VALIDATE)
    run_intent(TEST_UNIT)
    → Phase 4

SI stratégie == STEP-BY-STEP:
    Pour chaque milestone:
        Implémenter milestone
        run_intent(VALIDATE)
        SI échec: fix loop (max 3)
        run_intent(TEST_UNIT)
        SI échec: fix loop (max 3)
        CHECKPOINT: validation utilisateur
        Commit milestone
    → Phase 4
```

### Phase 4: Review Loop

```
Référence: automated-workflow.md Section 5

attempt = 0
max_attempts = 3

LOOP:
    SI capability_map.code_reviewers non vide:
        Lancer reviews en parallèle (backgrounded)
        Collecter résultats
    SINON:
        Self-review avec checklist
    
    SI all_approved:
        BREAK → Phase 5
    SINON SI attempt < max_attempts:
        Fixer les issues
        Re-run VALIDATE + TEST_UNIT
        attempt++
        CONTINUE
    SINON:
        FALLBACK selon workflow (manual review required)
```

### Phase 5: Finalisation

```
Référence: automated-workflow.md Section 6

run_intent(QUALITY)
SI échec: retour Phase 3

Générer commit message:
    convention = project_config.commit_convention
    OU default: "type(scope): description"

Committer les changements
Logger métriques (si configuré)
Afficher résumé
```

---

## Résolution des Intents

Les intents abstraits sont résolus via project-config :

```
function run_intent(intent_name):
    
    # 1. Chercher dans project-config
    command = project_config.commands[intent_name]
    
    # 2. Si non trouvé, auto-détecter
    if command is None:
        command = auto_detect_command(intent_name)
    
    # 3. Si toujours non trouvé
    if command is None:
        if workflow.degraded_mode.allow_skip:
            log "⚠️ {intent_name} not configured, skipping"
            return SKIPPED
        else:
            prompt user for command
            command = user_response
    
    # 4. Exécuter
    return execute(command)


function auto_detect_command(intent_name):

    # Détection par fichiers de config présents
    if exists("package.json"):
        # Détecter le package manager
        pm = "pnpm" if exists("pnpm-lock.yaml")
             else "yarn" if exists("yarn.lock")
             else "bun" if exists("bun.lockb")
             else "npm"

        scripts = read_json("package.json").scripts
        mapping = {
            VALIDATE: scripts.validate OR scripts.lint,
            TEST_UNIT: scripts.test OR scripts["test:unit"],
            TEST_E2E: scripts["test:e2e"],
            QUALITY: scripts.quality OR scripts.check
        }
        return pm + " run " + mapping[intent_name]
    
    if exists("pyproject.toml"):
        # Similaire pour Poetry/Python
        ...
    
    if exists("Makefile"):
        # Chercher targets standard
        ...
    
    if exists("Cargo.toml"):
        mapping = {
            VALIDATE: "cargo clippy",
            TEST_UNIT: "cargo test",
            QUALITY: "cargo clippy && cargo test"
        }
        return mapping[intent_name]
    
    return None
```

---

## Gestion des Agents

### Lancement Parallèle (Backgrounded)

```
function launch_parallel_reviews(agents, context):
    
    # Limite Claude Code: max 7 Task agents parallèles
    batch = agents[:7]
    tasks = []
    
    for agent in batch:
        task = Task(
            agent=agent.name,
            prompt=context,
            backgrounded=true
        )
        tasks.append(task)
    
    # Collecter quand prêts
    results = []
    for task in tasks:
        result = await task.complete()
        results.append(result)
    
    return merge_feedback(results)
```

### Fallback Sans Agents

```
function self_review(type):
    
    if type == "plan":
        checklist = [
            "Le plan adresse-t-il tous les requirements?",
            "Les étapes sont-elles ordonnées logiquement?",
            "Les dépendances sont-elles identifiées?",
            "Le scope est-il réaliste?",
            "Les risques sont-ils identifiés?"
        ]
    
    if type == "code":
        checklist = [
            "Le code suit-il les conventions du projet?",
            "Les tests sont-ils ajoutés/mis à jour?",
            "Pas de problèmes de sécurité évidents?",
            "Pas de secrets hardcodés?",
            "Gestion d'erreurs implémentée?",
            "Documentation mise à jour si nécessaire?"
        ]
    
    Afficher checklist
    Demander validation utilisateur
```

---

## Checkpoints

Déclenchés selon conditions du workflow :

```
function checkpoint(reason, context):
    
    Afficher:
    ┌─────────────────────────────────────┐
    │  CHECKPOINT: {reason}               │
    ├─────────────────────────────────────┤
    │  État actuel: {context.summary}     │
    │                                     │
    │  [1] Continuer                      │
    │  [2] Ajuster                        │
    │  [3] Arrêter                        │
    └─────────────────────────────────────┘
    
    Attendre réponse utilisateur
    Agir selon réponse
```

Triggers (définis dans workflow) :
- Après chaque milestone (STEP-BY-STEP)
- Après N échecs de validation
- Quand context window > seuil
- Avant opération destructive

---

## Résilience

### Retry avec Backoff

```
function with_retry(operation, max_attempts=3):
    
    for attempt in range(max_attempts):
        try:
            return operation()
        except Error as e:
            if attempt < max_attempts - 1:
                wait(2 ** attempt)  # 1s, 2s, 4s
                continue
            else:
                raise
```

### Fallbacks

```
En cas d'échec agent:
    1. Retry (max 3)
    2. Utiliser agent alternatif si disponible
    3. Utiliser self-review
    4. Demander review manuelle

En cas d'échec validation répété:
    1. Checkpoint utilisateur
    2. Proposer de skip avec warning

En cas de context overflow:
    1. Summarize selon stratégie du workflow
    2. Préserver: task, milestone actuel, erreurs non résolues
```

---

## Output

### Succès

```
✅ TASK COMPLETE

Task: {description}
Strategy: {DIRECT|STEP-BY-STEP}
Duration: {time}

Commits:
- {commit_hash}: {message}

Files changed: {count}
Tests: {passed}/{total}

Metrics logged to: {metrics_file}
```

### Échec Partiel

```
⚠️ TASK PARTIALLY COMPLETE

Completed:
- {milestone 1}
- {milestone 2}

Blocked at: {current_milestone}
Reason: {reason}

To resume: /task --resume {task_id}
```

### Échec

```
❌ TASK FAILED

Stage: {stage where failed}
Reason: {reason}
Attempts: {n}

Last error:
{error_details}

Recovery options:
1. Fix issues manually, then: /task --continue
2. Restart with adjusted scope: /task {adjusted_description}
3. Review logs: {log_file}
```

---

## Usage

```bash
# Exécuter une tâche depuis sa description
/task "Add user authentication with OAuth2"

# Exécuter une tâche depuis un fichier
/task documentation/tasks/feature-123.md

# Reprendre une tâche interrompue
/task --resume

# Mode dry-run (plan sans exécuter)
/task --plan-only "Refactor database layer"
```

---

## Ce que cette commande NE FAIT PAS

Cette commande est un **orchestrateur léger**. Elle ne contient pas :

- ❌ Logique détaillée des loops → dans `automated-workflow.md`
- ❌ Commandes de test/build → dans `project-config.md`
- ❌ Standards de code → dans `development-standards.md`
- ❌ Configuration agents → découverte dynamique
- ❌ Conventions de commit → dans `project-config.md`

**Principe DRY** : Toute information est définie à UN seul endroit.
