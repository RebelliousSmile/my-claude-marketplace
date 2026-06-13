# sc-tiers

*Règles de consommation de services SaaS tiers : Firebase, Klaviyo, GTM/Meta Pixel, Microsoft Clarity, PageSpeed Insights.*

Installe dans le projet les règles d'usage des SaaS tiers (quotas, sécurité, consentement, performance) et les data pivots associés, consommés par `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `setup` | `/sc-tiers:setup` | Installe les règles de consommation SaaS dans `.claude/rules/` — install, verify (audit du code contre les règles), help (contexte d'intégration pour un service) |

Couvre : Firestore (limites de requêtes, security rules, quotas), Auth listeners, Hosting (trailing slash, cache headers), Playwright + Firebase Auth, Klaviyo (subscribe 2 temps, 409→PATCH), GTM Consent Mode v2 + Meta Pixel, Microsoft Clarity (best-effort, consent-gated), PageSpeed Insights / Lighthouse (variance, métriques déterministes, checklist Nuxt 3). Data pivots : Supabase, DynamoDB, Hasura, Firebase.

## Licence

MIT — voir [LICENSE](../../LICENSE).
