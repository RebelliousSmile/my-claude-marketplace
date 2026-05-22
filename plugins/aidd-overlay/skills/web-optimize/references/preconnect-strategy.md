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
grep -r "<origin>" assets/ pages/ components/ nuxt.config.ts
```

If 0 results → remove the preconnect.

## Why

`preconnect` establishes TCP + TLS immediately (~150ms per connection).
For deferred scripts (loaded after interaction or idle), this wastes the connection before it's needed.
`dns-prefetch` resolves DNS only (~20ms) — appropriate for scripts not on the critical path.
