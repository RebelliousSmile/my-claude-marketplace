---
name: documentation-sync
description: |
  Unified documentation management skill. Modes: sync (code->docs), clean (cleanup),
  quick-ref (create guide), check (verify integrity), optimize (reduce tokens).
  Use PROACTIVELY after code changes or when user mentions documentation.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
argument-hint: [mode] [target]
---

# Documentation Sync

Unified skill for all documentation operations.

## Prerequisites

**MANDATORY** - Read project configuration:
```
Read documentation/project-config.md
```

Extract:
- Stack (language, framework)
- File patterns for source code
- Documentation structure
- Code conventions

## Modes

| Mode | Command | Description |
|------|---------|-------------|
| **sync** | `/documentation-sync` | Sync code -> docs (default) |
| **clean** | `/documentation-sync clean` | Cleanup temporary files |
| **quick-ref** | `/documentation-sync quick-ref <name>` | Create quick reference guide |
| **check** | `/documentation-sync check` | Verify documentation integrity |
| **optimize** | `/documentation-sync optimize` | Audit and reduce token usage |

---

## Mode: sync (default)

Synchronize code changes with documentation.

### Trigger Conditions (Proactive)

- Source code files added/modified
- Database schemas changed
- API routes modified
- User mentions: "doc", "documentation", "update doc"

### Workflow

1. **Detect changes**: `git diff HEAD~1 --name-status`
2. **Map to docs**: Determine which documentation needs updating
3. **Generate updates**: Code docs, API docs, schema docs
4. **Validate**: Check syntax, links, consistency
5. **Apply with confirmation**: Never auto-modify without user approval

### Code-to-Docs Mapping

Adapt based on project structure from project-config.md:

| Code Pattern | Documentation |
|--------------|---------------|
| `src/**/*.ts` | `docs/api/*.md` |
| `lib/**/*.py` | `docs/reference/*.md` |
| `schema/*.sql` | `docs/database/*.md` |
| `routes/*` | `docs/api/endpoints.md` |

### Usage

```bash
/documentation-sync                    # Sync recent changes
/documentation-sync sync src/          # Sync specific directory
/documentation-sync sync HEAD~5..HEAD  # Sync commit range
```

---

## Mode: clean

Cleanup temporary documentation files.

### What Gets Cleaned

- `documentation/reviews/` - Completed code reviews (> 30 days)
- `documentation/tasks/` - Finished tasks
- Backup files (`*.backup-*`)

### Workflow

1. **Scan** for temporary/old files
2. **Calculate** token/disk savings
3. **Propose** archiving or deletion
4. **Execute** with user confirmation only

### Usage

```bash
/documentation-sync clean              # Interactive cleanup
/documentation-sync clean --dry-run    # Preview only
```

---

## Mode: quick-ref

Create concise quick reference guides (< 2k tokens).

### Guide Structure

1. **TL;DR** (30 seconds) - Core concept
2. **Quick Reference** (5 minutes) - Code examples
3. **Deep Dive** - Links to full docs

### Workflow

1. **Consult** existing documentation
2. **Extract** key concepts and code examples
3. **Generate** using template
4. **Save** to appropriate location

### Usage

```bash
/documentation-sync quick-ref auth-flow
/documentation-sync quick-ref api-patterns
/documentation-sync quick-ref testing
```

---

## Mode: check

Verify documentation coherence and integrity.

### Checks Performed

- Referenced files exist
- No broken internal links
- Token estimates vs actual sizes
- Orphaned files detection
- Consistency with CLAUDE.md references

### Output

```markdown
## Documentation Health Check
- Valid files: X/X
- Missing files: 0
- Broken links: 0
- Recommendations: [...]
```

### Usage

```bash
/documentation-sync check
```

---

## Mode: optimize

Audit documentation and propose token reduction.

### Analysis

- Current usage (tokens, files)
- Redundant or obsolete files
- Consolidation opportunities
- CLAUDE.md structure improvements

### Workflow

1. **Analyze** current state
2. **Identify** optimization targets
3. **Calculate** potential savings
4. **Propose** changes (never auto-modify CLAUDE.md)

### Usage

```bash
/documentation-sync optimize
```

---

## Documentation Structure (Recommended)

```
documentation/
├── memory-bank/     # Core docs (80-90% of needs)
├── notebooks/       # Deep analysis
├── guides/          # Step-by-step tutorials
├── diagrams/        # Architecture visuals
├── tasks/           # Task definitions
├── reviews/         # Code reviews
├── reports/         # Technical reports
└── wireframes/      # UI mockups (if applicable)
```

---

## Important Rules

### NEVER

- Delete documentation without explicit confirmation
- Modify CLAUDE.md automatically
- Overwrite manually written content
- Create files outside documentation structure

### ALWAYS

- Ask confirmation before changes
- Preserve existing business descriptions
- Respect documentation structure
- Calculate and show token impact

---

## Report Template

```markdown
# Documentation Update Report

## Summary
- **Code files analyzed**: X files
- **Functions added/modified**: Y
- **Documents updated**: Z files

## Applied Changes
- [x] `docs/api/service.md` - Added function docs
- [x] `docs/database/schema.md` - Updated tables

## Required Actions
- [ ] Validate code examples
- [ ] Complete business descriptions
- [ ] Test modified endpoints

## Next Steps
1. Run project validation (from project-config.md)
2. Commit with message: "docs: update documentation after [changes]"
```

---

## Integration

This skill integrates into the development workflow:

1. **Development** - Write code
2. **Tests** - Run test command from project-config.md
3. **Documentation** - This skill (automatic or manual)
4. **Validation** - Run quality command from project-config.md
5. **Commit** - Include documentation changes
