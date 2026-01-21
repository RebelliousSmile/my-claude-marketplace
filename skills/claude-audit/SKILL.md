---
name: claude-audit
description: Audit and maintain .claude/ configuration for consistency and alignment with Claude Code best practices. Use when checking configuration health, validating frontmatter syntax, detecting drift, or after Claude Code updates. Triggers on "audit .claude", "check configuration", "validate claude config", "maintenance claude".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebFetch
argument-hint: [audit|validate|sync|fix]
---

# Claude Code Configuration Auditor

Skill de maintenance pour auditer et maintenir la cohérence du répertoire `.claude/`.

## Modes d'Exécution

| Mode | Usage | Description |
|------|-------|-------------|
| `audit` | `/claude-audit audit` | Analyse complète avec rapport |
| `validate` | `/claude-audit validate` | Validation syntaxique uniquement |
| `sync` | `/claude-audit sync` | Vérifier alignement avec doc officielle |
| `fix` | `/claude-audit fix` | Appliquer corrections automatiques |

**Défaut**: `audit` si aucun argument.

---

## Section 1: Discovery

### 1.1 Scan Structure

```
Glob .claude/**/*.md
Glob .claude/**/*.json
```

**Composants attendus:**
```
.claude/
├── settings.json           # Hooks (partagé)
├── settings.local.json     # Permissions (personnel, gitignored)
├── methodology.md          # Optionnel
├── agents/
│   └── *.md               # Agents custom
├── skills/
│   └── */SKILL.md         # Skills
├── commands/
│   └── *.md               # Commands
└── hooks/
    └── *.sh               # Scripts hooks
```

### 1.2 Build Inventory

Pour chaque composant trouvé, extraire:
- Type (agent/skill/command)
- Name (from frontmatter)
- Description
- Tools configuration
- Model override
- Issues détectées

---

## Section 2: Validation Rules

### 2.1 Frontmatter Syntax

#### Skills (SKILL.md)

```yaml
# REQUIS
name: kebab-case            # max 64 chars
description: "..."          # max 1024 chars, avec triggers

# OPTIONNELS
allowed-tools: Read, Write  # Restriction outils
model: sonnet              # Override modèle
context: fork              # Isolation contexte
user-invocable: true       # Visible dans /help
```

**Champs NON supportés** (à retirer):
- `version` (non officiel)
- `tools` (utiliser `allowed-tools` pour skills)

#### Agents (*.md dans agents/)

```yaml
# REQUIS
name: kebab-case
description: "... PROACTIVELY ..."  # Avec triggers

# OPTIONNELS
tools: Read, Write          # NOTE: pas "allowed-tools"
disallowedTools: Bash       # Blocklist
model: inherit              # inherit, sonnet, opus, haiku
permissionMode: default     # Permissions
skills: skill-a, skill-b    # Skills à charger
```

**Erreur courante**: `allowed-tools` au lieu de `tools`

#### Commands (*.md dans commands/)

```yaml
# REQUIS
description: "..."          # Pour /help

# OPTIONNELS
allowed-tools: Read, Write  # Comme skills
argument-hint: [arg]        # Documentation args
model: sonnet              # Override
context: fork              # Isolation
```

### 2.2 Validation Checklist

```
□ Frontmatter commence par --- ligne 1 (pas de ligne vide)
□ Frontmatter fermé par ---
□ name en kebab-case
□ description présente et non vide
□ Agents: "tools" (pas "allowed-tools")
□ Skills/Commands: "allowed-tools" (pas "tools")
□ Pas de champs non supportés (version, etc.)
□ model valide si présent (inherit, sonnet, opus, haiku)
```

---

## Section 3: Coherence Checks

### 3.1 Cross-References

Vérifier que:
- Agents mentionnés dans les docs existent dans `.claude/agents/`
- Skills référencées existent dans `.claude/skills/`
- Chemins de fichiers mentionnés existent
- Hooks scripts existent

### 3.2 Alignment avec Methodology

Si `.claude/methodology.md` existe:
- Comparer les intents documentés vs utilisés
- Vérifier les seuils (retries, context %)
- Vérifier les agents classifiés

### 3.3 Alignment avec Workflow

Si `automated-workflow.md` existe:
- Vérifier cohérence des phases
- Vérifier les fallbacks documentés
- Vérifier les checkpoints

---

