---
name: bootstrap-commands
description: Initialize project with production-ready slash commands. Use PROACTIVELY when user asks to "setup commands", "initialize commands", "create base commands", "bootstrap commands", or mentions needing standard commands like review-and-fix, update-docs, clean-docs, billing-report.
tools: Read, Write, Glob, Bash
model: inherit
---

# Bootstrap Commands

Initialize a project with a complete set of **production-ready, agnostic slash commands**.

## Quick Start

When invoked, this skill will:
1. Check if `.claude/commands/` exists
2. List commands to be created
3. Ask for confirmation
4. Create all commands in `.claude/commands/`

## Available Commands

| Command | Purpose | Tools |
|---------|---------|-------|
| `review-and-fix` | Automate code review and fix critical issues | Read, Write, Edit, Bash, TodoWrite |
| `update-docs` | Sync documentation after code changes | Read, Write, Glob, Grep |
| `optimize-memory` | Audit and optimize memory bank | Read, Glob, Grep, Task |
| `clean-docs` | Clean up temporary documentation files | Read, Bash, Glob, Grep, Task |
| `doc-quick-ref` | Create quick reference guides | Read, Write, Glob, Grep, Task |
| `check-memory` | Check memory bank consistency | Read, Bash, Glob, Grep |
| `test-e2e` | Run and analyze E2E tests | Read, Write, Bash, Glob |
| `billing-report` | Generate billing report from git commits | Read, Write, Bash, Glob |

---

## Command Definitions

### 1. review-and-fix

```markdown
---
name: review-and-fix
description: Automate code review and fix critical issues from review files
allowed-tools: Read, Write, Edit, Bash, TodoWrite
---

# Commande : Review and Fix

Automatise le processus complet de code review et corrections.

## Étape 0 : Initialiser le tracking

Utilise TodoWrite pour créer une todo list de suivi avec ces tâches :
- Lire le fichier de review
- Analyser les problèmes critiques
- Créer les tâches de correction (une par problème critique)
- Exécuter les corrections
- Valider les corrections (linter + tests + serveur)
- Nettoyer les tâches terminées
- Générer la nouvelle review (écrase l'ancienne)

Marque chaque tâche comme `in_progress` avant de l'exécuter et `completed` après.

## Étape 1 : Lire le fichier de review

Demande à l'utilisateur quel fichier de review analyser.

Si l'utilisateur ne fournit pas de nom de composant ou de module, extrait-le du nom du fichier (ex: `sync-api-review.md` → `sync-api`).

## Étape 2 : Analyser les problèmes critiques

Parse le contenu de la review et identifie tous les problèmes marqués comme **Critique** ou **CRITIQUE**.

Pour chaque problème identifié, extrais :
- Le titre du problème
- La description complète
- Les fichiers concernés avec leurs numéros de ligne (format `fichier.ext:123`)
- La section dans laquelle le problème apparaît

## Étape 3 : Créer les tâches de correction

Pour chaque problème critique identifié, crée une tâche dans le dossier tasks approprié.

Nomme les tâches selon ce pattern : `fix-{module}-{index}-{description-courte}.md`

Chaque tâche doit contenir :
- **Titre** : Nom explicite du problème
- **Contexte** : Résumé du problème identifié
- **Fichiers concernés** : Liste avec chemins et numéros de ligne
- **Plan de correction** : Étapes détaillées avec exemples de code
- **Critères de validation** : Tests à exécuter

## Étape 4 : Exécuter les corrections

Pour chaque tâche créée :
1. Lis le fichier de tâche
2. Applique les corrections nécessaires aux fichiers identifiés
3. Vérifie que les modifications sont correctes
4. Valide les corrections (voir Étape 5)
5. Marque la tâche comme terminée

## Étape 5 : Valider les corrections

Après chaque correction, exécute OBLIGATOIREMENT :

1. **Linter/Typecheck** : Doit retourner 0 erreur
2. **Tests unitaires** : Tous les tests doivent passer
3. **Test démarrage** : L'application doit démarrer sans erreur

**Si une seule validation échoue, la correction est considérée comme incomplète.**

## Étape 6 : Nettoyer les tâches terminées

Supprime uniquement les fichiers de tâches qui ont été complètement terminées sans erreur ET validées.

## Étape 7 : Générer une nouvelle code review

Génère une nouvelle code review complète du module après corrections.

Compare avec la review initiale et documente les améliorations apportées.

**IMPORTANT** : Écrase le fichier de review original avec la nouvelle version.

## Format de détection des problèmes

Recherche ces patterns dans le fichier de review :

### Pattern 1 : Emoji rouge avec CRITIQUE
```markdown
- [🔴] **CRITIQUE** : `fichier.ext:123` Description du problème
```

### Pattern 2 : Section "Résumé des problèmes critiques"
```markdown
## Résumé des problèmes critiques
### 🔴 Problèmes critiques identifiés
1. **Titre du problème** - `fichier.ext:123`
```

## Sortie attendue

Affiche un rapport détaillé :
- Nombre de problèmes critiques identifiés
- Tâches créées
- Tâches exécutées avec succès
- Tâches en erreur (à conserver pour debug)
- Résumé des améliorations dans la nouvelle review

## Notes importantes

- Ne supprime JAMAIS une tâche en erreur
- Valide chaque correction avant de passer à la suivante
- Documente toutes les modifications apportées
```

