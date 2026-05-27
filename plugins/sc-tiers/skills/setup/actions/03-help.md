# Action 03 — help

Provide integration context for a specific third-party service. Designed to be called by another skill (planner, implementer) that needs the rules and patterns before generating integration code.

## Inputs

- `service` (required): name of the service to get help for.
  Accepted values: `firebase`, `klaviyo`, `gtm`, `gtag`, `meta-pixel`, `meta`, `clarity`, `pagespeed`, `psi`, `lighthouse`, `perf`.

## Service → reference mapping

| Input value(s) | Reference file | Covers |
|---|---|---|
| `firebase` | `references/03-firebase-resources.md` | Firestore queries, security rules, quotas |
| `klaviyo` | `references/09-klaviyo.md` | API auth, 2-step subscribe, lists, lazy load, E2E |
| `gtm`, `gtag`, `meta-pixel`, `meta` | `references/10-gtm-consent-meta.md` | Consent Mode v2, ensureGtag, cookie_consent_updated, Meta Pixel, push taxonomy |
| `clarity` | `references/11-clarity.md` | Best-effort model, consent-gated, queue init, dual push, E2E patterns |
| `pagespeed`, `psi`, `lighthouse`, `perf` | `references/12-pagespeed-insights.md` | PSI variance, deterministic metrics, Nuxt 3 perf checklist, anti-patterns |

If multiple related services are requested (e.g. `gtm,meta-pixel`), serve the same reference file once.

## Process

1. Read the reference file corresponding to the requested service.
2. Output the full reference content verbatim, preceded by a one-line framing header.
3. Append a **Quick checklist** at the end summarising the 3–5 most common mistakes for this service.

## Output format

```
## sc-tiers help — <service>

<full content of the reference file>

---
### Quick checklist — <service>
Before submitting code that uses <service>, verify:
- [ ] <most common mistake 1>
- [ ] <most common mistake 2>
- [ ] <most common mistake 3>
- [ ] <most common mistake 4>
- [ ] <most common mistake 5>
```

### Quick checklists by service

**firebase**
- [ ] Every `query()` has a `limit()` clause
- [ ] Counting uses `getAggregateFromServer` + `count()`, not `getDocs().length`
- [ ] No Firestore calls inside loops
- [ ] `onSnapshot` listeners are unsubscribed in `onUnmounted`
- [ ] Admin role checked via custom claim, not Firestore document lookup

**klaviyo**
- [ ] Profile creation (POST /profiles) and subscription (POST /profile-subscription-bulk-create-jobs) are two separate calls
- [ ] POST /profiles has a 409 → PATCH fallback
- [ ] Newsletter opt-out updates a profile property, does not remove from list
- [ ] Klaviyo script loaded via `requestIdleCallback`, not eagerly
- [ ] `KLAVIYO_PRIVATE_KEY` is in Cloud Functions secrets, not in client bundle

**gtm / gtag / meta-pixel**
- [ ] Consent commands use `window.gtag('consent', ...)`, not `dataLayer.push(['consent', ...])`
- [ ] `ensureGtag()` is called before any consent command
- [ ] `window.gtag` is defined as a `function` expression (not arrow) — `arguments` must be available
- [ ] `syncConsentToDataLayer()` is called both before GTM injection and in its `onload` callback
- [ ] `cookie_consent_updated` push includes `gtm_ga4_enabled: Boolean(categories.analytics)`

**clarity**
- [ ] `window.clarity` calls guarded with optional chaining or `typeof` check — script may be blocked
- [ ] No PII (email, uid, phone) passed via `window.clarity('set', ...)` — RGPD violation
- [ ] Clarity loaded only when `isCategoryEnabled('behavior')` is true — not with analytics consent
- [ ] `initClarityQueue()` called before injecting the script (`typeof window.clarity === 'function'` guard)
- [ ] Conversion events (`email_verified`, `signup_*`) go via `pushGtmEvent` only — not duplicated to Clarity

**pagespeed / psi / perf**
- [ ] Primary deterministic metric defined before coding (bytes saved, chunks blocked, requests removed)
- [ ] Baseline captured with 3–5 PSI mobile runs at 5-min intervals — not a single run
- [ ] Above-fold hero uses `<img :src="webp">` directly — no `<picture>` wrapper (ERR_ABORTED risk)
- [ ] `<link rel="preload" as="font">` points to a stable public URL (`/fonts/...`), not a hashed `/_nuxt/` path
- [ ] Third-party scripts (GTM, Klaviyo, Clarity) loaded lazily, not in `<head>` synchronously

## Usage by other skills

When a planner or implementer skill needs to integrate a third-party service, it should call this action first to load the rules into context before generating any code:

```
Before implementing the Klaviyo integration, call `/sc-tiers:setup help klaviyo`
to load the authoritative patterns into context.
```

The calling skill must include the output of `help` as constraints when planning or generating code.
