# 04 - Summarize

Produce a period digest across all log sources: error counts by severity, top recurring errors, HTTP status distribution.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `since` (optional, default: `24h`) — time filter

## Outputs

```
## Log summary — [docker] — last 24h

### PHP errors
- Total: 12  (Fatal: 2 · Warning: 8 · Notice: 2)
- Top error: "Uncaught TypeError in index.php:3405" × 2

### Apache access
- Total requests: 348
- 5xx: 3 (0.9%)  ·  4xx: 12 (3.4%)  ·  2xx: 333 (95.7%)

### Nginx
- Error log: 0 entries

### Recommendations
- ⚠ Investigate Fatal error at index.php:3405 — 2 occurrences in 24h.
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. For `docker`: discover containers if needed.
   - `docker-*` sources: `docker logs --since <since> <container>` (default `--since 24h`).
   - File sources: apply timestamp filter from `references/log-formats.md` — Strategy A for `since ≥ 1 day`, Strategy B (PHP one-liner) otherwise.
3. Fetch all default sources: `php`, `apache-error`, `nginx-error`, `apache-access` (see `references/environments.md`).
4. **PHP errors** — parse using `references/log-formats.md`:
   - Count by severity.
   - Find top 3 recurring messages (by normalized group).
5. **Apache access** — extract HTTP status codes via `awk '{print $9}'`:
   - Count 2xx, 3xx, 4xx, 5xx; compute percentages.
   - Response time: Combined Log Format has no `%D`/`%T` by default — if timing data is absent, note it as `[timing not available — add %D to Apache LogFormat to enable]`.
6. **Nginx error** — count non-empty lines by level.
7. Compose the summary markdown.
8. **Recommendations** section — add an entry for:
   - Any Fatal error (always actionable).
   - 5xx rate > 1% (investigate endpoint).
   - Single error message appearing > 10 times (systemic issue).
9. If a source is not found or empty, mark it `[no data]` and continue.

## Test

Output contains at least "PHP errors" and "Apache access" sections with numeric counts ≥ 0; no crash on empty logs.