---

### 2. update-docs

```markdown
---
name: update-docs
description: Sync documentation after code changes (code → docs)
allowed-tools: Read, Write, Glob, Grep
---

# Commande : Update Documentation

Automatise la mise à jour de la documentation après des changements de code.

## Workflow

### Étape 1 : Analyser les changements

Exécute `git diff` pour identifier les changements récents :
```bash
git diff HEAD~1 HEAD --name-status
```

### Étape 2 : Catégoriser les changements

Pour chaque fichier modifié, identifie la catégorie et la documentation impactée.

### Étape 3 : Générer les mises à jour

Pour chaque fonction/composant modifié :
1. Lire le code source et extraire signatures, paramètres, retours
2. Mettre à jour le fichier Markdown correspondant

### Étape 4 : Valider les modifications

Avant d'appliquer :
- Syntaxe Markdown valide
- Exemples de code syntaxiquement corrects
- Liens internes vers fichiers existants

### Étape 5 : Proposer les mises à jour

Pour chaque fichier de documentation à modifier :
1. Afficher un diff des changements proposés
2. Demander confirmation à l'utilisateur
3. Appliquer les modifications si accepté

## Règles Importantes

### ❌ Ne JAMAIS

- Supprimer de la documentation existante sans validation explicite
- Modifier les exemples de code sans les tester
- Créer de nouveaux fichiers de documentation sans demander
- Écraser les descriptions métier rédigées manuellement

### ✅ TOUJOURS

- Préserver les descriptions fonctionnelles existantes
- Valider les changements avec l'utilisateur avant application
- Respecter les templates existants
- Vérifier la cohérence cross-référence entre documents
```

---

### 3. optimize-memory

```markdown
---
name: optimize-memory
description: Audit and optimize the memory bank (invoke documentation-architect agent)
allowed-tools: Read, Glob, Grep, Task
---

# Optimize Memory Bank

Invoke the `documentation-architect` agent to audit and optimize the memory bank.

## What This Command Does

The agent will:
1. Analyze current memory bank usage (tokens, files loaded)
2. Detect redundant, obsolete, or temporary files
3. Propose consolidation and cleanup strategies
4. Calculate estimated token savings
5. Suggest improvements to CLAUDE.md structure

## When to Use

- Memory bank usage > 70%
- After completing major tasks/reviews
- You notice slow Claude responses
- You want to clean up generated documentation

## Safety

The agent will propose changes but will NEVER modify CLAUDE.md without your explicit confirmation.

## Complementary Commands

- `/update-docs` : Sync code → documentation (after code changes)
- `/clean-docs` : Clean temporary files (archiving/deletion)
- `/check-memory` : Quick health check (read-only)
```

---

### 4. clean-docs

