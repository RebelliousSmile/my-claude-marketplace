---
name: perf-checklist-nuxt
description: Reusable performance checklist for Nuxt 3 routes (LCP/CLS/INP/TBT). Derived from PSI iterations 1-4 on jeveuxtravailler.com (DEC-016 → DEC-031).
---

# Nuxt 3 Performance Checklist — `{route or feature}`

> Target metrics: LCP ≤ 2.5s mobile, CLS ≤ 0.1, INP ≤ 200ms, TBT ≤ 200ms (PSI mobile @ Slow 4G / 4× CPU).
> Fill `🟢 / 🟡 / 🔴 / N/A` per item. Add `file:line` references when fixing.

## 0. Pre-flight

- [ ] **Primary deterministic metric** defined BEFORE coding (bytes saved, chunks blocked, requests removed, SQL queries removed) — this is the load-bearing success signal
- [ ] **3-5 PSI mobile runs** captured (`https://pagespeed.web.dev/`, 5-min interval) to characterize noise floor — single-run baseline is unfalsifiable (this project: 53 / 82 / 55 on identical build, DEC-030)
- [ ] PSI anonymous API limit (~25/day) noted — for 5+ programmatic runs use the web UI manually OR a Google API key. `npx lighthouse` local ≠ PSI cloud (different throttling, different pool, medians NOT comparable across the two)
- [ ] Lighthouse trace exported (DevTools > Performance > Throttling: Slow 4G + 4× CPU)
- [ ] Coverage report (DevTools > Coverage) — note unused JS/CSS bytes
- [ ] Acceptance threshold defined per metric BEFORE coding — primary deterministic + secondary PSI median, with explicit "if PSI variance dominates, trust deterministic delta" fallback

## 1. Render-blocking critical path

- [ ] No blocking CSS framework loaded for icons (Boxicons, FontAwesome via CDN, etc.) — see DEC-021
- [ ] Inline critical CSS only for above-fold; defer rest via `nuxt.config.ts` `experimental.inlineSSRStyles`
- [ ] Third-party JS (GTM, Klaviyo, Clarity) deferred via `requestIdleCallback` or interaction trigger
- [ ] `preconnect` reserved to **above-fold** origins only; deferred origins use `dns-prefetch` (rule `07-quality/07-preconnect-strategy.md`)
- [ ] No origin in `preconnect`/`dns-prefetch` whose request is never actually fired (`grep`-verify)
- [ ] `<link rel="preload">` on fonts uses **stable public URL** (`/fonts/...`), never hashed `/_nuxt/` path (DEC-020)
- [ ] `<link rel="preload">` `as=` attribute matches resource type (`as="font"` requires `crossorigin`)

## 2. LCP (image / hero)

