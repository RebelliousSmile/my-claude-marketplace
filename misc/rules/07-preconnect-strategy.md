# Preconnect strategy

## Rule

Use `preconnect` only for origins on the **critical render path**.
Use `dns-prefetch` for deferred or interaction-triggered scripts.

| Resource type | Hint |
|---|---|
| Above-fold image CDN, font CDN | `preconnect` |
| Deferred analytics (GTM, Klaviyo, Clarity) | `dns-prefetch` |
| Unused origin (no actual request confirmed) | remove |

## Before adding a preconnect

Always verify the origin is actually used:

```bash
grep -r "fonts.googleapis\|fonts.gstatic\|<origin>" assets/ pages/ components/ nuxt.config.ts
```

If 0 results → remove the preconnect.

## Why

`preconnect` establishes TCP + TLS immediately (~150ms per connection).
For deferred scripts (loaded after interaction or idle), this wastes the connection before it's needed.
`dns-prefetch` resolves DNS only (~20ms) — appropriate for scripts not on the critical path.

## Current origins in nuxt.config.ts

| Origin | Type | Reason |
|---|---|---|
| `firebasestorage.googleapis.com` | `preconnect` | User profile images, above-fold |
| `images.pexels.com` | `preconnect` | HeadTitle background images, many pages |
| `www.googletagmanager.com` | `dns-prefetch` | GTM deferred via requestIdleCallback |
| `static.klaviyo.com` | `dns-prefetch` | Klaviyo deferred via requestIdleCallback |
| `www.clarity.ms` | `dns-prefetch` | Clarity deferred via requestIdleCallback |
