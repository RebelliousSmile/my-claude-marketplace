# Playwright — Firebase auth patterns

## Network idle

- Never use `waitForLoadState('networkidle')` — Firebase keeps persistent connections open, causing guaranteed timeouts
- Use `waitForLoadState('domcontentloaded')` instead

## Environment credentials

- Load `.env` credentials in `playwright.config.ts` via `import { config } from 'dotenv'; config()` before `defineConfig(...)` — Playwright does not auto-load `.env`
- Admin credentials go in `.env.test`, not `.env`:
  - `ADMIN_TEST_EMAIL=...`
  - `ADMIN_TEST_PASSWORD=...`
- In spec files, load `.env.test` after `.env` so test credentials override defaults:
  ```ts
  for (const envFile of ['.env', '.env.test']) {
    // read and assign — .env.test values take priority
  }
  ```

## Admin auth flow

- Login redirects ALL users (including admin) to the app's post-login page — never assume a direct redirect to `/admin` immediately after submit
- Correct pattern:
  ```ts
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.locator('button[type="submit"]').click()
  // Wait for redirect away from /login
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 })
  // Then navigate directly to admin
  await page.goto('/admin')
  await page.waitForLoadState('domcontentloaded')
  ```
- `page.waitForURL(fn)` receives a `URL` object — use `url.pathname.includes(...)`, never `url.includes(...)`

## Custom claims

- Admin access requires Firebase custom claim `admin=true` — set via Cloud Functions, not at account creation
- Custom claims are not visible until the ID token is refreshed

## Rate limits

- Firebase Auth rate-limits account creation per IP (~100/hour)
- Avoid running signup E2E tests in rapid succession