- [ ] Hero image has `<link rel="preload" as="image" fetchpriority="high">` (DEC-025) — `fetchpriority` is mandatory, not optional
- [ ] Responsive hero uses `imagesrcset` + `imagesizes` in preload (NOT plain `href` — browser preloads largest variant otherwise)
- [ ] Hero `<img>` carries `fetchpriority="high"` `loading="eager"` `decoding="async"`
- [ ] **Above-fold hero uses `<img :src="webp">` directly — NO `<picture>` wrapper** (DEC-033): Chrome preload scanner fetches `<img src>` before `<picture>` is evaluated → fallback JPG is requested then aborted (`net::ERR_ABORTED`) → Inspector Issue → Bonnes pratiques -4%
- [ ] Below-fold images: keep `<picture><source webp><img jpg></picture>` pattern (preload scanner does not aggressively fetch lazy images)
- [ ] Responsive above-fold: `srcset`/`sizes` on `<img>` directly (not on `<source>`)
- [ ] No `net::ERR_ABORTED` on image resources — verify via DevTools Network or Playwright `browser_network_requests`
- [ ] WebP served via `<picture>` + `<source type="image/webp">` only for below-fold — never @nuxt/image unless explicitly needed
- [ ] Explicit `width` + `height` on every `<img>` matching intrinsic dimensions (CLS guard)
- [ ] Below-fold images: `loading="lazy"` `decoding="async"` no `fetchpriority`
- [ ] Video poster points to `.webp` directly (`<picture>` doesn't apply to `<video poster>`)

## 3. CLS

- [ ] Reserved space for async content: skeletons, fixed `min-height`, aspect-ratio boxes
- [ ] `font-display: swap` + matching `@font-face src:` URLs identical to preload URLs (else FOUT + warning)
- [ ] No injected banner/cookie/auth UI shifting layout above the fold (use `<ClientOnly>` + reserved height)
- [ ] No late-loaded ads / iframes without explicit dimensions

## 4. JS bundle size & lazy-loading

- [ ] `pnpm nuxt build` — **zero** `dynamic import will not move module into another chunk` warnings (DEC-028)
- [ ] `grep -rn "from ['\"]firebase/" --include=*.{vue,js,ts}` — every match passes through `useFirebase()` composable (rule `useFirebase()` lazy-init pattern)
- [ ] No top-level `getFirestore()` / `doc(db, …)` in composables → use lazy `await useFirebase()` inside each method (else SSR crash, see fix DEC-…)
- [ ] Firebase auth listeners use one-shot pattern with `unsubscribe()` (rule `04-firebase-auth-listeners.md`) — except `app.vue:setupAuthExpiryWatcher`
- [ ] Marketing routes (`/`, `/entreprises`, `/comment-ca-marche`, `/entreprises/comment-ca-marche`) gated via `shared/marketingRoutes.js` `isMarketingPath()` — single source of truth (DEC-016)
- [ ] Heavy stores (Auth, Candidate, Company) instantiated only on first non-marketing navigation (DEC-016)
- [ ] `<link rel="modulepreload">` Firebase chunks stripped from marketing HTML via `server/plugins/strip-marketing-modulepreload.js` (DEC-029) — verify with `view-source:/`
- [ ] Modulepreload strip signatures live in `shared/firebaseSdkSignatures.js` (single source of truth) — never duplicated inline in plugin or tripwire (DEC-032)
- [ ] Before extending strip signatures: anti-collision scan `grep -rn '<token>' --include=*.{vue,js,ts}` — must match ONLY the SDK chunk filename, never application code (DEC-032)
- [ ] Postbuild tripwire `pnpm postbuild:check` (`scripts/verify-marketing-strip.mjs`) — fails build if any signature leaks into prerendered marketing HTML (DEC-032)
- [ ] Heavy data files (communes JSON, large fixtures) loaded on first interaction, not at boot (#103)
- [ ] Analytics scripts loaded after `requestIdleCallback` AND idempotent (loading guard + existing script detection) — see iteration-2-perf-learnings

## 5. CSS

- [ ] Tailwind purge effective: build CSS < 50 KB gzip on marketing routes
- [ ] No `@apply` chains > 4 levels deep
- [ ] No `transition-all` / `transition: all` (DEC-027). Restrict to specific composited properties: `transform`, `opacity`. Verify the transition actually fires (Vue reactive update + class change), else it's a paint cost for nothing
- [ ] No global `* { transition: ... }` selector
- [ ] Confetti / animation libs scoped to consuming component, not global stylesheet
- [ ] Icons via `lucide-vue-next` (tree-shaken) on public pages (DEC-021); `<box-icon>` only in admin

## 6. Caching & hosting

- [ ] HTML `Cache-Control: public, max-age=0, must-revalidate` (or `s-maxage` if CDN) — never `no-cache` for prerendered routes
- [ ] Assets `_nuxt/*` `Cache-Control: public, max-age=31536000, immutable`
- [ ] Fonts, video posters, social icons under long-term cache headers (#107)
- [ ] Firebase Hosting `firebase.json` — `trailingSlash: false` if SEO canonicals are slash-less (DEC-031); 301 redirects audited for prerendered routes
- [ ] No conflicting redirect rules between `nuxt.config.ts` and `firebase.json`

## 7. SSR / prerender

- [ ] `pnpm nuxt build` succeeds — no `Unexpected token 'default'`, no `Cannot find package`
- [ ] Prerender list in `nuxt.config.ts` `nitro.prerender.routes` matches `sitemap.xml` and `robots.txt` (rule `01-seo-robots-txt.md`)
- [ ] No top-level Firebase / Firestore / sessionStorage call in composables (lazy via `useFirebase()` or guarded by `process.client`)
- [ ] `<ClientOnly>` only where strictly needed (auth UI) — overuse hurts SEO and FCP
- [ ] Hydration mismatches: `0` console errors on first SSR load (DevTools console > Filter "hydration")
- [ ] Routes `ssr: false` (compte-entreprise, admin) do NOT produce a route-specific HTML — they fall back to `200.html`. Verify modulepreload strip on `.output/public/200.html`, not `.output/public/<ssr-false-route>/index.html`

## 8. Render performance (INP / TBT)

- [ ] No expensive sync work in `onMounted` of below-fold components — defer with `IntersectionObserver` `rootMargin: 200px` (DEC-023)
- [ ] No `requestAnimationFrame` loops without throttle / cleanup
- [ ] Long lists virtualized when > 100 rows (`vue-virtual-scroller` or similar)
- [ ] Event handlers debounced for input/scroll (`useDebounceFn` from VueUse)
- [ ] No layout thrashing patterns (read-then-write DOM in same frame)

## 9. Firebase / Firestore quota & perf

- [ ] All `query()` carry `limit()` (rule `03-firebase-resources.md`)
- [ ] Counts via `getAggregateFromServer(count())`, never `getDocs().length`
- [ ] No Firestore call inside `for` loops — batch with `documentId() in [...]` (chunk by 30)
- [ ] Static reference data cached in Pinia store with TTL (5min default)
- [ ] `onSnapshot` always unsubscribed in `onUnmounted`

## 10. Client-side storage (localStorage / sessionStorage / IndexedDB / Cache API / Cookies)

> SSR-guard items (marked **[SSR-JS]**) apply only to stacks with isomorphic JS rendering (Nuxt, Next, SvelteKit). On WordPress / PHP vanilla / Django templates / static Astro, mark them **N/A** — JS only runs in the browser, no `window undefined` at build/render. See `references/framework-mapping.md` §10 transverse for stack pivots.

### localStorage / sessionStorage

- [ ] **[SSR-JS]** No `localStorage.getItem` / `setItem` at module top-level — sync read blocks main thread AND crashes SSR (no `window`)
- [ ] **[SSR-JS]** All access guarded by `if (process.client)` or `if (typeof window !== 'undefined')` — Nuxt/SSR safety
- [ ] **[SSR-JS hors plugins `.client.*`]** Hydration-safe: initial render uses neutral value, storage read happens in `onMounted` — else hydration mismatch warning. Plugins `.client.*` skip SSR by Nuxt contract → not subject to this rule
- [ ] No PII, auth tokens, API keys, or session secrets stored — XSS exfiltration vector
- [ ] **Pinia/store-persistence plugins audited**: which fields end up in localStorage? PII fields (email, phone, name, profile data) flagged — transparent `$state` dump = silent XSS exfil surface
- [ ] JSON-parsed values cached in memory after first read — never `JSON.parse(localStorage.getItem(key))` per render
- [ ] Quota guarded: `try/catch` around `setItem` ; branch degraded logic on `error.name === 'QuotaExceededError'` (other storage errors must propagate, not be swallowed in a generic `console.warn`)
- [ ] Keys prefixed with app namespace (e.g. `jvt:`) — avoid collision on shared subdomain
- [ ] **Single key-prefix convention enforced project-wide** (e.g. all `jvt:*`) — multiple coexisting conventions (`jvt_`, kebab, snake) = collision risk + audit overhead
- [ ] sessionStorage scope acknowledged: tab-scoped, NOT shared across tabs, wiped on tab close
- [ ] `storage` event listeners debounced if used for cross-tab sync — fires per `setItem`, not batched
- [ ] Tests using localStorage install Map-backed mock (rule `05-test-localstorage.md` — `tests/setup.ts` overrides with non-persistent `vi.fn()`)

### IndexedDB

- [ ] Wrapper library used (`idb` or `dexie`) — raw event-based API is verbose and bug-prone
- [ ] Schema versioning: `upgrade` callback handles every historical version path — never silently mutate schema
- [ ] Transactions scoped tight — queue all operations synchronously (auto-commits on next microtask)
- [ ] Quota monitored via `navigator.storage.estimate()` — log warning when `usage / quota > 0.8`
- [ ] `navigator.storage.persist()` requested for offline-critical data — best-effort eviction otherwise
- [ ] Schema change covered by a migration test fixture from each shipped previous version
- [ ] No blocking sync read in render path — IDB is async, results must flow through reactive state

### Cache API / Service Worker (PWA)

- [ ] SW lifecycle: `self.skipWaiting()` + `clients.claim()` for instant updates — stale SW persists indefinitely otherwise
- [ ] Cache name versioned (`app-v3`) — bumped on deploy to invalidate stale entries
- [ ] Cache strategy explicit per route: cache-first (hashed assets), network-first (HTML), stale-while-revalidate (API)
- [ ] Eviction policy in place — `cache.delete()` on old entries OR `caches.keys()` cleanup in `activate` event
- [ ] Workbox / Vite PWA config tested across two consecutive deploys — no critical asset stuck in stale cache

### Cookies

- [ ] Cookies < 4 KB each, < 50 per domain — overflow drops oldest silently
- [ ] Cookies reserved to **server-needed data** — every cookie is sent on every request (bandwidth tax)
- [ ] App-only state lives in localStorage / IndexedDB, NOT cookies
- [ ] Auth cookies: `HttpOnly` + `Secure` + `SameSite=Lax` (or `Strict`) — never `document.cookie` for tokens
- [ ] Consent / tracking-state cookies justified (must propagate to backend) — else move to localStorage

### Cross-tab synchronization

- [ ] `BroadcastChannel` preferred over `storage` event for intentional app-to-app messaging (richer payload, no key/value encoding)
- [ ] IndexedDB writes that other tabs depend on broadcast via `BroadcastChannel` — no native IDB change event

## 11. Verification & non-regression

- [ ] **Primary success criterion** — deterministic delta confirmed (bytes saved, chunks blocked, requests removed, SQL queries removed). This is the load-bearing signal
- [ ] **Secondary PSI re-run** (5+ runs, mobile, 5-min interval) — declare "real gain" only if **median post-fix > maximum pre-fix**, else: "fix shipped, PSI variance dominates, deterministic delta is the trustable signal"
- [ ] Build artifacts checked: `view-source:/<route>` on prod / preview channel — confirm preload/modulepreload list matches expectation
- [ ] Lighthouse trace re-exported, compared to baseline trace
- [ ] No regression on adjacent routes (run PSI on 2-3 sibling routes)
- [ ] Decision recorded in `aidd_docs/internal/decisions/DEC-XXX-….md` if a non-obvious trade-off was made
- [ ] Project rules updated when a new pattern emerges (e.g. `.claude/rules/03-frameworks-and-libraries/...`)

## 12. Checklist self-audit (feedback loop)

> Après l'audit, 5 minutes pour faire converger la checklist vers la réalité du projet. Chaque passage doit la rendre plus précise. **Output obligatoire** : section `## Checklist learnings` ajoutée au header de l'audit report.

- [ ] **Gaps découverts** — issues réelles trouvées HORS checklist (par revue manuelle, grep ad-hoc, lighthouse trace) : pour chacune, formuler le bullet manquant + section cible (`§N`)
- [ ] **Faux positifs** — items cochés "N/A" sur ce stack : décider suppression vs tag conditionnel (`[SSR-JS]`, `[Blaze only]`, etc.)
- [ ] **Items ambigus** — bullets dont l'interprétation a hésité : reformuler en plus court / nommer le symbole / ajouter un exemple
- [ ] **Anti-patterns émergents** — patterns rencontrés ≥ 2× dans le projet : candidats pour la table `## Common anti-patterns`
- [ ] **Commandes utiles** — greps/scripts ad-hoc qui ont surfacé des problèmes : candidats pour `## Quick verification commands`
- [ ] **Pivots manquants** — stack hybride / variante non documentée dans `references/framework-mapping.md` : proposer un ajout
- [ ] **DEC trigger** — trade-off non évident pendant l'audit ? Si `aidd_docs/internal/decisions/` existe → créer `DEC-XXX-...md`
- [ ] **Sections rarement utilisées** — si ≥ 60% N/A pour ce stack : marquer la section comme conditionnelle dans framework-mapping plutôt que listée par défaut

### Action après remplissage

Si ≥ 3 gaps réels OU ≥ 1 anti-pattern récurrent OU ≥ 1 pivot manquant émergent → proposer à l'utilisateur (ne jamais patcher silencieusement) :

1. Diff proposé pour `aidd_docs/templates/dev/perf_checklist_<stack>.md`
2. Diff proposé pour `references/framework-mapping.md` si pivot stack-spécifique
3. Diff proposé pour la table `## Common anti-patterns` ou `## Quick verification commands`
4. Mise à jour de `tests.md` (skill) si nouveau cas de détection à couvrir

Format des diffs proposés : bullet `+` (ajout) / `-` (suppression) / `~` (reformulation), source = file:section.

## Common anti-patterns (rejected)

| Anti-pattern | Why rejected | Reference |
|--------------|--------------|-----------|
| Convert SOME static imports of a heavy dep to dynamic | Single residual static import collapses chunk back into parent — Vite warning is load-bearing | DEC-028 |
| Add `transition-all` for "smooth feel" | No-op when classes don't change OR `v-if` swap; paints non-composited properties | DEC-027 |
| `preconnect` to every external origin "just in case" | Wastes TCP+TLS slots; deferred scripts should `dns-prefetch` only | rule `07-preconnect-strategy.md` |
| `@nuxt/image` for one-off WebP optimization | Adds module + migration cost > native `<picture>` | DEC-019 |
| `loading="eager"` alone on hero | Browser still deprioritizes behind fonts — needs `fetchpriority="high"` on preload | DEC-025 |
| `<picture>` wrapper on above-fold LCP images | Chrome preload scanner fetches `<img src>` (JPG) → ERR_ABORTED → Inspector Issue → Bonnes pratiques -4% | DEC-033 |
| `<source type="image/jpeg">` first as "fallback" | All browsers support JPEG → source always selected → WebP never used | DEC-033 |
| Manual `manualChunks` to split a heavy dep | Splits file count, not runtime cost; chunk still preloaded | DEC-028 |
| Mount-only marketing gating | Skips re-init on SPA navigation — heavy stores never bootstrap | DEC-016 / iteration-2-perf-learnings |
| Single-run PSI as success metric | Lighthouse cloud variance ±29 points run-to-run on identical build | DEC-030, iteration 5 baseline 53/82/55 |
| Strip-plugin signatures duplicated inline | Drift between plugin and tripwire — single source of truth required | DEC-032 |
| `JSON.parse(localStorage.getItem(...))` per render | Sync read blocks main thread + parse cost on every reactive update | rule `05-test-localstorage.md` |
| `JSON.parse(sessionStorage.getItem(k) ‖ '[]')` at top-level `<script setup>` | Combines parse-on-mount + silent string-empty fallback + no JSON-malformed catch | — |
| Auth tokens / PII in `localStorage` | XSS exfiltration vector — any third-party script can read it | OWASP A07 |
| Pinia store persistence transparent `$state` dump | Includes PII (email, phone, profile) without per-field audit — XSS exfil silent | DEC-034 |
| IndexedDB without schema versioning | Silent corruption on app update — `upgrade` callback skipped | — |
| Cookies for app-only state | Bandwidth tax (sent every request) when localStorage / IDB suffices | — |
| Service Worker without `skipWaiting()` | Stale SW + cached assets persist across deploys until tab closed | — |

## Quick verification commands

```bash
pnpm nuxt build 2>&1 | grep -E "(dynamic import|warn|WARN|ERROR)"
pnpm nuxt build 2>&1 | grep -i "modulepreload"
grep -rn "transition-all" --include=*.vue --include=*.css
grep -rn "from ['\"]firebase/" --include=*.{vue,js,ts}
grep -rn "preconnect" nuxt.config.ts
ls -lh .output/public/_nuxt/*.js | sort -k5 -h | tail -10
pnpm postbuild:check                                    # Tripwire: signatures leakage in marketing HTML (DEC-032)
node scripts/verify-marketing-strip.mjs                 # Manual run of the tripwire

# Browser storage audit
grep -rn "localStorage\|sessionStorage" --include=*.{vue,js,ts} | grep -v "process.client\|typeof window"  # unguarded sync reads
grep -rn "JSON.parse(localStorage\|JSON.parse(sessionStorage" --include=*.{vue,js,ts}  # parse-on-read anti-pattern
grep -rn "pinia-persist\|persistedstate\|saveStore\|restoreStore" --include=*.{vue,js,ts}  # PII surface in localStorage
grep -rn "indexedDB\|from ['\"]idb\|from ['\"]dexie" --include=*.{vue,js,ts}  # IDB usage map
grep -rn "document.cookie" --include=*.{vue,js,ts}             # cookie write sites (audit HttpOnly violations)
grep -rn "navigator.storage" --include=*.{vue,js,ts}           # quota / persist API usage
```
