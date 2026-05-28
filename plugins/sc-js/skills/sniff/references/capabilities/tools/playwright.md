# Playwright — mesure de performance web

Pivot orienté **vérification perf** — pas E2E fonctionnel. Chargé par `web-optimize` au §11 Verification.

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

## Anti-patterns

- Mesurer sans throttling → résultats non représentatifs (machine dev = fibre + CPU haut de gamme)
- Un seul run → variance PSI ±15 normale ; toujours ≥ 5 runs, médiane comme référence
- Comparer LCP entre pages différentes → mesurer toujours la même URL avant/après
- `waitForTimeout()` pour stabiliser → utiliser `waitForLoadState('networkidle')` ou un sélecteur précis
