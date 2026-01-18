---
name: test-e2e
description: Run and analyze E2E tests with detailed error reporting
allowed-tools: Read, Write, Bash, Glob
argument-hint: [test-file-name]
---

# E2E Test Runner

Run E2E tests and analyze results with detailed error reporting.

## Usage

- `/test-e2e` : Run all E2E tests
- `/test-e2e [name]` : Run specific test file (e.g., `catalogue`, `product-page`)

## Workflow

1. **Run tests**
   - If a filename is provided, run that specific test
   - Otherwise, run the default test suite

2. **Analyze results**
   - Parse test output
   - Extract pass/fail/skip counts

3. **Display summary**
   - Number of tests passed
   - Number of tests failed (with details)
   - Number of tests skipped

4. **For each failed test**
   - Test name
   - Error context (if available)
   - Screenshot path
   - Error summary

5. **Create fix tasks**
   - Generate task file for each failed test
   - Include potential causes
   - Suggest fix plan with confidence level

6. **Recommendations**
   - Concrete suggestions to fix failed tests
   - Console error corrections if detected

## Prerequisites

- Dev server must be running before launching tests
- Test framework (Playwright, Cypress, etc.) must be configured

## Output

- Summary of test results
- Detailed error reports
- Generated task files for failures
- Actionable recommendations
