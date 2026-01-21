# Example: Playwright Test Output

## Successful Run

```
Running 5 tests using 2 workers

  ✓  1 [chromium] › login.spec.ts:5:1 › should display login form (1.2s)
  ✓  2 [chromium] › login.spec.ts:15:1 › should login with valid credentials (2.3s)
  ✓  3 [chromium] › login.spec.ts:28:1 › should show error for invalid credentials (1.8s)
  ✓  4 [chromium] › dashboard.spec.ts:5:1 › should display dashboard after login (3.1s)
  ✓  5 [chromium] › dashboard.spec.ts:18:1 › should show user profile (1.5s)

  5 passed (9.9s)
```

**Parsed Result:**
- Total: 5
- Passed: 5
- Failed: 0
- Duration: 9.9s

---

## Failed Run

```
Running 5 tests using 2 workers

  ✓  1 [chromium] › login.spec.ts:5:1 › should display login form (1.2s)
  ✗  2 [chromium] › login.spec.ts:15:1 › should login with valid credentials (30.5s)
  ✓  3 [chromium] › login.spec.ts:28:1 › should show error for invalid credentials (1.8s)
  ✓  4 [chromium] › dashboard.spec.ts:5:1 › should display dashboard after login (3.1s)
  ✗  5 [chromium] › dashboard.spec.ts:18:1 › should show user profile (15.2s)

  1) [chromium] › login.spec.ts:15:1 › should login with valid credentials

    Error: Timed out 30000ms waiting for expect(locator).toBeVisible()

    Locator: getByTestId('dashboard-welcome')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - waiting for getByTestId('dashboard-welcome')

       15 |   await page.fill('[name="password"]', 'validpass');
       16 |   await page.click('button[type="submit"]');
    >  17 |   await expect(page.getByTestId('dashboard-welcome')).toBeVisible();
          |                                                       ^
       18 | });

        at login.spec.ts:17:55

    attachment #1: screenshot (image/png) ─────────────────────────────────────
    test-results/login-should-login-chromium/test-failed-1.png

  2) [chromium] › dashboard.spec.ts:18:1 › should show user profile

    Error: expect(received).toContain(expected)

    Expected: "John Doe"
    Received: "Jane Smith"

       18 |   await page.click('[data-testid="profile-link"]');
    >  19 |   await expect(page.locator('.profile-name')).toContainText('John Doe');
          |                                               ^
       20 | });

        at dashboard.spec.ts:19:47

  3 passed (52.8s)
  2 failed
```

**Parsed Result:**
- Total: 5
- Passed: 3
- Failed: 2
- Duration: 52.8s

**Failures:**
1. `login.spec.ts:15` - Timeout waiting for dashboard-welcome
   - Type: Timeout
   - Screenshot: `test-results/login-should-login-chromium/test-failed-1.png`

2. `dashboard.spec.ts:18` - Assertion failed (expected John Doe, got Jane Smith)
   - Type: Assertion
   - No screenshot
