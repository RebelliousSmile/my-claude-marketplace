# Microsoft Clarity

## Modèle best-effort

Clarity est une couche d'observabilité UX (session replay, heatmaps), **pas une source de vérité fiable**. Le script est fréquemment bloqué par les bloqueurs de publicités et les extensions de confidentialité — `ERR_BLOCKED_BY_CLIENT` est la norme, pas l'exception. Ne jamais baser des KPIs quantitatifs sur Clarity seul.

## Catégorie de consentement

| Signal | Catégorie | Consent Mode v2 signal |
|---|---|---|
| Clarity | `behavior` | `personalization_storage` |

Clarity ne se charge que si `isCategoryEnabled('behavior')` est vrai. C'est distinct de `analytics` (GA4) et `advertising` (Meta Pixel).

## Pattern d'initialisation de la queue

Initialiser la queue Clarity **avant** d'injecter le script externe — les appels `window.clarity()` peuvent alors être passés immédiatement :

```js
function initClarityQueue() {
  if (typeof window.clarity === 'function') return
  window.clarity = function (...args) {
    ;(window.clarity.q = window.clarity.q || []).push(args)
  }
}
```

Deux concerns distincts à ne pas confondre :

- **Idempotence (guard dans `initClarityQueue`)** : `typeof window.clarity === 'function'` empêche d'écraser la fonction native si le script externe a déjà été chargé et a remplacé la stub. C'est le seul rôle de ce guard.
- **Call-safety (au site d'appel)** : ce guard ne protège PAS contre `window.clarity` indéfini au moment de l'appel. Toujours utiliser l'optional chaining `window.clarity?.('event', name)` lors de chaque appel — le script peut être bloqué par un ad blocker même si le consentement a été accordé.

## Chargement conditionnel (Nuxt plugin)

```js
const loadClarity = () => {
  if (clarityLoaded || !isCategoryEnabled('behavior')) return
  clarityLoaded = true
  initClarityQueue()

  const script = document.createElement('script')
  script.id = 'lazy-clarity-script'
  script.async = true
  script.src = 'https://www.clarity.ms/tag/<CLARITY_PROJECT_ID>'
  document.head.appendChild(script)
}
```

- Chargement lazy : dans `onConsentChange` + hook `app:mounted` (pour les visiteurs de retour dont le consentement est déjà dans localStorage)
- La variable d'environnement `NUXT_PUBLIC_ENABLE_CLARITY=true` active Clarity en dehors de la production (dev, staging)
- En production, Clarity est toujours activé si le consentement `behavior` est accordé

## Pattern de push dual (GTM + Clarity)

Pour les events comportementaux, double push : GTM pour la persistance, Clarity pour la corrélation avec les replays :

```js
// Taxonomie : trackCustomEvent → analytics (consent) + Clarity best-effort
function trackCustomEvent(name, params = {}) {
  // 1. GTM / GA4 — gated par consentement analytics
  if (canTrackAnalytics()) {
    window.dataLayer.push({ event: name, ...params })
    // Clarity best-effort — ignoré si window.clarity n'est pas défini
    window.clarity?.('event', name)
  }
}
```

Clarity reçoit uniquement le nom de l'event (`window.clarity('event', name)`). Ne pas passer de PII (email, uid) — les sessions Clarity sont publiques dans le dashboard.

## Taxonomie des fonctions de push

| Fonction | Gate consent | Clarity | Usage |
|---|---|---|---|
| `trackCustomEvent(name, params)` | `analytics` seul | ✓ | Events UX (results_loaded, swipe, tab_switch) |
| `pushGtmEvent(name, params)` | `analytics` OU `advertising` | ✗ | Events de conversion (signup, email_verified) |

Clarity ne reçoit **jamais** les events de conversion — ils passent par `pushGtmEvent` qui ne fait pas de push Clarity.

## Contrôle par feature flag (Nuxt)

```js
const isProd = process.env.NODE_ENV === 'production'
const clarityEnabled = process.env.NUXT_PUBLIC_ENABLE_CLARITY === 'true'
const shouldLoadClarity = isProd || clarityEnabled
```

En développement, Clarity est désactivé par défaut pour éviter du bruit dans les replays. Activer avec `NUXT_PUBLIC_ENABLE_CLARITY=true` dans `.env.local` pour valider l'intégration.

## Tests E2E

Trois tests à couvrir :

### 1. Smoke — chargement conditionnel

```ts
const CLARITY_HOST_PATTERN = /https:\/\/www\.clarity\.ms\/tag\//

test('smoke: charge Clarity selon environnement', async ({ page }) => {
  if (shouldLoadClarity) {
    await grantBehaviorConsent(page)
  }
  await page.goto('/')
  await page.waitForLoadState('load')

  const hasClarityScript = async () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('script[src]')).some(s =>
        /https:\/\/www\.clarity\.ms\/tag\//.test(s.getAttribute('src') || '')
      )
    )

  if (shouldLoadClarity) {
    await expect.poll(hasClarityScript, { timeout: 8000 }).toBeTruthy()
    await expect.poll(() => page.evaluate(() => typeof window.clarity)).toBe('function')
  } else {
    expect(await hasClarityScript()).toBeFalsy()
    await expect.poll(() => page.evaluate(() => typeof window.clarity)).toBe('undefined')
  }
})
```

### 2. Résilience — page utilisable si script bloqué

```ts
test('résilience: page utilisable si Clarity bloqué', async ({ page }) => {
  await page.route(CLARITY_HOST_PATTERN, route => route.abort())
  const response = await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  expect(response!.status()).toBeLessThan(500)
  await expect(page.locator('body')).not.toContainText('Application error')
  // Navigation reste fonctionnelle malgré le blocage
  await page.getByRole('link', { name: /contact/i }).first().click()
  await expect(page).toHaveURL('/contact')
})
```

### 3. Garde-fou perf — le blocage ne dégrade pas fortement le chargement

```ts
const PERF_TOLERANCE_FACTOR = 1.6  // max 60% de dégradation acceptable
const PERF_TOLERANCE_MS = 400       // marge fixe en ms
const PERF_RUNS = 3                 // médiane sur 3 runs

test('garde-fou perf: blocage Clarity toléré', async ({ browser }) => {
  // Mesure sans blocage
  const ctxNormal = await browser.newContext()
  const pageNormal = await ctxNormal.newPage()
  const runsNormal: number[] = []
  for (let i = 0; i < PERF_RUNS; i++) {
    const t = Date.now()
    await pageNormal.goto('/')
    await pageNormal.waitForLoadState('domcontentloaded')
    runsNormal.push(Date.now() - t)
  }
  await ctxNormal.close()

  // Mesure avec blocage
  const ctxBlocked = await browser.newContext()
  await ctxBlocked.route(CLARITY_HOST_PATTERN, route => route.abort())
  const pageBlocked = await ctxBlocked.newPage()
  const runsBlocked: number[] = []
  for (let i = 0; i < PERF_RUNS; i++) {
    const t = Date.now()
    await pageBlocked.goto('/')
    await pageBlocked.waitForLoadState('domcontentloaded')
    runsBlocked.push(Date.now() - t)
  }
  await ctxBlocked.close()

  const median = (arr: number[]) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)]
  const upperBound = median(runsNormal) * PERF_TOLERANCE_FACTOR + PERF_TOLERANCE_MS
  expect(median(runsBlocked)).toBeLessThanOrEqual(upperBound)
})
```

## Points de vigilance

- Ne jamais appeler `window.clarity('set', 'userId', email)` — PII dans les sessions = RGPD violation
- Clarity ne remplace pas GTM/GA4 pour les metrics de conversion
- `window.clarity` peut être `undefined` même avec consentement accordé (script bloqué) — toujours appeler via optional chaining `window.clarity?.(...)` ou vérifier `typeof window.clarity === 'function'`
- Les tests Playwright de chargement utilisent `expect.poll` avec un timeout (8s) car le script est chargé via `requestIdleCallback` / `app:mounted` hook — pas immédiatement disponible après `page.goto`