```markdown
---
name: clean-docs
description: Clean up temporary documentation files (invoke documentation-architect agent)
allowed-tools: Read, Bash, Glob, Grep, Task
---

# Clean Documentation

Invoke the `documentation-architect` agent to clean up temporary documentation files.

## What This Command Does

The agent will:
1. Scan for files generated by past treatments (reviews, tasks, prompts)
2. Identify files not referenced in CLAUDE.md for > 30 days
3. Detect obsolete CLAUDE.md backups
4. Propose archiving or deletion with token/disk savings
5. Create archive structure if archiving is preferred

## Files Typically Cleaned

- `documentation/reviews/` : Completed code reviews
- `documentation/tasks/` : Finished tasks
- `documentation/prompts/` : One-time strategies
- `CLAUDE.md.backup-*` : Old backups (Git keeps history)

## Safety Guarantees

The agent will ALWAYS:
- Ask for confirmation before any deletion
- Propose archiving as conservative option
- Calculate gains (tokens + disk space)
- Create backups before mass operations

## When to Use

- After completing major migrations/tasks
- Monthly maintenance
- When accumulating many temporary docs
- Before project milestones
```

---

### 5. doc-quick-ref

```markdown
---
name: doc-quick-ref
description: Create a quick reference guide for a component or pattern
allowed-tools: Read, Write, Glob, Grep, Task
argument-hint: [component-name]
---

# Quick Reference Guide Generator

Create a quick reference guide for a specific component or pattern.

## Usage

```
/doc-quick-ref [component-name]
```

## Examples

- `/doc-quick-ref circuit-breakers` : Create quick ref for circuit breaker pattern
- `/doc-quick-ref sync-api` : Create quick ref for Sync API
- `/doc-quick-ref cache-resilience` : Create quick ref for cache patterns

## What This Command Does

The agent will:
1. Consult existing documentation
2. Delegate to specialized agents if needed
3. Create a 3-tier guide:
   - TL;DR (30 seconds)
   - Quick Reference (5 minutes) with code examples
   - Link to deep dive documentation
4. Optimize for memory bank (< 2k tokens)
5. Add to appropriate location in documentation

## Guide Structure

The generated guide will include:
- Core concepts and principles
- Most common use cases with code
- Frequent pitfalls to avoid
- Links to full documentation
- References to actual code locations

## When to Use

- You need concise reference for a pattern
- Existing docs are too verbose
- You want to onboard developers quickly
- You frequently access the same information
```

---

### 6. check-memory

```markdown
---
name: check-memory
description: Check memory bank consistency and integrity (read-only audit)
allowed-tools: Read, Bash, Glob, Grep
---

# Check Memory Bank Consistency

Verify the consistency and integrity of the Claude Code memory bank.

## What This Command Does

Automatically detect:
- Files referenced but missing
- Duplicates in CLAUDE.md
- Inconsistencies between estimated and actual size
- Optimization opportunities

## Workflow

### 1. Analyze CLAUDE.md

Read `CLAUDE.md` and extract all `@documentation/...` references.

### 2. Verify Existence

For each referenced file, verify it exists on disk.

### 3. Detect Duplicates

Identify files referenced multiple times.

### 4. Estimate Tokens

Compare token estimates in comments vs actual file sizes.

### 5. Suggest Improvements

Based on best practices, suggest files to add or remove.

## Output Format

```markdown
## Memory Bank Health Check

**Date** : YYYY-MM-DD
**Files analyzed** : X references in CLAUDE.md

### Global Status

- Valid files : X/X
- Missing files : 0
- Duplicates detected : 0
- Inconsistencies : 0

### Recommendations

- Suggested actions to optimize
```

## Notes

- This command is READ-ONLY
- Will NOT modify CLAUDE.md automatically
- Use `/optimize-memory` for actual changes
```

---

### 7. test-e2e

```markdown
---
name: test-e2e
description: Run and analyze E2E tests with detailed error reporting
allowed-tools: Read, Write, Bash, Glob
argument-hint: [test-file-name]
---

# E2E Test Runner

Run E2E tests and analyze results with detailed error reporting.

## Usage

- `/test-e2e` : Run all E2E tests
- `/test-e2e [name]` : Run specific test file (e.g., `catalogue`, `product-page`)

## Workflow

1. **Run tests**
   - If a filename is provided, run that specific test
   - Otherwise, run the default test suite

2. **Analyze results**
   - Parse test output
   - Extract pass/fail/skip counts

3. **Display summary**
   - ✅ Number of tests passed
   - ❌ Number of tests failed (with details)
   - ⚠️ Number of tests skipped

4. **For each failed test**
   - Test name
   - Error context (if available)
   - Screenshot path
   - Error summary

5. **Create fix tasks**
   - Generate task file for each failed test
   - Include potential causes
   - Suggest fix plan with confidence level

6. **Recommendations**
   - Concrete suggestions to fix failed tests
   - Console error corrections if detected

## Prerequisites

- Dev server must be running before launching tests
- Test framework (Playwright, Cypress, etc.) must be configured

## Output

- Summary of test results
- Detailed error reports
- Generated task files for failures
- Actionable recommendations
```

