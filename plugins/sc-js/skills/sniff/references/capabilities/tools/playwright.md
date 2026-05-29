# Playwright — mesure de performance web + fiabilité E2E

Deux usages, selon comment le projet utilise Playwright :
- **Mesure de performance** (sections CWV / throttling / traces ci-dessous) — chargé par `web-optimize` au §11 Verification.
- **Fiabilité de la suite E2E fonctionnelle** (section dédiée en bas) — la plupart des projets utilisent Playwright pour de l'E2E, pas de la perf. À l'audit, si aucun harness perf n'existe, ce n'est **pas une violation** (N/A) ; revoir alors la suite contre les critères de fiabilité.

## Mesurer les Core Web Vitals

```js
const { lcp, cls, inp } = await page.evaluate(() => {
  return new Promise(resolve => {
    const metrics = {};
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') metrics.lcp = entry.startTime;
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) metrics.cls = (metrics.cls || 0) + entry.value;
        if (entry.entryType === 'event') metrics.inp = Math.max(metrics.inp || 0, entry.duration);
      }
      resolve(metrics);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
});
```

Cible : LCP < 2500 ms, CLS < 0.1, INP < 200 ms.

## Throttling réseau et CPU

```js
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false, downloadThroughput: 1.5 * 1024 * 1024 / 8,  // 1.5 Mbps
  uploadThroughput: 750 * 1024 / 8, latency: 40,
});
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // Mobile 4×
```

Reproduit les conditions PSI "Mobile" — toujours mesurer throttlé avant de reporter un gain.

## Capture de traces performance

```js
await page.tracing.start({ screenshots: true, snapshots: true });
await page.goto(url);
await page.tracing.stop({ path: 'trace.zip' });
// Ouvrir avec : npx playwright show-trace trace.zip
```

La trace Playwright = équivalent Chrome DevTools Performance tab. Inspecter les Long Tasks (> 50 ms) et le TBT.

## Intégration Lighthouse CLI

```bash
# Lighthouse depuis la ligne de commande (sans Playwright)
npx lighthouse https://... --output json --output-path report.json \
  --preset=desktop --chrome-flags="--headless"
jq '.audits["largest-contentful-paint"].numericValue' report.json
```

Pour lancer Lighthouse dans Playwright, utiliser `playwright-lighthouse` ou lancer via `execa` depuis un test.

## Screenshot avant/après

```js
await page.goto(url);
await page.screenshot({ path: 'before.png', fullPage: true });
// … appliquer l'optimisation …
await page.screenshot({ path: 'after.png', fullPage: true });
```

Comparer visuellement pour détecter les régressions CLS (layout shift visible à l'œil).

## Mesure du bundle

```js
const responses = [];
page.on('response', r => responses.push({ url: r.url(), size: r.headers()['content-length'] }));
await page.goto(url);
const jsTotal = responses
  .filter(r => r.url.endsWith('.js'))
  .reduce((sum, r) => sum + parseInt(r.size || 0), 0);
console.log(`JS total: ${(jsTotal / 1024).toFixed(1)} KB`);
```

## Fiabilité E2E fonctionnel

S'applique à toute suite Playwright fonctionnelle (l'usage dominant). Indépendant de la perf.

- **Bannir `waitForTimeout(ms)`** — attente arbitraire = test flaky (trop court → échec aléatoire, trop long → suite lente). Remplacer par une attente sur état :
  ```js
  // ❌ await page.waitForTimeout(2000)
  await page.waitForLoadState('networkidle')        // réseau stabilisé
  await expect(page.getByRole('dialog')).toBeVisible()  // attente liée à l'assertion (auto-retry)
  await page.getByTestId('row').waitFor()            // élément précis
  ```
- **Sélecteurs résilients** : `getByRole`/`getByLabel`/`getByTestId` plutôt que des sélecteurs CSS/XPath positionnels (`.col > div:nth-child(3)`) qui cassent au moindre changement de markup.
- **Isolation des tests** : pas d'état partagé entre tests ; `beforeEach` pour remettre à zéro (session, storage). Un test ne doit jamais dépendre de l'ordre d'exécution.
- **Web-first assertions** : `await expect(locator).toHaveText(...)` (auto-retry intégré) plutôt que lire une valeur puis `expect(value)` (snapshot figé, pas de retry).
- **Pas de `page.$()` / `elementHandle`** pour les assertions → préférer les `locator` (lazy, auto-waiting).

## Anti-patterns

- Mesurer sans throttling → résultats non représentatifs (machine dev = fibre + CPU haut de gamme)
- Un seul run → variance PSI ±15 normale ; toujours ≥ 5 runs, médiane comme référence
- Comparer LCP entre pages différentes → mesurer toujours la même URL avant/après
- `waitForTimeout()` pour stabiliser → utiliser `waitForLoadState('networkidle')` ou un sélecteur précis (vaut pour la perf **et** l'E2E fonctionnel)
