---
name: test-e2e
description: Run and analyze E2E tests with detailed error reporting
allowed-tools: Read, Write, Bash, Glob
argument-hint: [test-file-name]
---

# E2E Test Runner

Run E2E tests and analyze results with detailed error reporting.

## Prerequisites

**Try to read project configuration**:
```
Read documentation/project-config.md
```

If found, extract:
- TEST_E2E command
- Dev server settings (port, command)

If not found, use auto-detection (see below).

## Usage

- `/test-e2e` : Run all E2E tests
- `/test-e2e [name]` : Run specific test file

## Workflow

### Step 1: Detect Test Framework

**Priority order:**

1. **project-config.md** → Use TEST_E2E command if defined
2. **Auto-detect** by config files present:

| Files Present | Framework | Command |
|---------------|-----------|---------|
| `playwright.config.ts/js` | Playwright | `npx playwright test` |
| `cypress.config.ts/js` | Cypress | `npx cypress run` |
| `vitest.config.*` + `*.e2e.*` | Vitest | `npx vitest run --config vitest.e2e.config.ts` |
| `jest.config.*` + `e2e/` | Jest | `npm run test:e2e` |
| `package.json` scripts | Check for `test:e2e` | `npm run test:e2e` or `pnpm test:e2e` |

3. **Fallback** → Ask user for command

```bash
# Detection commands (cross-platform)
ls playwright.config.* 2>/dev/null && echo "Playwright detected"
ls cypress.config.* 2>/dev/null && echo "Cypress detected"
ls vitest.config.* 2>/dev/null && echo "Vitest detected"
```

### Step 2: Check Dev Server (if needed)

Some E2E frameworks require a running dev server.

```bash
# Check common ports
for port in 3000 5173 8080 4200; do
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" 2>/dev/null && echo "Server on port $port"
done
```

**If no server detected and required:**
- Warn user: "Dev server may be required. Start with: [DEV_SERVER command]"
- Offer to continue anyway

### Step 3: Run Tests

**With specific test file:**
```bash
# Playwright
npx playwright test [name]

# Cypress
npx cypress run --spec "**/*[name]*"

# Vitest/Jest
npx vitest run [name]
```

**All tests:**
```bash
# Use detected or configured command
[TEST_E2E_COMMAND]
```

### Step 4: Parse Results

Extract from output:
- Total tests run
- Passed / Failed / Skipped counts
- Error messages and stack traces
- Screenshot/video paths (if available)

**Handle different output formats:**
- Playwright: JSON reporter or terminal output
- Cypress: Terminal output or mochawesome
- Vitest/Jest: Terminal output

### Step 5: Display Summary

```markdown
## E2E Test Results

**Framework**: [detected]
**Total**: X tests
**Passed**: Y
**Failed**: Z
**Skipped**: W

### Failed Tests

1. **test-file.spec.ts:42**
   - Test: "should display user profile"
   - Error: [error message]
   - Screenshot: [path if available]
   - Suggestion: [potential fix based on error]
```

### Step 6: Handle Failures

**For each failed test:**

1. Analyze error type:
   - Timeout → Check selectors, network, server
   - Element not found → Check selectors, page load
   - Assertion failed → Check expected values
   - Network error → Check API endpoints

2. Generate task file (optional):
   - Path: `documentation/tasks/fix-e2e-{test-name}.md`
   - Include: error context, screenshots, suggestions

### Step 7: Recommendations

Provide actionable suggestions based on error patterns.

## Error Handling

| Scenario | Action |
|----------|--------|
| No test framework detected | Ask user for TEST_E2E command |
| Framework not installed | Suggest installation command |
| No tests found | List test file patterns, suggest locations |
| Dev server not running | Warn and suggest start command |
| All tests pass | Display success summary |
| Some tests fail | Display failures with suggestions |
| All tests fail | Check environment, suggest debug steps |

## Cross-Platform Notes

- Use `npx` for Node.js tools (works everywhere)
- Prefer `pnpm` if `pnpm-lock.yaml` exists
- Check for `bun.lockb` for Bun projects
- PowerShell: Use `curl.exe` instead of `curl` on Windows

## Output

- Summary of test results
- Detailed error reports for failures
- Optional: task files for fixing failures
- Actionable recommendations