---

### 8. billing-report

```markdown
---
name: billing-report
description: Generate billing report from git commits between two dates, grouped by category with time estimation. Use when user needs invoicing, time tracking, or work summary from git history.
allowed-tools: Read, Write, Bash, Glob
argument-hint: <start_date> <end_date>
model: sonnet
---

# Billing Report Generator

Generate a structured billing report from git commits between two dates, grouped by work categories for invoicing, with **time estimation**.

## Parameters

**Arguments:** `<start_date> <end_date>` (use `$1` and `$2`)
- Format: YYYY-MM-DD
- Example: `/billing-report 2025-01-01 2025-01-31`

## Steps

### 1. Validate Parameters

Extract dates from `$1` (start) and `$2` (end). If missing or invalid format:
```
Usage: /billing-report YYYY-MM-DD YYYY-MM-DD
Example: /billing-report 2025-01-01 2025-01-31
```

### 2. Detect Project Context

**Auto-detect project information (cross-platform):**

```bash
# Get project name from config files or folder name
PROJECT_NAME=$(
  cat package.json 2>/dev/null | grep -m1 '"name"' | cut -d'"' -f4 ||
  cat pyproject.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2 ||
  cat Cargo.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2 ||
  cat go.mod 2>/dev/null | head -1 | awk '{print $2}' | xargs basename ||
  basename "$(pwd)"
)

# Detect reports output directory (use existing or create default)
REPORTS_DIR=$(
  [ -d "documentation/reports" ] && echo "documentation/reports" ||
  [ -d "docs/reports" ] && echo "docs/reports" ||
  [ -d "reports" ] && echo "reports" ||
  echo "reports"
)
```

### 3. Extract Git Commits

**Git commands (works on any OS with git installed):**

```bash
# Verify git repository
git rev-parse --git-dir > /dev/null 2>&1 || { echo "Error: Not a git repository"; exit 1; }

# Commits with timestamps and subject
git log --since="$1" --until="$2" --pretty=format:"%h|%ad|%aI|%s" --date=short --no-merges

# Stats for files modified per commit
git log --since="$1" --until="$2" --pretty=format:"%h" --shortstat --no-merges
```

### 4. Categorize Commits

Map commit types to billing categories using **Conventional Commits** standard:

| Commit Type | Billing Category |
|-------------|------------------|
| `feat` | Development |
| `refactor` | Development |
| `fix`, `hotfix`, `revert` | Bug Fixes |
| `docs` | Documentation |
| `perf` | Performance |
| `test` | Testing |
| `chore`, `build`, `ci`, `style` | Maintenance |
| (no type / non-conventional) | Other |

### 5. Estimate Time per Commit

**Note:** Time estimation is approximate. Adjust based on your team's velocity.

**Default estimation grid:**

| Type | Base Time | Notes |
|------|-----------|-------|
| `feat` (simple) | 30-60min | Single file, straightforward |
| `feat` (medium) | 1-2h | Multiple files, moderate complexity |
| `feat` (complex) | 2-4h | System-wide, integrations |
| `refactor` (simple) | 15-30min | Renaming, reorganization |
| `refactor` (structural) | 1-2h | Architecture changes |
| `fix` (trivial) | 10-15min | Typo, CSS, config |
| `fix` (logic) | 30-60min | Business logic |
| `fix` (investigation) | 1-2h | Debugging, root cause |
| `perf` | 1-2h | Optimization, caching |
| `docs` | 15-30min | README, comments |
| `test` | 30-60min | Unit/integration tests |
| `chore`/`build`/`ci` | 10-20min | Config, dependencies |
| `style` | 5-10min | Formatting, linting |
| Non-conventional | 20min | Default |

**Calculation rules:**

1. **Continuous sessions (same scope, same day):**
   - Group consecutive commits on same feature
   - Estimate TOTAL session time, not per-commit

2. **Complexity adjustment:**
   - Files changed > 5: +50% time
   - Lines changed > 200: +50% time

### 6. Generate Report

```markdown
# BILLING REPORT

