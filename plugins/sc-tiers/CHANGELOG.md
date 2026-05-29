# Changelog — sc-tiers

> Baseline établie le 2026-05-29 à partir de l'état courant. Détail : `git log -- plugins/sc-tiers`.

## [0.2.0] — 2026-05-29 (baseline)

Règles de consommation de SaaS tiers. Skill unique : `setup` (actions install / verify / help).

Couverture : Firebase (Firestore query limits, security rules, quotas, Auth listeners, Hosting trailing slash & cache, Playwright Firebase auth), Klaviyo (subscribe 2 temps, 409→PATCH), GTM Consent Mode v2 + Meta Pixel, Microsoft Clarity (best-effort, consent-gated, E2E), PageSpeed Insights / Lighthouse (variance, métriques déterministes, checklist Nuxt 3). Data pivots : Supabase, DynamoDB, Hasura, Firebase.

## Antérieur
- Voir `git log -- plugins/sc-tiers` pour l'historique complet.