## Section 4: Sync with Official Docs

### 4.1 Fetch Latest Documentation

```
WebFetch https://docs.anthropic.com/en/docs/claude-code/skills
WebFetch https://docs.anthropic.com/en/docs/claude-code/sub-agents
```

### 4.2 Compare Syntax

Extraire les champs supportés de la doc officielle et comparer avec l'implémentation locale.

**Points de vérification:**
- Nouveaux champs ajoutés par Anthropic
- Champs dépréciés
- Changements de comportement
- Breaking changes

### 4.3 Version Compatibility

Vérifier la version de Claude Code mentionnée dans les fichiers vs version courante.

---

## Section 5: Report Templates

### 5.1 Audit Report

```markdown
# Claude Code Configuration Audit

**Date**: [date]
**Project**: [project name]

## Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total components | N | - |
| Skills | N | OK/Warning |
| Agents | N | OK/Warning |
| Commands | N | OK/Warning |
| Hooks | N | OK/Warning |

## Issues Found

### Critical (must fix)
- [ ] Issue 1

### Important (should fix)
- [ ] Issue 2

### Minor (suggested)
- [ ] Issue 3

## Recommendations

1. Recommendation 1
2. Recommendation 2
```

### 5.2 Validation Report

```markdown
# Frontmatter Validation Report

## Skills
| Skill | Valid | Issues |
|-------|-------|--------|
| skill-name | Yes/No | [issues] |

## Agents
| Agent | Valid | Issues |
|-------|-------|--------|
| agent-name | Yes/No | [issues] |

## Commands
| Command | Valid | Issues |
|---------|-------|--------|
| cmd-name | Yes/No | [issues] |
```

### 5.3 Sync Report

```markdown
# Documentation Sync Report

**Local version**: [version from methodology.md]
**Official docs**: [date fetched]

## Changes Detected

| Change | Local | Official | Action |
|--------|-------|----------|--------|
| New field X | Missing | Supported | Consider adding |
| Field Y | Used | Deprecated | Remove |
```

---

## Section 6: Auto-Fix Rules

### 6.1 Safe Auto-Fixes

Ces corrections peuvent être appliquées automatiquement:

| Issue | Fix |
|-------|-----|
| `allowed-tools` in agent | Rename to `tools` |
| `tools` in skill | Rename to `allowed-tools` |
| `version` field | Remove |
| Missing trailing newline | Add newline |

### 6.2 Manual Review Required

Ces issues nécessitent confirmation:

| Issue | Reason |
|-------|--------|
| Missing description | Need context |
| Broken reference | Could be intentional |
| Deprecated field with value | May lose data |

---

## Section 7: Execution

### Mode: audit (default)

```
1. Discovery: Scan .claude/ structure
2. Inventory: List all components
3. Validate: Check frontmatter syntax
4. Coherence: Check cross-references
5. Report: Generate audit report
6. Recommendations: Prioritized list
```

### Mode: validate

```
1. Discovery: Scan .claude/ structure
2. Validate: Check frontmatter syntax only
3. Report: Validation report
```

### Mode: sync

```
1. Fetch: Get official documentation
2. Compare: Local vs official
3. Report: Sync report with changes
```

### Mode: fix

```
1. Run audit first
2. Present safe fixes to user
3. Ask confirmation
4. Apply fixes
5. Re-validate
```

---

## Section 8: Best Practices

### Periodic Maintenance

Exécuter `/claude-audit` :
- Après mise à jour de Claude Code
- Mensuellement (maintenance préventive)
- Après ajout de nouveaux composants
- En cas de comportement inattendu

### Configuration Organization

```
.claude/
├── settings.json         # Hooks uniquement (versionné)
├── settings.local.json   # Permissions (gitignored)
├── agents/               # 1 fichier par agent
├── skills/               # 1 dossier par skill
│   └── skill-name/
│       └── SKILL.md
└── commands/             # Peu utilisé si skills suffisent
```

### Naming Conventions

- **Agents**: Rôle + spécialisation (`code-reviewer`, `test-architect`)
- **Skills**: Action + domaine (`task-definition`, `code-review`)
- **Commands**: Verbe impératif (`audit`, `review`)

---

## Collaboration

Peut déléguer à:
- `claude-code-optimizer` pour optimisations avancées
- `code-architect` pour décisions architecturales
- `documentation-architect` pour sync documentation
