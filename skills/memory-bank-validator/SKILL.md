---
name: memory-bank-validator
description: Validate memory bank consistency and integrity. Use when user mentions "memory", "documentation", "context", or asks about context usage, documentation health, or CLAUDE.md validation.
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# Memory Bank Validator

Validate Claude Code memory bank for consistency, missing references, and optimization.

## Triggers

Use this skill when user:
- Mentions "memory bank", "documentation", "context usage"
- Asks "what files are loaded?"
- Mentions inconsistencies in documentation
- Requests `/context` or `/memory`

## Workflow

### Step 1: Extract References

```bash
grep -E '^@documentation/' CLAUDE.md
```

### Step 2: Verify Existence

```bash
file="documentation/path/file.md"
[ -f "$file" ] && echo "OK $file" || echo "MISSING: $file"
```

### Step 3: Detect Duplicates

```bash
grep -E '^@documentation/' CLAUDE.md | sort | uniq -c | grep -v '^ *1 '
```

### Step 4: Estimate Tokens

```bash
wc -w [file] | awk '{print $1 * 1.3}'  # words x 1.3 = tokens
```

## Output Format

```markdown
## Memory Bank Validation

**Status**: Healthy / Attention / Issues Found

### Summary
- References in CLAUDE.md: X
- Valid files: X/X
- Missing files: N
- Duplicates: N

### Problems Detected

1. **Missing**: `path/to/file.md`
2. **Duplicate**: `file.md` (2 occurrences)
3. **Size mismatch**: `file.md` (estimated 10k, actual 13.7k)

### Recommendations

1. Add: `path/to/recommended.md` (Xk tokens)
2. Remove duplicate: Line X in CLAUDE.md

### Actions

Would you like me to:
- [ ] Update CLAUDE.md to add missing files?
- [ ] Remove detected duplicates?
- [ ] Run `/check-memory` for more details?
```

## Rules

1. **Read-only by default**: NEVER modify CLAUDE.md without confirmation
2. **No false positives**: Verify actual file existence
3. **Concise**: Report < 20 lines unless issues detected
4. **Actionable**: Always propose concrete actions
