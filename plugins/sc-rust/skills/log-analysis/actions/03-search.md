# 03 - Search

Search for a specific string, span name, target module, or HTTP status code across Rust log output.

## Inputs

- `pattern` (required) — plain string, module path, span name, or HTTP status code (e.g. `500`, `orders::service`, `order creation failed`, `panicked`)
- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: all sources for the env) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, date

## Outputs

```
=== Search: "panicked" in [docker] app ===
2 matches:

L1023: thread 'tokio-runtime-worker' panicked at 'called `Option::unwrap()` on a `None` value',
       src/service/order.rs:67
L1024: stack backtrace:
L1025:    0: rust_begin_unwind
           ...
L1047: (end of backtrace)

Total: 2 matches across 1 source.
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. If `pattern` is a 3-digit 4xx/5xx status code, auto-include `web-server` in sources.
3. If `pattern` is `panicked` or `SIGSEGV`: also collect the full backtrace following each match.
4. Build the grep command:
   - Default mode: `grep -F` (fixed-string).
   - Regex mode: `grep -E` only when user says "regex" or pattern is clearly a regex.
   - Local: `grep -nF -- '<escaped>' <path>`
   - Docker: `docker exec <container> grep -nF -- '<escaped>' <path>` or `docker logs <container> 2>&1 | grep -nF`
   - Prod SSH — escape pattern:
     ```bash
     SAFE=$(printf '%s' '<pattern>' | sed "s/'/'\\\\''/g")
     ssh <host> "grep -nF -- '$SAFE' <path>"
     ```
5. For JSON-format tracing: if searching for a field value (e.g. `order_id=42`), search within the JSON `fields` object as well as the raw line.
6. If `since` provided: for docker stdout sources use `docker logs --since <duration> 2>&1 | grep -F`; for file sources apply timestamp filter first (see `references/log-formats.md`).
7. For panic searches: after the matching line, include the next N lines forming the backtrace (up to the next log entry or `(end of backtrace)`).
8. Print matches per source with line numbers under a labeled header. Keep panics and backtraces intact.
9. Truncate non-backtrace lines to 300 chars.
10. Report match count per source and grand total.
11. If 0 matches: suggest broader pattern or different `env`.

## Test

Docker project: `docker logs <container> 2>&1 | wc -l` returns a non-negative integer.
