---
name: setup
model: sonnet
description: >-
  Installs third-party SaaS consumption rules to the current project's .claude/rules/.
  Use when integrating Firebase, Klaviyo, GTM/Meta Pixel (or other SaaS) and the consumption rules are missing.
  Covers: Firestore query limits, security rules, quota awareness,
  Auth listener cleanup, Hosting trailing slash and cache headers,
  Playwright Firebase auth patterns, Klaviyo API patterns,
  GTM Consent Mode v2, Meta Pixel consent integration,
  Microsoft Clarity (best-effort, consent-gated, E2E patterns),
  PageSpeed Insights / Lighthouse (PSI variance, deterministic metrics, Nuxt checklist).
  Do NOT use to update a single rule — edit it directly instead.
---

# sc-tiers Setup

Installs the full set of third-party SaaS consumption rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all SaaS consumption rule files to `.claude/rules/` | current project path |
| 02 | `verify` | Audit the project code against installed SaaS rules | current project (auto-detected) |
| 03 | `help` | Provide integration context for a specific service to a calling skill | service name |

## Default flow

Trigger-to-action mapping:

- "install", "setup", "add rules", default invocation → `install`
- "verify", "audit", "check", "validate", "compliance" → `verify`
- "help", "how to integrate", "rules for", "guide for" + service name → `help`

## References

### Coding rules

- `references/03-firebase-resources.md` — Firestore query limits, count(), batch reads, security rules, quotas
- `references/04-firebase-auth-listeners.md` — onAuthStateChanged one-shot cleanup pattern
- `references/4-firebase-hosting-trailing-slash.md` — trailingSlash: false, cache headers glob
- `references/05-playwright-firebase-auth.md` — Firebase auth patterns in Playwright (networkidle, admin flow, custom claims)
- `references/09-klaviyo.md` — Klaviyo API patterns : 2-step subscribe, 409→PATCH, listes séparées par type, lazy loading, test cleanup
- `references/10-gtm-consent-meta.md` — GTM Consent Mode v2 : format gtag() vs Array, ensureGtag(), Meta Pixel consent, taxonomie pushEvent/pushGtmEvent, déduplication sessionStorage
- `references/11-clarity.md` — Microsoft Clarity : modèle best-effort, consent behavior, queue init, dual push GTM+Clarity, tests E2E (smoke, résilience, garde-fou perf)
- `references/12-pagespeed-insights.md` — PSI / Lighthouse : variance ±29 pts, signal déterministe, protocole 5 runs, checklist Nuxt 3 (LCP/CLS/INP/TBT/bundle/cache/SSR), anti-patterns

### Data pivots (consumed by `data-optimize`)

- `references/08-data-pivots-firebase.md` — Firestore reads accounting, real-time listeners, security rules

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
