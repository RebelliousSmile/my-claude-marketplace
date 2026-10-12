# Verify

Audit the current project's code against the service rules and report violations, warnings, and compliant patterns.

## Inputs

- `project_path` (optional): root of the project to audit. Defaults to current working directory.
- `services` (optional): comma-separated list of services to audit (e.g. `firebase,klaviyo,gtm`). Defaults to all detected services.

## Process

### Step 1 — Detect services in use

Search the project for signals of each supported service:

| Service | Detection signals |
|---|---|
| Firebase | `import.*firebase`, `firestore`, `onAuthStateChanged`, `getDoc`, `getDocs` |
| Klaviyo | `klaviyo`, `KLAVIYO`, `createKlaviyoClient`, `klaviyoClient` |
| GTM / gtag | `GTM-`, `window.gtag`, `dataLayer`, `consent.*update` |
| Meta Pixel | `fbq`, `MetaPixel`, `ad_storage`, `pixel` |
| Clarity | `clarity.ms`, `window.clarity`, `ENABLE_CLARITY`, `initClarityQueue` |
| Stripe | `stripe` dependency or import, `STRIPE_`, `constructEvent`, `checkout.sessions`, `billingPortal` |
| PageSpeed / Perf | Explicit only — activate via `services=perf`; not auto-detected |

Only audit services that are detected (or explicitly requested via `services` argument).

### Step 2 — Load rules for detected services

Read the corresponding reference file for each detected service:

| Service | Reference file |
|---|---|
| Firebase | `references/03-firebase-resources.md` |
| Klaviyo | `references/09-klaviyo.md` |
| GTM / gtag / Meta Pixel | `references/10-gtm-consent-meta.md` |
| Clarity | `references/11-clarity.md` |
| Stripe | `references/13-stripe.md` |
| PageSpeed / Perf | `references/12-pagespeed-insights.md` |

### Step 3 — Scan the project

For each service, search the project files for violations of the rules. Focus on:

**Firebase**
- Queries without `limit()` — search `query(collection(` not followed by `limit(`, then keep only those reaching `getDocs` or `onSnapshot`; a query passed only to an aggregation is compliant
- Client `limit()` above 100 — a violation even when commented; server-side, a warning unless unbounded
- `getDocs` followed by `.length` or `.size` — anti-pattern for counting
- Queries inside loops (`for`, `forEach`, `map`) — N+1 reads
- `onSnapshot` without unsubscribe at consumer teardown

**Klaviyo**
- Single-call subscribe with profile data mixed in (400-prone)
- Missing 409 → PATCH fallback on profile creation
- `double_opt_in` list setting references in comments or config
- Klaviyo script loaded eagerly (not via `requestIdleCallback`) — check every caller of the loader, not only the entry point
- Klaviyo script loaded on an authenticated route (violation), or a public route excluded from loading without a stated reason (warning)
- Client-side `_learnq` usage without server-side guarantee

**GTM / gtag**
- `dataLayer.push(['consent',` — Array format instead of `gtag()`
- Missing `ensureGtag()` call before consent commands
- `gtag` defined as arrow function (breaks `arguments`)
- `syncConsentToDataLayer()` not called in `onload` callback of GTM script
- Missing `gtm_ga4_enabled` variable in `cookie_consent_updated` push

**Clarity**
- `window.clarity` called with neither a `typeof window.clarity === 'function'` check nor optional chaining — crashes if script blocked
- `window.clarity('set', 'userId', <email_or_pii>)` — PII in Clarity sessions (RGPD violation); caller-supplied params serialized as-is are a warning
- Clarity script loaded eagerly (not deferred to consent change and application mount)
- Missing `initClarityQueue()` call before injecting the Clarity script
- Conversion events sent to Clarity (they should go via `pushGtmEvent` only, no Clarity push)

**Stripe**
- Key value (`sk_live_…`, `rk_live_…`, `sk_test_…`, `rk_test_…` followed by the key body) in source, or a full secret key where a restricted key fits — a bare prefix used to refuse a key is compliant
- Global key pattern (`stripe.api_key =`, `Stripe.setApiKey`) or client instantiated in more than one application module (standalone scripts excepted); `apiVersion` not pinned or not shared
- `payment_method_types` passed outside Terminal
- `checkout.sessions.create` without `integration_identifier`, or with a label lacking the 8-random-letter suffix
- Charges, Sources, Tokens API or Card Element
- Webhook event built from a parsed body, or processed without `constructEvent` signature verification
- Webhook without `event.id` idempotence, or swallowing a processing failure with a 2xx
- Subscription state copied from the event payload instead of re-read from Stripe
- Fulfillment or entitlement granted from the success/return page
- Return URL taken from client input without an origin allow-list
- Scheduled cancellation read from `cancel_at_period_end` alone (ignores `cancel_at`)
- `current_period_end` read on the subscription instead of the item
- Stripe error message returned to the client, or event body / key logged
- Hard-coded price identifiers
- Account deletion that leaves the Stripe customer in place

**PageSpeed / Perf** *(explicit only — run with `services=perf`)*
- `<picture>` wrapper on above-fold hero `<img>` — causes ERR_ABORTED + Inspector Issue `(*.vue)`
- `<img>` hero missing `fetchpriority="high"` on `<link rel="preload">` `(nuxt.config.ts, app.vue)`
- `<link rel="preload" as="font">` without `crossorigin` attribute `(nuxt.config.ts, app.vue)`
- Font preload pointing to a hashed `/_nuxt/` path (changes on every build — breaks preload) `(nuxt.config.ts, app.vue)`
- `preconnect` on origins whose scripts are loaded lazily (should be `dns-prefetch`) `(nuxt.config.ts)`
- `transition-all` or `transition: all` `(*.vue, *.css)`
- Third-party scripts (GTM, Klaviyo, Clarity) not wrapped in `requestIdleCallback` or lazy plugin `(plugins/*.client.js)`

### Step 4 — Classify findings

| Severity | Meaning |
|---|---|
| 🔴 Violation | Rule broken — fix before shipping |
| 🟡 Warning | Pattern that may cause issues in edge cases |
| ✅ Compliant | Rule correctly applied — noted for confidence |

### Step 5 — Output report

```
## overcode service audit — <project_name>

Services detected: firebase, klaviyo, gtm

### Firebase
🔴 Violation — query without limit()
  composables/useSearch.js:42
  `query(collection(db, "offers"))` — missing limit()

✅ Compliant — count() used for aggregation
  composables/useStats.js:18

### Klaviyo
🟡 Warning — no 409→PATCH fallback found
  functions/subscribeUser/index.js:31
  POST /profiles without catch for 409

### GTM
🔴 Violation — Array format for consent command
  composables/useCookieConsent.js:18
  `dataLayer.push(['consent', 'default', ...])` — use window.gtag()

### Clarity
✅ Compliant — initClarityQueue called before script injection
  plugins/lazy-analytics.client.js:28

🔴 Violation — conversion event sent to Clarity
  composables/useTrackEvent.js:55
  `pushClarityEvent('signup_completed')` — conversion events go through pushGtmEvent only

---
Violations: 3  |  Warnings: 1  |  Compliant: 2
Fix violations before shipping. Warnings are advisory.
```

## Notes

- Read only — does not modify any file.
- If no violations found for a service, print `✅ <Service> — no violations found`.
- Ignore `node_modules/`, `.git/`, `coverage/`, `dist/`.
- A detection signal counts only in source code, a dependency manifest, or configuration — never in documentation, installed rule files, or a skill's own references.
