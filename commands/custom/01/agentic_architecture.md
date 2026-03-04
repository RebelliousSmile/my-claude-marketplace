---
name: agentic_architecture
description: Generate project architecture with an agentic readiness audit — scores the project against the Agentic Readiness Framework before designing agents, skills, and commands.
argument-hint: Project description and domain requirements
model: opus
---

# Agentic Architecture

## Context

### Memory bank

```markdown
@aidd_docs/memory/
```

### Agentic Readiness Framework

```markdown
@aidd_docs/templates/custom/agentic_readiness_framework.md
```

### Generate architecture instructions

```markdown
@.claude/commands/aidd/01/generate_architecture.md
```

### Audit score template

```markdown
@aidd_docs/templates/custom/audit_score.md
```

### Architecture summary template

```markdown
@aidd_docs/templates/custom/architecture_summary.md
```

### Arguments

```text
$ARGUMENTS
```

## Goal

Run an agentic readiness audit, then generate the project architecture.

## Steps

1. Score the project against the Agentic Readiness Framework — evaluate each criterion in `audit_score.md`: tests (framework, coverage enforcement, speed, mocking), typing (strict mode, template checking, primitive IDs, inferred types), tooling (unified check command, lint tool, pre-commit hook, CI), agent context (CLAUDE.md, boundaries, rules files). Write the filled result to `aidd_docs/tasks/{YYYY_MM}/audit_result.md`.
2. Present the audit score to the user — **wait for explicit user approval before continuing**
3. Delegate to `alexia` agent with the following prompt:
   - Current project state (from memory bank)
   - Audit score from `aidd_docs/tasks/{YYYY_MM}/audit_result.md` and prioritized ❌ signals to address as architecture gaps
   - Full generate_architecture instructions (loaded above) to follow
   - Constraint: validate the complete architecture plan with the user BEFORE creating any file
   - Constraint: write the final report following `architecture_summary.md` to `aidd_docs/tasks/{YYYY_MM}/architecture_result.md`
4. Only if `aidd_docs/tasks/{YYYY_MM}/architecture_result.md` is complete and follows `architecture_summary.md` — update memory bank (scope: `architecture.md` and `codebase_map.md`) using it as input. If the file is missing or incomplete, report the gap to the user and stop:

```markdown
@.claude/commands/aidd/07/learn.md
```
