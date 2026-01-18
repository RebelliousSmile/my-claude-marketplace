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
