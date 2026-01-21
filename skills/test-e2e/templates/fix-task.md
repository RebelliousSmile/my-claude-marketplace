# E2E Fix Task Template

```markdown
# Fix E2E Test: {{testName}}

**Type**: Bugfix
**Status**: Not Started
**Created**: {{date}}

---

## Description

E2E test `{{testName}}` is failing and needs to be fixed.

## Error Details

**File**: `{{file}}:{{line}}`
**Error Type**: {{errorType}}

```
{{errorMessage}}
```

{{#if screenshot}}
**Screenshot**: `{{screenshot}}`
{{/if}}

## Context

**Test Purpose**: {{testPurpose}}
**Last Passed**: {{lastPassed}}
**Recent Changes**: {{recentChanges}}

## Acceptance Criteria

- [ ] Test `{{testName}}` passes
- [ ] No regression in related tests
- [ ] Fix doesn't break other functionality

## Investigation Steps

1. [ ] Run test locally with `--headed` flag
2. [ ] Check if selector `{{selector}}` is still valid
3. [ ] Verify test data hasn't changed
4. [ ] Check for timing issues

## Probable Causes

{{#each probableCauses}}
- {{this}}
{{/each}}

## Suggested Fix

{{suggestedFix}}

## Files to Check

{{#each filesToCheck}}
- `{{this}}`
{{/each}}

## Testing

```bash
# Run specific test
{{runCommand}}

# Run with debug
{{debugCommand}}
```

## Definition of Done

- [ ] Test passes consistently (run 3 times)
- [ ] Related tests still pass
- [ ] No new warnings introduced
```
