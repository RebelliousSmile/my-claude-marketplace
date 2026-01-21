# Billing Report Reference

## Commit Type Mapping

### Conventional Commits → Billing Categories

| Commit Type | Billing Category | Description |
|-------------|------------------|-------------|
| `feat` | Development | New features |
| `refactor` | Development | Code restructuring |
| `fix` | Bug Fixes | Bug corrections |
| `hotfix` | Bug Fixes | Urgent fixes |
| `revert` | Bug Fixes | Rollbacks |
| `docs` | Documentation | Documentation updates |
| `perf` | Performance | Optimization work |
| `test` | Testing | Test additions/fixes |
| `chore` | Maintenance | Routine tasks |
| `build` | Maintenance | Build system |
| `ci` | Maintenance | CI/CD changes |
| `style` | Maintenance | Formatting only |
| (other) | Other | Non-conventional |

## Time Estimation Grid

### By Commit Type

| Type | Complexity | Estimated Time |
|------|------------|----------------|
| `feat` | Simple (1 file) | 30-60 min |
| `feat` | Medium (2-5 files) | 1-2 h |
| `feat` | Complex (>5 files) | 2-4 h |
| `refactor` | Simple | 15-30 min |
| `refactor` | Structural | 1-2 h |
| `fix` | Trivial (typo, config) | 10-15 min |
| `fix` | Logic error | 30-60 min |
| `fix` | Investigation needed | 1-2 h |
| `perf` | Any | 1-2 h |
| `docs` | Any | 15-30 min |
| `test` | Any | 30-60 min |
| `chore`/`build`/`ci` | Any | 10-20 min |
| `style` | Any | 5-10 min |
| Non-conventional | Default | 20 min |

### Complexity Modifiers

| Condition | Modifier |
|-----------|----------|
| Files changed > 5 | +50% |
| Lines changed > 200 | +50% |
| Multiple commits same scope/day | Group as session |

## Git Commands

### Extract Commits

```bash
# Basic commit list
git log --since="2025-01-01" --until="2025-01-31" \
  --pretty=format:"%h|%ad|%s" --date=short --no-merges

# With stats
git log --since="2025-01-01" --until="2025-01-31" \
  --pretty=format:"%h" --shortstat --no-merges

# Detailed (files changed per commit)
git log --since="2025-01-01" --until="2025-01-31" \
  --pretty=format:"COMMIT:%h|%ad|%s" --date=short --name-status --no-merges
```

### Project Detection

```bash
# From package.json
cat package.json 2>/dev/null | grep -m1 '"name"' | cut -d'"' -f4

# From pyproject.toml
cat pyproject.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2

# From Cargo.toml
cat Cargo.toml 2>/dev/null | grep -m1 'name' | cut -d'"' -f2

# From go.mod
cat go.mod 2>/dev/null | head -1 | awk '{print $2}' | xargs basename

# Fallback: folder name
basename "$(pwd)"
```

## Session Grouping

Consecutive commits on same feature/scope should be grouped:

**Example:**
```
abc1234 | 2025-01-15 | feat(auth): add login form
def5678 | 2025-01-15 | feat(auth): add validation
ghi9012 | 2025-01-15 | feat(auth): add error handling
```

→ Group as single "auth feature" session: 2h (not 3x 1h)

**Grouping rules:**
1. Same date
2. Same scope (text in parentheses)
3. Sequential commits (no other scopes between)

## Report Output Locations

| Directory Exists | Output Path |
|------------------|-------------|
| `documentation/reports/` | `documentation/reports/billing-*.md` |
| `docs/reports/` | `docs/reports/billing-*.md` |
| `reports/` | `reports/billing-*.md` |
| (none) | Create `reports/billing-*.md` |

## Customization

Create `.claude/billing-config.md` to override defaults:

```markdown
# Billing Configuration

## Custom Time Estimates

| Type | Time |
|------|------|
| feat | 2h |
| fix | 45min |

## Custom Categories

| Type | Category |
|------|----------|
| security | Security |
| a11y | Accessibility |

## Hourly Rates

| Category | Rate |
|----------|------|
| Development | 100€/h |
| Bug Fixes | 80€/h |
```
