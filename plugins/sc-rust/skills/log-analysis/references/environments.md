# Environments — detection and log paths

## env: local (host filesystem or terminal)

Detection: no Docker running, or user explicitly says "local".

Rust applications log to stderr/stdout by default. Check:
1. Is the binary running in the foreground? → output is in the terminal (ask user to redirect or use `script`)
2. Is there a log file configured via `RUST_LOG_FILE` env var or `tracing_appender`? → use that path
3. Systemd service: `journalctl -u <service-name> -n 50`
4. Fallback: `/var/log/<service-name>.log` or `./logs/app.log`

Check `RUST_LOG` env var to understand the configured log level.

Commands: plain `tail`, `grep`, `journalctl`.

## env: docker (Docker containers)

Detection: `docker-compose.yml` or `compose.yml` found in project root, OR `docker ps` returns running containers.

### Discovery steps

1. Run `docker ps --format "{{.Names}}\t{{.Image}}"` to list running containers.
2. Identify Rust app container: image name contains the binary name, `rust`, or is a scratch/distroless image; container name suggests `api`, `web`, `app`, `backend`, `server`.
3. Identify Nginx/reverse-proxy container: image contains `nginx`, `traefik`, `caddy`.
4. Rust apps typically log to stderr — always capture with `2>&1` in docker logs commands.

### Standard log sources inside containers

| Source alias | Typical container | Fetch command |
|---|---|---|
| `app` | Rust binary | `docker logs --tail N <c> 2>&1` |
| `web-server` | nginx/traefik/caddy | `docker logs --tail N <c>` |
| `app-file` | Rust binary (file appender) | `docker exec <c> tail -n N /app/logs/app.log` |

Detect log format from first lines:
- Starts with ISO timestamp → tracing compact/JSON
- Starts with `[YYYY-MM-DD` → env_logger
- Starts with `{` → JSON (parse as NDJSON)

Check `RUST_LOG` env var in the container: `docker exec <c> env | grep RUST_LOG`

## env: prod (remote SSH)

Detection: user mentions "production", "prod", "server", or "remote".

### SSH target resolution

1. Check `~/.ssh/config` for a host matching `*prod*` or `*server*` — use that alias.
2. If none found, ask: "SSH target for production? (user@host or ~/.ssh/config alias)"
3. Never store or print the SSH key path.

### Remote log paths

- systemd service: `ssh <host> "journalctl -u <service> -n 50 --no-pager"`
- Log file: `ssh <host> "tail -n N /app/logs/app.log"` or resolve from `systemd` unit `StandardOutput=file:/...`
- Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

For grep: always escape the pattern — see `03-search.md` step 4.

## Default source sets

| Action | Default sources |
|---|---|
| `tail` | `app`, `web-server` |
| `parse-errors` | `app`, `web-server` |
| `search` | all sources for the env |
| `summarize` | `app`, `web-server` |
