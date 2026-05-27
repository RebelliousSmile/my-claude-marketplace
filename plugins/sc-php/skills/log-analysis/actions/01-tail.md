# 01 - Tail

Display the last N lines from one or more log sources in a given environment.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `php,apache-error`) — comma-separated alias(es) from `references/environments.md`
- `lines` (optional, default: `50`) — number of lines per source

## Outputs

```
=== [docker] php — /var/log/php_errors.log — last 50 lines ===
[27-May-2026 09:12:34 UTC] PHP Fatal error: Uncaught TypeError in index.php:3405
...

=== [docker] apache-error — /var/log/apache2/error.log — last 50 lines ===
[Wed May 27 09:12:30.123456 2026] [php7:error] [pid 42] AH01215: ...
...
```

## Process

1. Detect `env` if not specified: check for `docker ps` running containers or `docker-compose.yml` → `docker`; else `local`.
2. If `prod`, resolve SSH target (see `references/environments.md` — SSH target resolution).
3. For `docker`: discover PHP/Apache and Nginx containers via `docker ps` if not already known.
4. Resolve each source alias to container/path using `references/environments.md`.
5. Build and run the fetch command:
   - `local`: `tail -n <lines> <path>`
   - `docker` (file source): `docker exec <container> tail -n <lines> <path>`
   - `docker` (docker-* source): `docker logs --tail <lines> <container>`
   - `prod`: `ssh <host> "tail -n <lines> <path>"`
6. Print each source under a labeled header `=== [env] source — path — last N lines ===`.
7. Truncate each line to 300 chars.
8. If file not found: `[not found: <path>]` and continue.
9. Count ERROR/Fatal lines across all output; if > 0, suggest running `parse-errors`.

## Test

In a project with Docker running: `docker ps` shows at least one container; `docker exec <php-container> tail -n 5 /var/log/php_errors.log` exits 0 (file exists or is empty).
