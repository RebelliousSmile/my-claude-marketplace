---
name: billing-report
description: Generate billing report from git commits between two dates, grouped by category with time estimation. Use when user needs invoicing, time tracking, or work summary from git history.
allowed-tools: Read, Write, Bash, Glob
argument-hint: <start_date> <end_date>
---

# Billing Report Generator

Generate a structured billing report from git commits between two dates, grouped by work categories for invoicing, with time estimation.

## Usage

```
/billing-report <start_date> <end_date>
```

- Format: YYYY-MM-DD
- Example: `/billing-report 2025-01-01 2025-01-31`

## Workflow

### Step 1: Validate Parameters

Extract dates from arguments. If missing or invalid:
```
Usage: /billing-report YYYY-MM-DD YYYY-MM-DD
Example: /billing-report 2025-01-01 2025-01-31
```

### Step 2: Detect Project Context

Auto-detect project information:

```bash
# Get project name from config files or folder name
PROJECT_NAME=$(
  cat package.json 2>/dev/null | grep -m1 '"name"' | cut -d'"' -f4 ||
  cat pyproject.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2 ||
  cat Cargo.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2 ||
  basename "$(pwd)"
)

# Detect reports output directory
REPORTS_DIR=$(
  [ -d "documentation/reports" ] && echo "documentation/reports" ||
  [ -d "docs/reports" ] && echo "docs/reports" ||
  echo "reports"
)
```

### Step 3: Extract Git Commits

```bash
# Verify git repository
git rev-parse --git-dir > /dev/null 2>&1 || { echo "Error: Not a git repository"; exit 1; }

# Commits with timestamps and subject
git log --since="$START" --until="$END" --pretty=format:"%h|%ad|%s" --date=short --no-merges

# Stats for files modified per commit
git log --since="$START" --until="$END" --pretty=format:"%h" --shortstat --no-merges
```

### Step 4: Categorize Commits

Map commit types to billing categories (Conventional Commits):

| Commit Type | Billing Category |
|-------------|------------------|
| `feat`, `refactor` | Development |
| `fix`, `hotfix`, `revert` | Bug Fixes |
| `docs` | Documentation |
| `perf` | Performance |
| `test` | Testing |
| `chore`, `build`, `ci`, `style` | Maintenance |
| (non-conventional) | Other |

### Step 5: Estimate Time

**Base estimation grid:**

| Type | Base Time |
|------|-----------|
| `feat` (simple) | 30-60min |
| `feat` (medium) | 1-2h |
| `feat` (complex) | 2-4h |
| `refactor` | 15min-2h |
| `fix` (trivial) | 10-15min |
| `fix` (logic) | 30-60min |
| `fix` (investigation) | 1-2h |
| `perf` | 1-2h |
| `docs` | 15-30min |
| `test` | 30-60min |
| `chore`/`build`/`ci` | 10-20min |

**Adjustments:**
- Files changed > 5: +50% time
- Lines changed > 200: +50% time
- Consecutive commits same scope: group as session

### Step 6: Generate Report

```markdown
# BILLING REPORT

**Project:** [Auto-detected]
**Period:** [start] to [end]
**Generated:** [today]

---

## SUMMARY

| Category | Commits | % | Estimated Time |
|----------|---------|---|----------------|
| Development | X | Y% | Xh XXmin |
| Bug Fixes | X | Y% | Xh XXmin |
| ... | | | |
| **TOTAL** | **Z** | **100%** | **XXh XXmin** |

---

## DETAILED BREAKDOWN

### DEVELOPMENT

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
| **TOTAL** | **XXh** | | **[Fill]** |
```

### Step 7: Save Report

Save to: `{REPORTS_DIR}/billing-{start}-to-{end}.md`

## Edge Cases

- **No commits**: Report error with suggestions
- **Non-conventional commits**: Classify as "Other"
- **Not a git repo**: Exit with error message

## Customization

Create `.claude/billing-config.md` with custom time estimates to override defaults.
