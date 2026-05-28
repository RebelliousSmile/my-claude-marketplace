# Environments — detection and log paths

## env: local (host filesystem)

Detection: no Docker running, or user explicitly says "local".

**Step 1 — resolve PHP error_log:**
```bash
php -r "echo ini_get('error_log');"
```
Use whatever path is returned. If empty or `no value`, fall back to:
- `/var/log/php_errors.log`
- `/var/log/apache2/error.log` (PHP errors merged with Apache when using `mod_php`)
- `/usr/local/var/log/php_errors.log` (Homebrew macOS)
- `./storage/logs/laravel.log` (Laravel)
- `./var/log/*.log` (Symfony)

**Apache:** `${APACHE_LOG_DIR}/error.log` and `access.log` — typically `/var/log/apache2/`.
**Nginx:** `/var/log/nginx/error.log` and `access.log`.

Commands: plain `tail`, `grep`, `cat`.

## env: docker (Docker containers)

Detection: `docker-compose.yml` or `compose.yml` found in project root, OR `docker ps` returns running containers.

### Discovery steps

1. Run `docker ps --format "{{.Names}}\t{{.Image}}"` to list running containers.
2. Identify PHP/Apache container: image contains `php`, `apache`, `httpd`, or container name suggests `api`, `web`, `app`.
3. Identify Nginx container: image contains `nginx` or `proxy`.
4. Identify MariaDB/MySQL container: image contains `mariadb`, `mysql`.

### Standard log paths inside containers

| Source alias    | Typical container  | Path                                | Command                              |
| --------------- | ------------------ | ----------------------------------- | ------------------------------------ |
| `php`           | PHP/Apache         | /var/log/php_errors.log             | `docker exec <c> tail -n N <path>`   |
| `apache-error`  | PHP/Apache         | /var/log/apache2/error.log          | `docker exec <c> tail -n N <path>`   |
| `apache-access` | PHP/Apache         | /var/log/apache2/access.log         | `docker exec <c> tail -n N <path>`   |
| `nginx-error`   | Nginx              | /var/log/nginx/error.log            | `docker exec <c> tail -n N <path>`   |
| `nginx-access`  | Nginx              | /var/log/nginx/access.log           | `docker exec <c> tail -n N <path>`   |
| `docker-php`    | PHP/Apache         | stdout/stderr                       | `docker logs --tail N <c>`           |
| `docker-nginx`  | Nginx              | stdout/stderr                       | `docker logs --tail N <c>`           |

If the standard path does not exist, run `docker exec <c> php -r "echo ini_get('error_log');"` to resolve the actual PHP error_log path.

## env: prod (remote SSH)

Detection: user mentions "production", "prod", "server", or "remote".

### SSH target resolution

1. Check `~/.ssh/config` for a host matching `*prod*` or `*server*` — use that alias.
2. If none found, ask user: "SSH target for production? (user@host or ~/.ssh/config alias)"
3. Never store or print the SSH key path, hostnames, or tokens that may appear in grepped log lines.
4. Reading system logs (`/var/log/`) may require `sudo` — if a command returns `Permission denied`, retry with `sudo` or ask the user to run `sudo chmod +r <path>` on the server.

### Remote log paths (same as local defaults)

- PHP: resolve via `ssh <host> "php -r \"echo ini_get('error_log');\""` or use `/var/log/php_errors.log`.
- Apache error: `/var/log/apache2/error.log`
- Apache access: `/var/log/apache2/access.log`
- Nginx error: `/var/log/nginx/error.log`
- Nginx access: `/var/log/nginx/access.log`
- Laravel: `ssh <host> "tail -n N /var/www/html/storage/logs/laravel.log"`

Commands: `ssh <host> "tail -n N <path>"`. For grep, always escape the pattern — see `03-search.md` step 4 (SSH safe grep).

## Default source sets

| Context          | Default sources                                         |
| ---------------- | ------------------------------------------------------- |
| `tail`           | `php`, `apache-error`                                   |
| `parse-errors`   | `php`, `apache-error`                                   |
| `search`         | all sources for the env                                 |
| `summarize`      | `php`, `apache-error`, `nginx-error`, `apache-access`   |
