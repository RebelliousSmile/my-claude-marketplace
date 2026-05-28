# 01 - Tail

Display the last N lines from one or more Rust application log sources in a given environment.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `app,web-server`) — comma-separated alias(es) from `references/environments.md`
- `lines` (optional, default: `50`) — number of lines per source

## Outputs

```
=== [docker] app — container stdout — last 50 lines ===
2026-05-27T09:12:34.123Z ERROR orders::service: order creation failed id=42 err=DatabaseError(connection refused)
2026-05-27T09:12:34.456Z  WARN orders::handler: slow request duration_ms=2341 path="/api/orders"
...

=== [docker] web-server — nginx stdout — last 50 lines ===
192.168.1.1 - - [27/May/2026:09:12:34 +0000] "POST /api/orders HTTP/1.1" 500 0
...
```

## Process

1. Detect `env` if not specified: check for `docker-compose.yml` or running containers → `docker`; else `local`.
2. If `prod`, resolve SSH target (see `references/environments.md` — SSH target resolution).
3. For `docker`: discover Rust app container and nginx/reverse-proxy container via `docker ps`.
4. Resolve each source alias to container/path using `references/environments.md`.
5. Build and run the fetch command:
   - `local`: `tail -n <lines> <path>` (or read from stdout if binary run in foreground)
   - `docker` (stdout/stderr): `docker logs --tail <lines> <container>`
   - `docker` (file source): `docker exec <container> tail -n <lines> <path>`
   - `prod`: `ssh <host> "tail -n <lines> <path>"`
6. Print each source under a labeled header `=== [env] source — location — last N lines ===`.
7. Truncate individual lines to 300 chars — **exception**: never truncate mid-panic backtrace. Keep the entire backtrace intact.
8. Detect log format from the first lines: `tracing` compact/pretty, `tracing` JSON, `env_logger`, or structured key-value. Note the detected format in output.
9. Count ERROR-level or panic lines; if > 0, suggest running `parse-errors`.

## Test

In a project with Docker: `docker ps` shows at least one container; `docker logs --tail 5 <container>` exits 0.
