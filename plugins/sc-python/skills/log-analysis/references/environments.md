# Environments — detection and log paths

## env: local (host filesystem)

Detection: no Docker running, or user explicitly says "local".

Resolve log path:
1. Check `settings.py` or `pyproject.toml` for `LOGGING` configuration → `filename` key
2. Check `LOG_FILE` or `LOG_PATH` environment variable
3. Fallback paths:
   - `/app/logs/app.log`
   - `./logs/app.log`
   - `./app.log`
   - Django: `./storage/logs/django.log` (if using django-log-request-id or similar)

Web server (uvicorn/gunicorn): check for `--log-config` or `--access-log` flags in `Procfile` or `docker-compose.yml`. Default: stdout.

Commands: plain `tail`, `grep`, `cat`.

## env: docker (Docker containers)

Detection: `docker-compose.yml` or `compose.yml` found in project root, OR `docker ps` returns running containers.

### Discovery steps

1. Run `docker ps --format "{{.Names}}\t{{.Image}}"` to list running containers.
2. Identify Python app container: image contains `python`, `django`, `fastapi`, `uvicorn`, `gunicorn`, or container name suggests `api`, `web`, `app`, `backend`.
3. Identify Nginx/reverse-proxy container: image contains `nginx`, `traefik`, or `proxy`.
4. Identify Celery worker container: image or command contains `celery`.
5. Identify Redis container: image contains `redis` (useful for Celery broker context).

### Standard log sources inside containers

| Source alias | Typical container | Path / command | Fetch command |
|---|---|---|---|
| `app` | Python app | stdout/stderr | `docker logs --tail N <c>` |
| `app-file` | Python app | `/app/logs/app.log` | `docker exec <c> tail -n N <path>` |
| `web-server` | nginx/traefik | stdout/stderr | `docker logs --tail N <c>` |
| `celery` | Celery worker | stdout/stderr | `docker logs --tail N <c>` |
| `celery-beat` | Celery beat | stdout/stderr | `docker logs --tail N <c>` |

If `/app/logs/app.log` does not exist: check `DJANGO_LOG_FILE` env var in the container with `docker exec <c> env | grep LOG`.

## env: prod (remote SSH)

Detection: user mentions "production", "prod", "server", or "remote".

### SSH target resolution

1. Check `~/.ssh/config` for a host matching `*prod*` or `*server*` — use that alias.
2. If none found, ask: "SSH target for production? (user@host or ~/.ssh/config alias)"
3. Never store or print the SSH key path.

### Remote log paths

- App log: resolve via `ssh <host> "python3 -c \"import logging; print(logging.getLogger().handlers)\""` or use `/app/logs/app.log`.
- Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- Gunicorn: check `supervisor.conf` or `systemd` unit for `--access-logfile` flag.

Commands: `ssh <host> "tail -n N <path>"`. For grep, always escape the pattern (see `03-search.md` step 4).

## Default source sets

| Action | Default sources |
|---|---|
| `tail` | `app`, `web-server` |
| `parse-errors` | `app`, `web-server` |
| `search` | all sources for the env |
| `summarize` | `app`, `web-server`, `celery` (if detected) |
