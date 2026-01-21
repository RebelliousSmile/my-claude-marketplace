---
name: code-review
description: Perform structured code review following project checklist. Use when reviewing code changes, PRs, or branches. Covers functionality, quality, security, performance, and testing. (project)
allowed-tools: Read, Grep, Glob, Bash, Write
argument-hint: [branch-or-path]
---

# Code Review

Perform structured code reviews following project-specific standards.

## Prerequisites

**MANDATORY** - Read project configuration:
```
Read documentation/project-config.md
```

Extract:
- Stack (language, framework)
- Test commands (VALIDATE, TEST_UNIT)
- Code conventions
- Project-specific patterns

## Quick Start

1. **User provides**: Branch name, file path, or module
2. **Skill analyzes**: Git diff, changed files, patterns
3. **Skill generates**: Review report saved to `documentation/reviews/`

## Workflow

### Step 1: Identify Scope

If no scope provided, ask user:
```
Which scope to review?
A. Git branch (changes since main/master)
B. Specific directory or module
C. Specific file(s)
D. Last N commits
```

### Step 2: Gather Changes

```bash
# For branch review
git diff main...HEAD --name-status
git log main...HEAD --oneline

# For specific files
git diff HEAD~1 -- path/to/file

# For directory
git diff HEAD~1 -- src/module/
```

### Step 3: Review Against Checklist

Review each file against these categories:

#### 1. Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] Return types consistent

#### 2. Code Quality
- [ ] Follows project naming conventions (from project-config.md)
- [ ] Clear and readable
- [ ] No duplicated code
- [ ] Functions are focused and small

#### 3. Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No injection vulnerabilities

#### 4. Performance
- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] Caching used appropriately
- [ ] No unnecessary loops

#### 5. Testing
- [ ] Tests cover new functionality
- [ ] Tests pass (run VALIDATE from project-config.md)
- [ ] Edge cases tested

#### 6. Project Patterns
- [ ] Follows project architecture
- [ ] Uses existing utilities
- [ ] Consistent with codebase style
- [ ] Project-specific patterns respected

### Step 4: Generate Report

**Issue severity:**
- **CRITICAL**: Must fix - security, data loss, broken functionality
- **WARNING**: Should fix - bugs, bad patterns, maintainability
- **SUGGESTION**: Nice to have - style, minor improvements

## Output Format

**CRITICAL FORMAT**: Compatible with `/review-and-fix`

```markdown
# Code Review Report

**Branch/PR:** [name]
**Reviewed files:** [count]
**Date:** [today]
**Review Type:** Quick (Skill)

## Summary
[2-3 sentence overview]

## Findings

### Critical Issues

1. **[CRITICAL]** `file.ext:123` - Description (suggestion)

### Warnings

1. **[WARNING]** `file.ext:180` - Description (suggestion)

### Suggestions

1. **[SUGGESTION]** `file.ext:345` - Description

### Positive Points
- Good practice 1
- Good practice 2

## Checklist Results
- Functionality: OK/Issues
- Code Quality: OK/Issues
- Security: OK/Issues
- Performance: OK/Issues
- Testing: OK/Issues
- Project Patterns: OK/Issues

## Decision
- [ ] Approve
- [ ] Request changes
- [ ] Comment only

## Next Steps
[If changes requested, list specific actions]
```

### Step 5: Save Report

Save to: `documentation/reviews/review-{YYYY-MM-DD}-{scope}.md`

## Important Notes

- Always reference `file:line` for issues
- Be specific and constructive
- Prioritize critical issues (security, data integrity)
- Run project validation before approving

## Historical Reference

Check `documentation/reviews/` for past reviews to maintain consistency:
```bash
ls documentation/reviews/
```

## Integration

The report format is compatible with `/review-and-fix` command for auto-fixing issues.