**Project:** [Auto-detected]
**Period:** $1 to $2
**Generated:** [today]

---

## SUMMARY

| Category | Commits | % | Estimated Time |
|----------|---------|---|----------------|
| Development | X | Y% | Xh XXmin |
| Bug Fixes | X | Y% | Xh XXmin |
| Documentation | X | Y% | Xh XXmin |
| Performance | X | Y% | Xh XXmin |
| Testing | X | Y% | Xh XXmin |
| Maintenance | X | Y% | Xh XXmin |
| Other | X | Y% | Xh XXmin |
| **TOTAL** | **Z** | **100%** | **XXh XXmin** |

---

## METHODOLOGY

- Continuous sessions grouped by scope and date
- Complexity adjusted by files/lines changed
- Base times from standard development grid

**Note:** Estimates are approximations.

---

## DETAILED BREAKDOWN

### DEVELOPMENT

**Estimated: Xh XXmin**

| Date | Ref | Description |
|------|-----|-------------|
| YYYY-MM-DD | abc1234 | feat(scope): description |

[... other categories ...]

---

## BILLING SUMMARY

| Work Type | Hours | Rate | Amount |
|-----------|-------|------|--------|
| Development | XXh | [Fill] | [Fill] |
| Bug Fixes | XXh | [Fill] | [Fill] |
| Maintenance | XXh | [Fill] | [Fill] |
| **TOTAL** | **XXh** | | **[Fill]** |

---

*Generated by /billing-report*
```

### 7. Save Report

```bash
mkdir -p "$REPORTS_DIR"
```

Save using Write tool:
- Path: `$REPORTS_DIR/billing-$1-to-$2.md`

Confirm:
```
✅ Report saved to: [path]
📊 Summary: X commits, ~Xh estimated
```

### 8. Handle Edge Cases

**No commits:**
```
No commits found for [start] to [end].
Verify: git repository? dates correct?
```

**Non-conventional commits:**
Classify as "Other", note in report.

**Not a git repo:**
```
❌ Error: Not a git repository.
Run from repository root.
```

## Customization

Create `.claude/billing-config.md` with custom time estimates, then reference with `@.claude/billing-config.md`.

## Related Commands

- `/task` - Create tasks from findings
- `/update-docs` - Update documentation
```

---

## Installation

### Automatic Installation

When this skill is invoked, it will:

1. **Check existing commands:**
   ```bash
   ls -la .claude/commands/ 2>/dev/null || echo "No commands directory"
   ```

2. **Show commands to create:**
   ```
   Commands to install:
   - review-and-fix
   - update-docs
   - optimize-memory
   - clean-docs
   - doc-quick-ref
   - check-memory
   - test-e2e
   - billing-report
   ```

3. **Ask for confirmation:**
   ```
   Create all 8 commands in .claude/commands/? (y/n)
   Or specify which ones: "review-and-fix, check-memory, billing-report"
   ```

4. **Create files:**
   ```bash
   mkdir -p .claude/commands
   # Write each command file
   ```

### Manual Installation

Copy individual command definitions above into `.claude/commands/[name].md`.

### Verification

After installation, type `/` in Claude Code to see available commands, or run `/help` to list all commands.

---

## Customization

After installation, customize commands for your project:

1. **Adjust tools** based on your stack
2. **Update test commands** to match your test runner
3. **Add project-specific paths** to documentation commands
4. **Modify validation steps** to match your linter/formatter
5. **Customize billing-report** time estimation grid for your workflow

---

## Dependencies

Some commands work best with these agents installed:
- `documentation-architect` - For memory optimization commands
- `test-architect` - For test-related commands

Use `/bootstrap-agents` or `@bootstrap-agents` to install recommended agents.

---

**Version:** 1.1.0
**Last Updated:** 2025-01
**Commands Count:** 8
