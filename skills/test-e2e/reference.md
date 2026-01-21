# E2E Test Reference

## Framework Detection

### Priority Order

1. **project-config.md** - Explicit TEST_E2E command
2. **Config file detection** - Auto-detect by files present
3. **package.json scripts** - Check for test:e2e script
4. **User prompt** - Ask for command if nothing detected

### Detection Matrix

| Config File | Framework | Default Command |
|-------------|-----------|-----------------|
| `playwright.config.ts` | Playwright | `npx playwright test` |
| `playwright.config.js` | Playwright | `npx playwright test` |
| `cypress.config.ts` | Cypress | `npx cypress run` |
| `cypress.config.js` | Cypress | `npx cypress run` |
| `cypress.json` | Cypress (legacy) | `npx cypress run` |
| `vitest.config.ts` + e2e | Vitest | `npx vitest run` |
| `jest.config.js` + e2e/ | Jest | `npm run test:e2e` |

### Package Manager Detection

| Lock File | Package Manager | Run Command |
|-----------|-----------------|-------------|
| `pnpm-lock.yaml` | pnpm | `pnpm test:e2e` |
| `yarn.lock` | yarn | `yarn test:e2e` |
| `bun.lockb` | bun | `bun test:e2e` |
| `package-lock.json` | npm | `npm run test:e2e` |

## Common Error Patterns

### Timeout Errors

**Symptoms:**
- "Timeout exceeded"
- "waiting for selector"
- "Navigation timeout"

**Causes:**
- Slow network/server
- Wrong selector
- Element not rendered

**Fixes:**
- Increase timeout
- Check selector validity
- Add wait for element

### Element Not Found

**Symptoms:**
- "Element not found"
- "Cannot find element"
- "No element matching"

**Causes:**
- Wrong selector
- Element not in DOM
- Timing issue

**Fixes:**
- Verify selector in browser
- Add explicit wait
- Check if element is conditional

### Assertion Failures

**Symptoms:**
- "Expected X to equal Y"
- "Assertion failed"

**Causes:**
- Business logic changed
- Test data changed
- Race condition

**Fixes:**
- Update expected values
- Check test data
- Add proper waits

### Network Errors

**Symptoms:**
- "net::ERR_CONNECTION_REFUSED"
- "Failed to fetch"
- "ECONNREFUSED"

**Causes:**
- Server not running
- Wrong URL/port
- CORS issues

**Fixes:**
- Start dev server
- Check baseURL config
- Verify API endpoints

## Dev Server Ports

| Framework | Default Port |
|-----------|--------------|
| Vite | 5173 |
| Next.js | 3000 |
| Create React App | 3000 |
| Angular | 4200 |
| Vue CLI | 8080 |
| Nuxt | 3000 |

## Cross-Platform Commands

### Check Port

**Unix/macOS:**
```bash
lsof -i :3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

**Windows PowerShell:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
Invoke-WebRequest -Uri http://localhost:3000 -Method Head -ErrorAction SilentlyContinue
```

### Run Tests

**Playwright:**
```bash
npx playwright test                    # All tests
npx playwright test login.spec.ts      # Specific file
npx playwright test --grep "login"     # By name pattern
npx playwright test --headed           # With browser visible
npx playwright test --debug            # Debug mode
```

**Cypress:**
```bash
npx cypress run                        # All tests
npx cypress run --spec "**/login*"     # Specific file
npx cypress open                       # Interactive mode
```

**Vitest:**
```bash
npx vitest run                         # All tests
npx vitest run login                   # By name
npx vitest --ui                        # UI mode
```
