# 03 - Search

Search for a specific string, regex, HTTP status code, or PHP action name across log files.

## Inputs

- `pattern` (required) — plain string, regex, or HTTP status code (e.g. `500`, `Uncaught`, `POST /api`)
- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: all sources for the env) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, date

## Outputs

```
=== Search: "500" in [docker] apache-access ===
4 matches:

L1847: 192.168.1.1 - - [27/May/2026:09:12:34 +0000] "POST /index.php?action=Foo HTTP/1.1" 500 1234
L1901: 192.168.1.2 - - [27/May/2026:09:15:02 +0000] "POST /index.php?action=Bar HTTP/1.1" 500 987
...

Total: 4 matches across 1 source(s).
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. For `docker`: discover containers if needed.
3. If `pattern` is a 3-digit 4xx/5xx number, auto-include `apache-access` and `nginx-access` in sources.
4. Build the grep command:
   - Default mode: `grep -F` (fixed-string) — safe for any literal pattern, including special chars.
   - Regex mode: switch to `grep -E` only when user explicitly says "regex" or the pattern is clearly a regex.
   - Always add `--` before the path argument to prevent pattern-as-flag misinterpretation.
   - Local: `grep -nF -- '<escaped>' <path>`
   - Docker: `docker exec <container> grep -nF -- '<escaped>' <path>`
   - Prod SSH — escape the pattern to prevent shell injection:
     ```bash
     SAFE=$(printf '%s' '<pattern>' | sed "s/'/'\\\\''/g")
     ssh <host> "grep -nF -- '$SAFE' <path>"
     ```
5. If `since` provided: apply timestamp filter first — see [`references/log-formats.md` — Timestamp filtering](../references/log-formats.md).
6. Print matches per source with line numbers under a labeled header.
7. Truncate each match to 300 chars.
8. Report match count per source and grand total.
9. If 0 matches: suggest broader pattern or different `env`.
10. If matches include HTTP 5xx responses: offer to run `parse-errors` on same env.

## Test

On a project with Docker running: `docker exec <php-container> grep -c "" /var/log/apache2/access.log` exits 0.
